package com.generated.rescueStock.types;

import com.fasterxml.jackson.annotation.JsonProperty;

/** 仓库员提交移库单请求体（snake_case 与前端契约一致） */
public record TransferOrderPayload(
    @JsonProperty("source_warehouse_id") Long sourceWarehouseId,
    @JsonProperty("target_warehouse_id") Long targetWarehouseId,
    @JsonProperty("source_batch_id") Long sourceBatchId,
    @JsonProperty("quantity") Integer quantity,
    @JsonProperty("created_by") String createdBy,
    @JsonProperty("remark") String remark
) {}
