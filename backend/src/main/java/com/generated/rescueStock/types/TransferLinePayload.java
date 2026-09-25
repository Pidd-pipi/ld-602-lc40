package com.generated.rescueStock.types;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/** 移库单批次明细请求体。 */
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public record TransferLinePayload(Long inventoryBatchId, Long supplyItemId, String batchNo, Integer quantity) {}
