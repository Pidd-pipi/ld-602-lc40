package com.generated.rescueStock.models;

import java.time.Instant;

/** 仓库间移库单：提交冻结来源批次，目标仓确认收货后入账 */
public class TransferOrder {
  public Long id;
  public String transferNo;
  public Long sourceWarehouseId;
  public Long targetWarehouseId;
  public Long supplyItemId;
  public String batchNo;
  public Integer quantity;
  /** IN_TRANSIT（在途）/ POSTED（已入账） */
  public String status;
  public String createdBy;
  public Instant createdAt;
  public Instant receivedAt;
  public Long sourceBatchId;
  public Long targetBatchId;
  /** 提交时来源批次实际库存快照 */
  public Integer sourceQuantitySnapshot;
  /** 提交时该批次全部在途冻结数量快照（含本单） */
  public Integer frozenTotalSnapshot;
  public String remark;
}
