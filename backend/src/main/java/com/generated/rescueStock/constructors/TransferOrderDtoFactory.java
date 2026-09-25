package com.generated.rescueStock.constructors;

import java.util.*;
import com.generated.rescueStock.constants.TransferStatus;

/** 移库单响应 DTO 工厂：前端依赖的蛇形字段在此集中构造，避免 controller 散写字段名。 */
public final class TransferOrderDtoFactory {

  private TransferOrderDtoFactory() {}

  public static Map<String, Object> summary(Long id, String transferNo, TransferStatus status,
                                            Long sourceWarehouseId, Long targetWarehouseId,
                                            int totalQuantity) {
    Map<String, Object> dto = new LinkedHashMap<>();
    dto.put("id", id);
    dto.put("transfer_no", transferNo);
    dto.put("status", status.name());
    dto.put("source_warehouse_id", sourceWarehouseId);
    dto.put("target_warehouse_id", targetWarehouseId);
    dto.put("total_quantity", totalQuantity);
    return dto;
  }
}
