import { mockData } from "../mocks/seedData";
import { loadCollection, saveCollection } from "../mocks/localStore";
import type { InventoryBatch } from "../types/InventoryBatch";
import type { TransferOrder, TransferOrderDraft } from "../types/TransferOrder";
import {
  assertReceivable,
  assertTransferSubmittable,
  buildSnapshotLines
} from "../services/transferRules";

const endpoint = "/api/transfer-order";
const COLLECTION = "transferOrder";

/** 后端不可用时的本地数据访问；fetch 成功时直接透传后端结果。 */
function readTransfers(): TransferOrder[] {
  return loadCollection(COLLECTION, mockData.transferOrder as unknown as TransferOrder[]);
}

function readBatches(): InventoryBatch[] {
  return loadCollection("inventoryBatch", mockData.inventoryBatch as unknown as InventoryBatch[]);
}

function persistTransfers(rows: TransferOrder[]): TransferOrder[] {
  return saveCollection(COLLECTION, rows);
}

function persistBatches(rows: InventoryBatch[]): InventoryBatch[] {
  return saveCollection("inventoryBatch", rows);
}

export async function listTransferOrder(): Promise<TransferOrder[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return (await res.json()) as TransferOrder[];
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return readTransfers();
}

/**
 * 提交移库单：
 * 1. 校验来源仓/批次可用数量、在途占用；
 * 2. 写入来源数量快照与冻结快照（数量在收货时才真正扣减，期间以冻结量体现）。
 */
export async function createTransferOrder(draft: TransferOrderDraft): Promise<TransferOrder> {
  const orders = readTransfers();
  const batches = readBatches();

  assertTransferSubmittable(draft, batches, orders);

  const now = new Date().toISOString();
  const nextId = orders.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  const nextLineId = orders.flatMap((order) => order.lines).reduce((max, line) => Math.max(max, line.id), 0) + 1;
  const transfer: TransferOrder = {
    id: nextId,
    transfer_no: `TK${now.replace(/[-:T.Z]/g, "").slice(0, 14)}${String(nextId).padStart(3, "0")}`,
    source_warehouse_id: draft.source_warehouse_id,
    target_warehouse_id: draft.target_warehouse_id,
    status: "IN_TRANSIT",
    created_by: draft.created_by,
    remark: draft.remark,
    lines: buildSnapshotLines(draft, batches, orders, nextLineId),
    created_at: now,
    shipped_at: now,
    received_at: ""
  };

  persistTransfers([...orders, transfer]);
  return transfer;
}

/**
 * 目标仓确认收货：
 * - 复核来源账面数量、冻结数量快照，一旦变化即拒绝入账（整单不部分入账）；
 * - 复核通过后来源批次扣减，目标仓同批次转入（不存在则新建批次）。
 */
export async function receiveTransferOrder(id: number): Promise<TransferOrder> {
  const orders = readTransfers();
  const batches = readBatches();
  const order = orders.find((item) => item.id === id);
  if (!order) {
    throw new Error(`移库单不存在：id=${id}`);
  }

  assertReceivable(order, batches, orders);

  for (const line of order.lines) {
    const source = batches.find((item) => item.id === line.inventory_batch_id);
    if (!source) continue;
    source.quantity -= line.quantity;

    const existing = batches.find(
      (item) =>
        item.warehouse_id === order.target_warehouse_id &&
        item.supply_item_id === line.supply_item_id &&
        item.batch_no === line.batch_no
    );
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      batches.push({
        id: batches.reduce((max, row) => Math.max(max, row.id), 0) + 1,
        warehouse_id: order.target_warehouse_id,
        supply_item_id: line.supply_item_id,
        batch_no: line.batch_no,
        quantity: line.quantity,
        expire_at: source.expire_at,
        inbound_source: `移库入库 ${order.transfer_no}`,
        quality_status: source.quality_status
      });
    }
  }

  order.status = "POSTED";
  order.received_at = new Date().toISOString();

  persistBatches(batches);
  persistTransfers(orders);
  return order;
}
