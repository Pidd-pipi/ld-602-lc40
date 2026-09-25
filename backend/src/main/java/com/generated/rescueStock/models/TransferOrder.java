package com.generated.rescueStock.models;

import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import com.generated.rescueStock.constants.TransferStatus;

/** 仓库间移库单：IN_TRANSIT 在途冻结，POSTED 收货入账。 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class TransferOrder {
  public Long id;
  public String transferNo;
  public Long sourceWarehouseId;
  public Long targetWarehouseId;
  public TransferStatus status;
  public String createdBy;
  public String remark;
  public String createdAt;
  public String shippedAt;
  public String receivedAt;
  public List<TransferLine> lines = new ArrayList<>();
}
