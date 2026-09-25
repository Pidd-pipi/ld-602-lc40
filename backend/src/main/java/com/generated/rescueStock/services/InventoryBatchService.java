package com.generated.rescueStock.services;

import java.util.*;
import org.springframework.stereotype.Service;
import com.generated.rescueStock.models.InventoryBatch;
import com.generated.rescueStock.repositories.InventoryBatchRepository;

@Service
public class InventoryBatchService {
  private final InventoryBatchRepository repo;

  public InventoryBatchService(InventoryBatchRepository repo) {
    this.repo = repo;
  }

  public List<Map<String, Object>> list() {
    List<Map<String, Object>> rows = new ArrayList<>();
    for (InventoryBatch b : repo.findAll()) {
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("id", b.id);
      row.put("warehouse_id", b.warehouseId);
      row.put("supply_item_id", b.supplyItemId);
      row.put("batch_no", b.batchNo);
      row.put("quantity", b.quantity);
      row.put("expire_at", b.expireAt);
      row.put("inbound_source", b.inboundSource);
      row.put("quality_status", b.qualityStatus);
      rows.add(row);
    }
    return rows;
  }
}
