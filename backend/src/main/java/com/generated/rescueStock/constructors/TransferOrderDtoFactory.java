package com.generated.rescueStock.constructors;

import java.util.LinkedHashMap;
import java.util.Map;
import com.generated.rescueStock.models.TransferOrder;

/** 移库单响应 DTO 构造器：字段命名与前端 snake_case 类型保持一致 */
public final class TransferOrderDtoFactory {

  private TransferOrderDtoFactory() {}

  public static Map<String, Object> toResponse(TransferOrder order) {
    Map<String, Object> map = new LinkedHashMap<>();
    map.put("id", order.id);
    map.put("transfer_no", order.transferNo);
    map.put("source_warehouse_id", order.sourceWarehouseId);
    map.put("target_warehouse_id", order.targetWarehouseId);
    map.put("supply_item_id", order.supplyItemId);
    map.put("batch_no", order.batchNo);
    map.put("quantity", order.quantity);
    map.put("status", order.status);
    map.put("created_by", order.createdBy);
    map.put("created_at", order.createdAt == null ? null : order.createdAt.toString());
    map.put("received_at", order.receivedAt == null ? null : order.receivedAt.toString());
    map.put("source_batch_id", order.sourceBatchId);
    map.put("target_batch_id", order.targetBatchId);
    map.put("source_quantity_snapshot", order.sourceQuantitySnapshot);
    map.put("frozen_total_snapshot", order.frozenTotalSnapshot);
    map.put("remark", order.remark);
    return map;
  }
}
