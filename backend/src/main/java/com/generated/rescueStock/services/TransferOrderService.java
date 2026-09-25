package com.generated.rescueStock.services;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import com.generated.rescueStock.constants.ErrorCodes;
import com.generated.rescueStock.constants.ErrorMessages;
import com.generated.rescueStock.constants.LogTemplates;
import com.generated.rescueStock.constructors.TransferOrderDtoFactory;
import com.generated.rescueStock.models.InventoryBatch;
import com.generated.rescueStock.models.TransferOrder;
import com.generated.rescueStock.repositories.InventoryBatchRepository;
import com.generated.rescueStock.repositories.TransferOrderRepository;
import com.generated.rescueStock.types.TransferOrderPayload;

/**
 * 移库单核心事务：
 * 1) 提交时校验「来源/目标不同仓、批次无在途单、可用库存充足」，随后冻结来源数量（仅记录在途，不扣库存）；
 * 2) 目标仓确认收货时重新比对提交时的来源批次库存与冻结总量快照，任一发生变化即停止入账。
 */
@Service
public class TransferOrderService {
  private static final Logger audit = LoggerFactory.getLogger("AUDIT");
  private static final DateTimeFormatter NO_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneId.systemDefault());
  private final TransferOrderRepository transferRepo;
  private final InventoryBatchRepository batchRepo;

  public TransferOrderService(TransferOrderRepository transferRepo, InventoryBatchRepository batchRepo) {
    this.transferRepo = transferRepo;
    this.batchRepo = batchRepo;
  }

  public List<Map<String, Object>> list() {
    return transferRepo.findAll().stream().map(TransferOrderDtoFactory::toResponse).toList();
  }

  /** 仓库员提交移库单：来源数量先冻结 */
  public synchronized Map<String, Object> create(TransferOrderPayload payload) {
    if (payload == null
        || payload.sourceWarehouseId() == null
        || payload.targetWarehouseId() == null
        || payload.sourceBatchId() == null
        || payload.quantity() == null
        || payload.quantity() <= 0) {
      throw new TransferBusinessException(ErrorCodes.VALIDATION_FAILED, ErrorMessages.VALIDATION_FAILED);
    }
    if (Objects.equals(payload.sourceWarehouseId(), payload.targetWarehouseId())) {
      throw new TransferBusinessException(ErrorCodes.TRANSFER_WAREHOUSE_SAME, ErrorMessages.TRANSFER_WAREHOUSE_SAME);
    }

    InventoryBatch sourceBatch = batchRepo.findEntityById(payload.sourceBatchId())
        .filter(batch -> Objects.equals(batch.warehouseId, payload.sourceWarehouseId()))
        .orElseThrow(() -> new TransferBusinessException(ErrorCodes.VALIDATION_FAILED, ErrorMessages.VALIDATION_FAILED));

    // 同一批次同时只允许存在一张在途移库单
    transferRepo.findInTransitBySourceBatch(sourceBatch.id).ifPresent(existing -> {
      throw new TransferBusinessException(
          ErrorCodes.TRANSFER_BATCH_IN_TRANSIT,
          String.format(ErrorMessages.TRANSFER_BATCH_IN_TRANSIT, existing.transferNo));
    });

    int frozen = transferRepo.sumFrozenBySourceBatch(sourceBatch.id);
    int available = sourceBatch.quantity - frozen;
    if (payload.quantity() > available) {
      throw new TransferBusinessException(
          ErrorCodes.TRANSFER_INSUFFICIENT_STOCK,
          String.format(ErrorMessages.TRANSFER_INSUFFICIENT_STOCK, available, payload.quantity()));
    }

    Instant now = Instant.now();
    TransferOrder order = new TransferOrder();
    order.transferNo = nextTransferNo(now);
    order.sourceWarehouseId = payload.sourceWarehouseId();
    order.targetWarehouseId = payload.targetWarehouseId();
    order.sourceBatchId = sourceBatch.id;
    order.supplyItemId = sourceBatch.supplyItemId;
    order.batchNo = sourceBatch.batchNo;
    order.quantity = payload.quantity();
    order.status = "IN_TRANSIT";
    order.createdBy = payload.createdBy();
    order.createdAt = now;
    order.sourceQuantitySnapshot = sourceBatch.quantity;
    order.frozenTotalSnapshot = frozen + payload.quantity();
    order.remark = payload.remark();
    transferRepo.save(order);

    audit.info(String.format(LogTemplates.TRANSFER_CREATE, order.transferNo, order.batchNo, order.quantity));
    return TransferOrderDtoFactory.toResponse(order);
  }

  /** 目标仓确认收货：冻结数量转入库存；发现来源冻结数量已变化则停止入账 */
  public synchronized Map<String, Object> receive(Long id) {
    TransferOrder order = transferRepo.findById(id)
        .orElseThrow(() -> new TransferBusinessException(ErrorCodes.TRANSFER_ORDER_NOT_FOUND, ErrorMessages.TRANSFER_ORDER_NOT_FOUND));
    if (!"IN_TRANSIT".equals(order.status)) {
      throw new TransferBusinessException(
          ErrorCodes.TRANSFER_STATUS_CONFLICT,
          String.format(ErrorMessages.TRANSFER_STATUS_CONFLICT, order.status));
    }

    InventoryBatch sourceBatch = batchRepo.findEntityById(order.sourceBatchId)
        .orElseThrow(() -> new TransferBusinessException(ErrorCodes.TRANSFER_ORDER_NOT_FOUND, ErrorMessages.TRANSFER_ORDER_NOT_FOUND));

    int frozenNow = transferRepo.sumFrozenBySourceBatch(order.sourceBatchId);
    int quantityNow = sourceBatch.quantity;
    // 乐观校验：提交时的来源批次库存或冻结总量若已被其他业务改动，立即拦截
    if (frozenNow != order.frozenTotalSnapshot || quantityNow != order.sourceQuantitySnapshot) {
      audit.warn(String.format(LogTemplates.TRANSFER_RECEIVE_BLOCKED,
          order.transferNo, order.frozenTotalSnapshot, frozenNow, order.sourceQuantitySnapshot, quantityNow));
      throw new TransferBusinessException(
          ErrorCodes.TRANSFER_FROZEN_CHANGED,
          String.format(ErrorMessages.TRANSFER_FROZEN_CHANGED,
              order.frozenTotalSnapshot, frozenNow, order.sourceQuantitySnapshot, quantityNow));
    }

    // 目标仓同物资同批次合并入库，否则生成新批次
    InventoryBatch targetBatch = batchRepo
        .findByWarehouseAndBatch(order.targetWarehouseId, order.supplyItemId, order.batchNo)
        .orElseGet(() -> {
          InventoryBatch fresh = new InventoryBatch();
          fresh.warehouseId = order.targetWarehouseId;
          fresh.supplyItemId = order.supplyItemId;
          fresh.batchNo = order.batchNo;
          fresh.quantity = 0;
          fresh.expireAt = sourceBatch.expireAt;
          fresh.inboundSource = "移库入库";
          fresh.qualityStatus = sourceBatch.qualityStatus;
          return batchRepo.save(fresh);
        });
    targetBatch.quantity += order.quantity;
    batchRepo.save(targetBatch);

    // 来源仓实际扣减冻结数量
    sourceBatch.quantity -= order.quantity;
    batchRepo.save(sourceBatch);

    order.status = "POSTED";
    order.receivedAt = Instant.now();
    order.targetBatchId = targetBatch.id;
    transferRepo.save(order);

    audit.info(String.format(LogTemplates.TRANSFER_RECEIVE,
        order.transferNo, order.batchNo, order.quantity, order.targetWarehouseId));
    return TransferOrderDtoFactory.toResponse(order);
  }

  private String nextTransferNo(Instant now) {
    String day = NO_FORMAT.format(now);
    long seqInDay = transferRepo.findAll().stream().filter(o -> o.transferNo != null && o.transferNo.contains(day)).count() + 1;
    return String.format("YK%s%03d", day, seqInDay);
  }
}
