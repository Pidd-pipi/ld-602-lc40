package com.generated.rescueStock.repositories;

import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Repository;
import com.generated.rescueStock.models.InventoryBatch;

/**
 * 内存库存批次仓储（演示环境无数据源）。
 * 真实环境替换为 MyBatis-Plus Mapper：收货扣减与目标仓转入需在同一事务内完成。
 */
@Repository
public class InventoryBatchRepository {
  private final List<InventoryBatch> store = new CopyOnWriteArrayList<>();

  public InventoryBatchRepository() {
    store.add(batch(1L, 1L, 1L, "B20260501-W", 120, "2027-05-01T09:00:00Z", "市级采购入库"));
    store.add(batch(2L, 1L, 1L, "B20260415-W", 60, "2026-12-15T09:00:00Z", "社会捐赠"));
    store.add(batch(3L, 2L, 1L, "B20260510-W", 40, "2027-05-10T09:00:00Z", "市级采购入库"));
    store.add(batch(4L, 1L, 2L, "B20260301-M", 30, "2029-03-01T09:00:00Z", "卫健调拨入库"));
    store.add(batch(5L, 2L, 2L, "B20260320-M", 20, "2029-03-20T09:00:00Z", "卫健调拨入库"));
    store.add(batch(6L, 1L, 3L, "B20260110-S", 15, "2031-01-10T09:00:00Z", "省级调拨入库"));
    store.add(batch(7L, 3L, 3L, "B20260210-S", 10, "2031-02-10T09:00:00Z", "省级调拨入库"));
    store.add(batch(8L, 3L, 1L, "B20260520-W", 25, "2027-05-20T09:00:00Z", "区级采购入库"));
  }

  private static InventoryBatch batch(Long id, Long warehouseId, Long supplyItemId, String batchNo,
                                      Integer quantity, String expireAt, String source) {
    InventoryBatch b = new InventoryBatch();
    b.id = id;
    b.warehouseId = warehouseId;
    b.supplyItemId = supplyItemId;
    b.batchNo = batchNo;
    b.quantity = quantity;
    b.expireAt = expireAt;
    b.inboundSource = source;
    b.qualityStatus = "QUALIFIED";
    return b;
  }

  public List<InventoryBatch> findAll() {
    return List.copyOf(store);
  }

  public Optional<InventoryBatch> findById(Long id) {
    return store.stream().filter(b -> b.id.equals(id)).findFirst();
  }

  public Optional<InventoryBatch> findByWarehouseAndBatch(Long warehouseId, Long supplyItemId, String batchNo) {
    return store.stream()
        .filter(b -> b.warehouseId.equals(warehouseId)
            && b.supplyItemId.equals(supplyItemId)
            && b.batchNo.equals(batchNo))
        .findFirst();
  }

  /** 来源仓扣减；返回最新账面数量，收货时据此做乐观复核。 */
  public synchronized int decrement(Long batchId, int quantity) {
    InventoryBatch batch = findById(batchId).orElseThrow();
    batch.quantity -= quantity;
    return batch.quantity;
  }

  /** 目标仓同批次转入；批次不存在时新建。 */
  public synchronized void inbound(Long targetWarehouseId, Long supplyItemId, String batchNo,
                                   int quantity, String expireAt, String qualityStatus, String inboundSource) {
    Optional<InventoryBatch> existing = findByWarehouseAndBatch(targetWarehouseId, supplyItemId, batchNo);
    if (existing.isPresent()) {
      existing.get().quantity += quantity;
      return;
    }
    long nextId = store.stream().mapToLong(b -> b.id).max().orElse(0L) + 1;
    InventoryBatch created = batch(nextId, targetWarehouseId, supplyItemId, batchNo, quantity, expireAt, inboundSource);
    created.qualityStatus = qualityStatus;
    store.add(created);
  }
}
