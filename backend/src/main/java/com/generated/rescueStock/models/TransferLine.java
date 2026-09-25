package com.generated.rescueStock.models;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/** 移库单批次明细：提交时冻结快照，收货时复核来源数量。 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class TransferLine {
  public Long id;
  public Long transferOrderId;
  public Long inventoryBatchId;
  public Long supplyItemId;
  public String batchNo;
  public Integer quantity;
  /** 提交时来源批次账面数量快照 */
  public Integer sourceQuantitySnapshot;
  /** 提交时来源批次冻结数量快照（含本单） */
  public Integer frozenQuantitySnapshot;

  public TransferLine() {}

  public TransferLine(Long id, Long transferOrderId, Long inventoryBatchId, Long supplyItemId,
                      String batchNo, Integer quantity, Integer sourceQuantitySnapshot,
                      Integer frozenQuantitySnapshot) {
    this.id = id;
    this.transferOrderId = transferOrderId;
    this.inventoryBatchId = inventoryBatchId;
    this.supplyItemId = supplyItemId;
    this.batchNo = batchNo;
    this.quantity = quantity;
    this.sourceQuantitySnapshot = sourceQuantitySnapshot;
    this.frozenQuantitySnapshot = frozenQuantitySnapshot;
  }
}
