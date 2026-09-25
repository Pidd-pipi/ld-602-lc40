package com.generated.rescueStock.services;

import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import com.generated.rescueStock.constants.ErrorCodes;
import com.generated.rescueStock.constants.ErrorMessages;
import com.generated.rescueStock.constants.LogTemplates;
import com.generated.rescueStock.constants.TransferStatus;
import com.generated.rescueStock.models.InventoryBatch;
import com.generated.rescueStock.models.TransferLine;
import com.generated.rescueStock.models.TransferOrder;
import com.generated.rescueStock.repositories.InventoryBatchRepository;
import com.generated.rescueStock.repositories.TransferOrderRepository;
import com.generated.rescueStock.types.TransferLinePayload;
import com.generated.rescueStock.types.TransferOrderPayload;

@Service
public class TransferOrderService {
  private final TransferOrderRepository transferRepo;
  private final InventoryBatchRepository batchRepo;

  public TransferOrderService(TransferOrderRepository transferRepo, InventoryBatchRepository batchRepo) {
    this.transferRepo = transferRepo;
    this.batchRepo = batchRepo;
  }

  public List<TransferOrder> list() {
    return transferRepo.findAll();
  }

  /** 提交移库单：校验库存/在途占用 -> 写入快照 -> 在途冻结。 */
  public synchronized TransferOrder create(TransferOrderPayload payload) {
    Objects.requireNonNull(payload, "payload");
    if (Objects.equals(payload.sourceWarehouseId(), payload.targetWarehouseId())) {
      throw rule(ErrorCodes.TRANSFER_SAME_WAREHOUSE, ErrorMessages.TRANSFER_SAME_WAREHOUSE);
    }
    if (payload.lines() == null || payload.lines().isEmpty()) {
      throw rule(ErrorCodes.TRANSFER_LINES_EMPTY, ErrorMessages.TRANSFER_LINES_EMPTY);
    }

    List<TransferOrder> existing = transferRepo.findAll();
    List<TransferLine> lines = new ArrayList<>();

    for (TransferLinePayload linePayload : payload.lines()) {
      if (linePayload.quantity() == null || linePayload.quantity() <= 0) {
        throw rule(ErrorCodes.TRANSFER_QUANTITY_INVALID, ErrorMessages.TRANSFER_QUANTITY_INVALID,
            Map.of("batchNo", nz(linePayload.batchNo())));
      }
      InventoryBatch batch = batchRepo.findById(linePayload.inventoryBatchId()).orElse(null);
      if (batch == null || !Objects.equals(batch.warehouseId, payload.sourceWarehouseId())) {
        throw rule(ErrorCodes.TRANSFER_INSUFFICIENT_STOCK, ErrorMessages.TRANSFER_INSUFFICIENT_STOCK,
            Map.of("batchNo", nz(linePayload.batchNo()), "available", 0, "quantity", linePayload.quantity()));
      }
      TransferOrder occupied = findInTransitByBatch(existing, batch.id, 0L);
      if (occupied != null) {
        throw rule(ErrorCodes.TRANSFER_BATCH_ALREADY_IN_TRANSIT,
            ErrorMessages.TRANSFER_BATCH_ALREADY_IN_TRANSIT,
            Map.of("batchNo", batch.batchNo, "transferNo", occupied.transferNo));
      }
      int frozen = sumFrozenByBatch(existing, batch.id, 0L);
      int available = batch.quantity - frozen;
      if (available < linePayload.quantity()) {
        throw rule(ErrorCodes.TRANSFER_INSUFFICIENT_STOCK, ErrorMessages.TRANSFER_INSUFFICIENT_STOCK,
            Map.of("batchNo", batch.batchNo, "available", available, "quantity", linePayload.quantity()));
      }

      long newLineId = transferRepo.nextLineId();
      lines.add(new TransferLine(newLineId, null, batch.id, batch.supplyItemId, batch.batchNo,
          linePayload.quantity(), batch.quantity, frozen + linePayload.quantity()));
    }

    TransferOrder order = new TransferOrder();
    order.id = transferRepo.nextOrderId();
    order.transferNo = "TK" + Instant.now().toString().replaceAll("[-:T.Z]", "").substring(0, 14)
        + String.format("%03d", order.id);
    order.sourceWarehouseId = payload.sourceWarehouseId();
    order.targetWarehouseId = payload.targetWarehouseId();
    order.status = TransferStatus.IN_TRANSIT;
    order.createdBy = payload.createdBy() == null ? "仓库员" : payload.createdBy();
    order.remark = payload.remark() == null ? "" : payload.remark();
    String now = Instant.now().toString();
    order.createdAt = now;
    order.shippedAt = now;
    order.receivedAt = "";
    for (TransferLine line : lines) {
      line.transferOrderId = order.id;
      order.lines.add(line);
    }
    transferRepo.save(order);
    System.out.println(LogTemplates.TRANSFER_CREATE + ": " + order.transferNo);
    return order;
  }

