import { mockData } from "./seedData";
import type { InventoryBatch } from "../types/InventoryBatch";
import type { TransferOrder, TransferOrderCreatePayload } from "../types/TransferOrder";
import type { TransferStatus } from "../types/TransferStatus";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { formatMessage } from "../utils/formatters";

/**
 * 本地 mock 引擎：后端不可用时在浏览器内复刻服务端的移库冻结/收货入账事务，
 * 保证离线评审时页面交互与校验链路完整可用。
 */

type Listener = () => void;

interface TransferError {
  code: keyof typeof ERROR_CODES;
  message: string;
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

class MockEngine {
  inventoryBatches = clone(mockData.inventoryBatch) as unknown as InventoryBatch[];
  transferOrders = clone(mockData.transferOrder) as unknown as TransferOrder[];
  auditLogs: string[] = [];

  private listeners = new Set<Listener>();
  private seq = Math.max(0, ...this.transferOrders.map((row) => row.id)) + 1;
  private batchSeq = Math.max(0, ...this.inventoryBatches.map((row) => row.id)) + 1;

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  log(template: string) {
    this.auditLogs.push(`${new Date().toISOString()} ${template}`);
  }

  private fail(code: keyof typeof ERROR_CODES, params: Record<string, string | number> = {}): never {
    const error: TransferError & { business?: boolean } = {
      code,
      message: formatMessage(ERROR_MESSAGES[code], params),
      business: true
    };
    throw error;
  }

  /** 某批次当前在途冻结数量合计 */
  frozenQuantity(batchId: number): number {
    return this.transferOrders
      .filter((order) => order.source_batch_id === batchId && order.status === "IN_TRANSIT")
      .reduce((sum, order) => sum + order.quantity, 0);
  }

  /** 某批次可用数量 = 实际库存 - 在途冻结 */
  availableQuantity(batchId: number): number {
    const batch = this.inventoryBatches.find((row) => row.id === batchId);
    if (!batch) return 0;
    return batch.quantity - this.frozenQuantity(batchId);
  }

  createTransfer(payload: TransferOrderCreatePayload): TransferOrder {
    const { source_warehouse_id, target_warehouse_id, source_batch_id, quantity, created_by, remark } = payload;
    const qty = Number(quantity);

    if (source_warehouse_id === target_warehouse_id) {
      this.fail("TRANSFER_WAREHOUSE_SAME");
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      this.fail("VALIDATION_FAILED");
    }

    const batch = this.inventoryBatches.find((row) => row.id === source_batch_id);
    if (!batch || batch.warehouse_id !== source_warehouse_id) {
      this.fail("VALIDATION_FAILED");
    }

    // 同一批次同时只允许存在一张在途移库单，避免两单冻结数量互相覆盖
    const inTransit = this.transferOrders.find(
      (order) => order.source_batch_id === source_batch_id && order.status === "IN_TRANSIT"
    );
    if (inTransit) {
      this.fail("TRANSFER_BATCH_IN_TRANSIT", { transferNo: inTransit.transfer_no });
    }

    const available = batch.quantity - this.frozenQuantity(source_batch_id);
    if (qty > available) {
      this.fail("TRANSFER_INSUFFICIENT_STOCK", { available, quantity: qty });
    }

    const now = new Date();
    const order: TransferOrder = {
      id: this.seq,
      transfer_no: this.nextTransferNo(now),
      source_warehouse_id,
      target_warehouse_id,
      supply_item_id: batch.supply_item_id,
      batch_no: batch.batch_no,
      quantity: qty,
      status: "IN_TRANSIT",
      created_by: created_by || "仓库员",
      created_at: now.toISOString(),
      received_at: null,
      source_batch_id,
      target_batch_id: null,
      // 冻结瞬间记录来源批次库存与冻结总量，作为确认收货时的乐观锁依据
      source_quantity_snapshot: batch.quantity,
      frozen_total_snapshot: this.frozenQuantity(source_batch_id) + qty,
      remark: remark ?? ""
    };
    this.seq += 1;
    this.transferOrders.push(order);
    this.log(`移库单创建并冻结来源库存 ${order.transfer_no} 批次 ${batch.batch_no} 数量 ${qty}`);
    this.emit();
    return order;
  }

