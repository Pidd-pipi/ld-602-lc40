package com.generated.rescueStock.types;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/** 创建移库单请求体：仓库员选择来源仓、目标仓和批次数量。 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TransferOrderPayload(
    Long sourceWarehouseId,
    Long targetWarehouseId,
    String createdBy,
    String remark,
    java.util.List<TransferLinePayload> lines
) {}