  /** 目标仓确认收货：快照不一致即停止入账（整单不部分入账）。 */
  public synchronized TransferOrder receive(Long id) {
    TransferOrder order = transferRepo.findById(id).orElse(null);
    if (order == null) {
      throw rule(ErrorCodes.TRANSFER_ORDER_NOT_FOUND, ErrorMessages.TRANSFER_ORDER_NOT_FOUND,
          Map.of("transferNo", "#" + id));
    }
    if (order.status != TransferStatus.IN_TRANSIT) {
      throw rule(ErrorCodes.TRANSFER_ORDER_NOT_IN_TRANSIT, ErrorMessages.TRANSFER_ORDER_NOT_IN_TRANSIT,
          Map.of("transferNo", order.transferNo));
    }
    List<TransferOrder> existing = transferRepo.findAll();

    // 1. 先做整单复核，任一行失败都不动库存。
    for (TransferLine line : order.lines) {
      InventoryBatch batch = batchRepo.findById(line.inventoryBatchId).orElse(null);
      if (batch == null) {
        throw rule(ErrorCodes.TRANSFER_ORDER_NOT_FOUND, ErrorMessages.TRANSFER_ORDER_NOT_FOUND,
            Map.of("transferNo", order.transferNo));
      }
      int frozenCurrent = sumFrozenByBatch(existing, batch.id, order.id);
      int frozenExpected = line.frozenQuantitySnapshot - line.quantity;
      if (frozenCurrent != frozenExpected) {
        System.out.println(LogTemplates.TRANSFER_REJECT + ": " + order.transferNo);
        throw rule(ErrorCodes.TRANSFER_FROZEN_CHANGED, ErrorMessages.TRANSFER_FROZEN_CHANGED,
            Map.of("batchNo", line.batchNo, "frozenSnapshot", frozenExpected, "frozenCurrent", frozenCurrent));
      }
      if (!Objects.equals(batch.quantity, line.sourceQuantitySnapshot)) {
        System.out.println(LogTemplates.TRANSFER_REJECT + ": " + order.transferNo);
        throw rule(ErrorCodes.TRANSFER_SOURCE_QUANTITY_CHANGED,
            ErrorMessages.TRANSFER_SOURCE_QUANTITY_CHANGED,
            Map.of("batchNo", line.batchNo,
                "quantitySnapshot", line.sourceQuantitySnapshot, "quantityCurrent", batch.quantity));
      }
    }

    // 2. 复核通过：来源扣减，目标仓转入。
    for (TransferLine line : order.lines) {
      InventoryBatch source = batchRepo.findById(line.inventoryBatchId).orElseThrow();
      batchRepo.decrement(source.id, line.quantity);
      batchRepo.inbound(order.targetWarehouseId, line.supplyItemId, line.batchNo, line.quantity,
          source.expireAt, source.qualityStatus, "移库入库 " + order.transferNo);
    }
    transferRepo.markPosted(order);
    System.out.println(LogTemplates.TRANSFER_RECEIVE + ": " + order.transferNo);
    return order;
  }

  /** 汇总某批次的在途冻结量，可排除自身。 */
  private int sumFrozenByBatch(List<TransferOrder> orders, Long batchId, Long excludeOrderId) {
    int total = 0;
    for (TransferOrder o : orders) {
      if (o.status != TransferStatus.IN_TRANSIT || Objects.equals(o.id, excludeOrderId)) continue;
      for (TransferLine line : o.lines) {
        if (Objects.equals(line.inventoryBatchId, batchId)) total += line.quantity;
      }
    }
    return total;
  }

  private TransferOrder findInTransitByBatch(List<TransferOrder> orders, Long batchId, Long excludeOrderId) {
    for (TransferOrder o : orders) {
      if (o.status != TransferStatus.IN_TRANSIT || Objects.equals(o.id, excludeOrderId)) continue;
      for (TransferLine line : o.lines) {
        if (Objects.equals(line.inventoryBatchId, batchId)) return o;
      }
    }
    return null;
  }

  private static String nz(String value) { return value == null ? "" : value; }

  private static TransferServiceException rule(String code, String template) {
    return new TransferServiceException(code, ErrorMessages.render(template, Map.of()));
  }

  private static TransferServiceException rule(String code, String template, Map<String, Object> ctx) {
    return new TransferServiceException(code, ErrorMessages.render(template, ctx), ctx);
  }
}
