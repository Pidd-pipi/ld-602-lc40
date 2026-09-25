package com.generated.rescueStock.repositories;

import java.util.*;
import org.springframework.stereotype.Repository;

@Repository
public class SupplyItemRepository {
  public List<Map<String, Object>> findAll() {
    return List.of(
        Map.of("id", 1, "sku_code", "WATER-550ML", "name", "瓶装饮用水 550ml", "category", "WATER",
            "unit", "瓶", "safety_stock", "100", "expire_days", 720, "storage_requirement", "常温避光"),
        Map.of("id", 2, "sku_code", "MED-KIT-01", "name", "综合急救包", "category", "MEDICAL",
            "unit", "个", "safety_stock", "30", "expire_days", 1095, "storage_requirement", "干燥防潮"),
        Map.of("id", 3, "sku_code", "TENT-12", "name", "12 平米救灾帐篷", "category", "SHELTER",
            "unit", "顶", "safety_stock", "10", "expire_days", 1825, "storage_requirement", "垫高存放")
    );
  }
}
