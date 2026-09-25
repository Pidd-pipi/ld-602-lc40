package com.generated.rescueStock.repositories;

import java.util.*;
import org.springframework.stereotype.Repository;

@Repository
public class WarehouseRepository {
  public List<Map<String, Object>> findAll() {
    return List.of(
        Map.of("id", 1, "name", "海淀中央应急仓", "district", "海淀区", "address", "中关村应急基地 1 号库",
            "manager_id", 1, "capacity_level", 5000, "contact_phone", "13800000001", "status", "ACTIVE"),
        Map.of("id", 2, "name", "朝阳分仓", "district", "朝阳区", "address", "CBD 救灾物资储备库",
            "manager_id", 2, "capacity_level", 3000, "contact_phone", "13800000002", "status", "ACTIVE"),
        Map.of("id", 3, "name", "丰台分仓", "district", "丰台区", "address", "南三环应急物资中转站",
            "manager_id", 3, "capacity_level", 2000, "contact_phone", "13800000003", "status", "STANDBY")
    );
  }
}
