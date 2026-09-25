package com.generated.rescueStock.repositories;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Repository;
import com.generated.rescueStock.constants.TransferStatus;
import com.generated.rescueStock.models.TransferLine;
import com.generated.rescueStock.models.TransferOrder;

/** 内存移库单仓储；接入 MySQL 后替换为 transfer_order / transfer_line 两张表的 Mapper。 */
@Repository
public class TransferOrderRepository {
  private final List<TransferOrder> store = new CopyOnWriteArrayList<>();
  private final AtomicLong orderId = new AtomicLong(0L);
  private final AtomicLong lineId = new AtomicLong(0L);

  public TransferOrderRepository() {
    // 种子单：海淀中央应急仓 -> 朝阳分仓，20 瓶水在途冻结
    TransferOrder seed = new TransferOrder();
    seed.id = nextOrderId();
    seed.transferNo = "TK20260920001";
    seed.sourceWarehouseId = 1L;
    seed.targetWarehouseId = 2L;
    seed.status = TransferStatus.IN_TRANSIT;
    seed.createdBy = "仓库员-赵磊";
    seed.remark = "朝阳分仓防汛演练补货";
    seed.createdAt = "2026-09-20T08:30:00Z";
    seed.shippedAt = seed.createdAt;
    seed.receivedAt = "";
    seed.lines.add(new TransferLine(nextLineId(), seed.id, 1L, 1L, "B20260501-W", 20, 120, 20));
    store.add(seed);
  }

  public long nextOrderId() { return orderId.incrementAndGet(); }
  public long nextLineId() { return lineId.incrementAndGet(); }

  public List<TransferOrder> findAll() {
    return List.copyOf(store);
  }

  public Optional<TransferOrder> findById(Long id) {
    return store.stream().filter(o -> o.id.equals(id)).findFirst();
  }

  public synchronized TransferOrder save(TransferOrder order) {
    store.add(order);
    return order;
  }

  public synchronized void markPosted(TransferOrder order) {
    order.status = TransferStatus.POSTED;
    order.receivedAt = Instant.now().toString();
  }
}