  receiveTransfer(orderId: number): TransferOrder {
    const order = this.transferOrders.find((row) => row.id === orderId);
    if (!order) this.fail("TRANSFER_ORDER_NOT_FOUND");
    if (order.status !== "IN_TRANSIT") {
      this.fail("TRANSFER_STATUS_CONFLICT", { status: order.status });
    }

    const sourceBatch = this.inventoryBatches.find((row) => row.id === order.source_batch_id);
    if (!sourceBatch) this.fail("TRANSFER_ORDER_NOT_FOUND");

    // 确认收货时重新比对：来源批次实际库存或在途冻结总量在提交后若已变化，停止入账
    const frozenNow = this.frozenQuantity(order.source_batch_id);
    const quantityNow = sourceBatch.quantity;
    if (
      frozenNow !== order.frozen_total_snapshot ||
      quantityNow !== order.source_quantity_snapshot
    ) {
      this.log(`移库单收货校验失败拦截 ${order.transfer_no}：冻结 ${order.frozen_total_snapshot}->${frozenNow}，库存 ${order.source_quantity_snapshot}->${quantityNow}`);
      this.fail("TRANSFER_FROZEN_CHANGED", {
        frozenSnapshot: order.frozen_total_snapshot,
        frozenNow,
        quantitySnapshot: order.source_quantity_snapshot,
        quantityNow
      });
    }

    // 再次兜底校验可用量，防止冻结量异常导致来源批次被扣成负数
    if (quantityNow - frozenNow < 0) {
      this.fail("TRANSFER_INSUFFICIENT_STOCK", { available: quantityNow - frozenNow, quantity: order.quantity });
    }

    // 目标仓同物资同批次合并入库，否则生成新批次
    let targetBatch = this.inventoryBatches.find(
      (row) =>
        row.warehouse_id === order.target_warehouse_id &&
        row.supply_item_id === order.supply_item_id &&
        row.batch_no === order.batch_no
    );
    if (targetBatch) {
      targetBatch.quantity += order.quantity;
    } else {
      targetBatch = {
        ...clone(sourceBatch),
        id: this.batchSeq,
        warehouse_id: order.target_warehouse_id,
        quantity: order.quantity,
        inbound_source: `${this.warehouseName(order.source_warehouse_id)}移库入库`
      };
      this.batchSeq += 1;
      this.inventoryBatches.push(targetBatch);
    }

    // 来源仓实际扣减冻结数量
    sourceBatch.quantity -= order.quantity;

    const receivedAt = new Date().toISOString();
    order.status = "POSTED" as TransferStatus;
    order.received_at = receivedAt;
    order.target_batch_id = targetBatch.id;

    this.log(`移库单确认收货入账 ${order.transfer_no}：批次 ${order.batch_no} ${order.quantity} 转入仓库 ${order.target_warehouse_id}`);
    this.emit();
    return order;
  }

  /** 库存盘点调整：模拟提交移库单之后、收货之前来源批次数量被其他业务改动 */
  adjustBatchQuantity(batchId: number, nextQuantity: number): InventoryBatch {
    const batch = this.inventoryBatches.find((row) => row.id === batchId);
    if (!batch) this.fail("TRANSFER_ORDER_NOT_FOUND");
    const qty = Number(nextQuantity);
    if (!Number.isFinite(qty) || qty < 0) this.fail("VALIDATION_FAILED");
    const frozen = this.frozenQuantity(batchId);
    if (qty < frozen) {
      this.fail("TRANSFER_INSUFFICIENT_STOCK", { available: qty - frozen, quantity: 0 });
    }
    batch.quantity = qty;
    this.log(`库存批次盘点调整 批次 ${batch.batch_no} 调整后数量 ${qty}`);
    this.emit();
    return batch;
  }

  warehouseName(warehouseId: number): string {
    const warehouses = mockData.warehouse as readonly { id: number; name: string }[];
    return warehouses.find((row) => row.id === warehouseId)?.name ?? `仓库${warehouseId}`;
  }

  private nextTransferNo(now: Date): string {
    const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
    const seqInDay = this.transferOrders.filter((row) => row.transfer_no.includes(ymd)).length + 1;
    return `YK${ymd}${String(seqInDay).padStart(3, "0")}`;
  }
}

export const mockEngine = new MockEngine();
