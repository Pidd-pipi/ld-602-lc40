package com.generated.rescueStock.repositories;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Repository;
import com.generated.rescueStock.models.TransferOrder;

/** 移库单数据访问：演示环境使用内存存储，结构与 transfer_order 表一一对应 */
@Repository
public class TransferOrderRepository {
  private final Map<Long, TransferOrder> store = new ConcurrentHashMap<>();
  private final AtomicLong sequence = new AtomicLong(100);

  public List<TransferOrder> findAll() {
    return store.values().stream().sorted(Comparator.comparing(a -> a.id)).toList();
  }

  public Optional<TransferOrder> findById(Long id) {
    return Optional.ofNullable(store.get(id));
  }

  /** 同一来源批次是否已有在途移库单 */
  public Optional<TransferOrder> findInTransitBySourceBatch(Long sourceBatchId) {
    return store.values().stream()
        .filter(order -> Objects.equals(order.sourceBatchId, sourceBatchId) && "IN_TRANSIT".equals(order.status))
        .findFirst();
  }

  /** 该批次当前在途冻结数量合计 */
  public int sumFrozenBySourceBatch(Long sourceBatchId) {
    return store.values().stream()
        .filter(order -> Objects.equals(order.sourceBatchId, sourceBatchId) && "IN_TRANSIT".equals(order.status))
        .mapToInt(order -> order.quantity == null ? 0 : order.quantity)
        .sum();
  }

  public TransferOrder save(TransferOrder order) {
    if (order.id == null) order.id = sequence.incrementAndGet();
    store.put(order.id, order);
    return order;
  }
}
