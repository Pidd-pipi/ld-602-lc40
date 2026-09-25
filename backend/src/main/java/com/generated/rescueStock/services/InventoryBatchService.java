package com.generated.rescueStock.services;

import java.util.*;
import org.springframework.stereotype.Service;
import com.generated.rescueStock.constants.ErrorCodes;
import com.generated.rescueStock.constants.ErrorMessages;
import com.generated.rescueStock.constants.LogTemplates;
import com.generated.rescueStock.repositories.InventoryBatchRepository;
import com.generated.rescueStock.repositories.TransferOrderRepository;
import com.generated.rescueStock.models.InventoryBatch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class InventoryBatchService {
  private static final Logger audit = LoggerFactory.getLogger("AUDIT");

  private final InventoryBatchRepository repo;
  private final TransferOrderRepository transferRepo;

  public InventoryBatchService(InventoryBatchRepository repo, TransferOrderRepository transferRepo) {
    this.repo = repo;
    this.transferRepo = transferRepo;
  }

  public List<Map<String, Object>> list() { return repo.findAll(); }

  /** 盘点调整批次数量，模拟收货前来源批次被其他业务改动，用于移库乐观校验；不得低于在途冻结量 */
  public Map<String, Object> adjustQuantity(Long batchId, Integer quantity) {
    if (quantity == null || quantity < 0) {
      throw new TransferBusinessException(ErrorCodes.VALIDATION_FAILED, ErrorMessages.VALIDATION_FAILED);
    }
    InventoryBatch batch = repo.findEntityById(batchId)
        .orElseThrow(() -> new TransferBusinessException(
            ErrorCodes.TRANSFER_ORDER_NOT_FOUND, ErrorMessages.TRANSFER_ORDER_NOT_FOUND));
    int frozen = transferRepo.sumFrozenBySourceBatch(batchId);
    if (quantity < frozen) {
      throw new TransferBusinessException(
          ErrorCodes.TRANSFER_INSUFFICIENT_STOCK,
          String.format(ErrorMessages.TRANSFER_INSUFFICIENT_STOCK, quantity - frozen, 0));
    }
    batch.quantity = quantity;
    repo.save(batch);
    audit.info(String.format(LogTemplates.INVENTORY_BATCH_ADJUST, batch.batchNo, quantity));
    return repo.toMap(batch);
  }
}
