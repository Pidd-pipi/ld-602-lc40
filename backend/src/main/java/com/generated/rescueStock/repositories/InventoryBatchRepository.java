package com.generated.rescueStock.repositories;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;
import com.generated.rescueStock.models.InventoryBatch;

/**
 * 库存批次数据访问：演示环境使用内存存储，结构与 inventory_batch 表一一对应。
 */
@Repository
public class InventoryBatchRepository {
  private final Map<Long, InventoryBatch> store = new ConcurrentHashMap<>();
  private final AtomicSequence batchSeq = new AtomicSequence(100);

  public InventoryBatchRepository() {
    seed(1L, 1L, 1L, "PC20260301", 300, "市级应急物资采购");
    seed(2L, 1L, 2L, "GB20260215", 120, "城南应急前置仓移库入库");
    seed(3L, 1L, 3L, "JJ20260110", 60, "红十字会捐赠");
    seed(4L, 2L, 1L, "PC20260410", 80, "市级应急物资采购");
    seed(5L, 2L, 4L, "PC20251220", 6, "省级装备调拨");
    seed(6L, 3L, 2L, "GB20260215", 200, "区级物资采购");
    seed(7L, 3L, 3L, "JJ20260110", 30, "市级应急物资采购");
    seed(8L, 3L, 1L, "PC20260301", 100, "城东应急中心仓移库入库");
  }

  private void seed(Long id, Long warehouseId, Long supplyItemId, String batchNo, Integer quantity, String source) {
    InventoryBatch batch = new InventoryBatch();
    batch.id = id;
    batch.warehouseId = warehouseId;
    batch.supplyItemId = supplyItemId;
    batch.batchNo = batchNo;
    batch.quantity = quantity;
    batch.expireAt = "2028-01-01T09:00:00Z";
    batch.inboundSource = source;
    batch.qualityStatus = "QUALIFIED";
    store.put(id, batch);
  }

  public List<Map<String, Object>> findAll() {
    return store.values().stream().sorted(Comparator.comparing(b -> b.id)).map(this::toMap).toList();
  }

  public Optional<InventoryBatch> findEntityById(Long id) {
    return Optional.ofNullable(store.get(id));
  }

  public Optional<InventoryBatch> findByWarehouseAndBatch(Long warehouseId, Long supplyItemId, String batchNo) {
    return store.values().stream()
        .filter(b -> Objects.equals(b.warehouseId, warehouseId)
            && Objects.equals(b.supplyItemId, supplyItemId)
            && Objects.equals(b.batchNo, batchNo))
        .findFirst();
  }

  public InventoryBatch save(InventoryBatch batch) {
    if (batch.id == null) batch.id = batchSeq.next();
    store.put(batch.id, batch);
    return batch;
  }

  public Map<String, Object> toMap(InventoryBatch batch) {
    Map<String, Object> map = new LinkedHashMap<>();
    map.put("id", batch.id);
    map.put("warehouse_id", batch.warehouseId);
    map.put("supply_item_id", batch.supplyItemId);
    map.put("batch_no", batch.batchNo);
    map.put("quantity", batch.quantity);
    map.put("expire_at", batch.expireAt);
    map.put("inbound_source", batch.inboundSource);
    map.put("quality_status", batch.qualityStatus);
    return map;
  }

  private static final class AtomicSequence {
    private long value;
    AtomicSequence(long start) { this.value = start; }
    synchronized long next() { return ++value; }
  }
}
