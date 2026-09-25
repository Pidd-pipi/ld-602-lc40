import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { ERROR_MESSAGES, renderErrorMessage } from "../constants/errorMessages";
import type { InventoryBatch } from "../types/InventoryBatch";
import type { TransferOrder, TransferOrderDraft, TransferLine } from "../types/TransferOrder";

/** 移库业务异常：携带错误码，供页面逐条展示“原因”。 */
export class TransferRuleError extends Error {
  readonly code: ErrorCode;
  readonly context: Record<string, string | number>;

  constructor(code: ErrorCode, context: Record<string, string | number> = {}) {
    super(renderErrorMessage(ERROR_MESSAGES[code] ?? code, context));
    this.name = "TransferRuleError";
    this.code = code;
    this.context = context;
  }
}

export interface TransferBatchView {
  batch: InventoryBatch;
  movedOut: number;
  inTransit: number;
  postedOut: number;
  movedIn: number;
  postedIn: number;
  available: number;
}

const asLines = (order: TransferOrder): TransferLine[] => order.lines;

/** 汇总某个来源批次上所有在途移库单的冻结数量，可排除指定移库单（收货复核时使用）。 */
export function sumFrozenByBatch(orders: TransferOrder[], batchId: number, excludeOrderId = 0): number {
  return orders
    .filter((order) => order.status === "IN_TRANSIT" && order.id !== excludeOrderId)
    .flatMap(asLines)
    .filter((line) => line.inventory_batch_id === batchId)
    .reduce((total, line) => total + line.quantity, 0);
}

/** 同一批次是否已被某张在途移库单占用（排除自身，收货复核时使用）。 */
export function findInTransitByBatch(
  orders: TransferOrder[],
  batchId: number,
  excludeOrderId = 0
): TransferOrder | undefined {
  return orders.find(
    (order) =>
      order.status === "IN_TRANSIT" &&
      order.id !== excludeOrderId &&
      order.lines.some((line) => line.inventory_batch_id === batchId)
  );
}

/**
 * 仓库页视图：移出、在途、已入账数量。
 * - movedOut：作为来源仓，全部移库单上该批次的数量（含在途+已入账）
 * - inTransit：作为来源仓，当前在途冻结数量
 * - postedOut：作为来源仓，已确认收货转出数量
 * - movedIn / postedIn：作为目标仓已入账转入数量
 * - available：账面数量 - 在途冻结数量
 */
export function buildBatchView(
  batch: InventoryBatch,
  orders: TransferOrder[]
): TransferBatchView {
  const sourceOrders = orders.filter(
    (order) =>
      order.lines.some((line) => line.inventory_batch_id === batch.id)
  );
  const inTransit = sourceOrders
    .filter((order) => order.status === "IN_TRANSIT")
    .flatMap(asLines)
    .filter((line) => line.inventory_batch_id === batch.id)
    .reduce((total, line) => total + line.quantity, 0);
  const postedOut = sourceOrders
    .filter((order) => order.status === "POSTED")
    .flatMap(asLines)
    .filter((line) => line.inventory_batch_id === batch.id)
    .reduce((total, line) => total + line.quantity, 0);
  const postedIn = orders
    .filter(
      (order) =>
        order.status === "POSTED" &&
        order.target_warehouse_id === batch.warehouse_id
    )
    .flatMap(asLines)
    .filter((line) => line.supply_item_id === batch.supply_item_id && line.batch_no === batch.batch_no)
    .reduce((total, line) => total + line.quantity, 0);

  return {
    batch,
    movedOut: inTransit + postedOut,
    inTransit,
    postedOut,
    movedIn: postedIn,
    postedIn,
    available: batch.quantity - inTransit
  };
}

/** 提交移库单前的全部校验，失败时抛出带原因的 TransferRuleError。 */
export function assertTransferSubmittable(
  draft: TransferOrderDraft,
  batches: InventoryBatch[],
  orders: TransferOrder[]
): void {
  if (draft.source_warehouse_id === draft.target_warehouse_id) {
    throw new TransferRuleError(ERROR_CODES.TRANSFER_SAME_WAREHOUSE as ErrorCode);
  }
  if (!draft.lines.length) {
    throw new TransferRuleError(ERROR_CODES.TRANSFER_LINES_EMPTY as ErrorCode);
  }

  for (const line of draft.lines) {
    const batch = batches.find((item) => item.id === line.inventory_batch_id);
    if (!batch || batch.warehouse_id !== draft.source_warehouse_id) {
      throw new TransferRuleError(ERROR_CODES.TRANSFER_INSUFFICIENT_STOCK as ErrorCode, {
        batchNo: line.batch_no,
        available: 0,
        quantity: line.quantity
      });
    }
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      throw new TransferRuleError(ERROR_CODES.TRANSFER_QUANTITY_INVALID as ErrorCode, {
        batchNo: line.batch_no
      });
    }
    const occupied = findInTransitByBatch(orders, batch.id);
    if (occupied) {
      throw new TransferRuleError(ERROR_CODES.TRANSFER_BATCH_ALREADY_IN_TRANSIT as ErrorCode, {
        batchNo: line.batch_no,
        transferNo: occupied.transfer_no
      });
    }
    const frozen = sumFrozenByBatch(orders, batch.id);
    const available = batch.quantity - frozen;
    if (available < line.quantity) {
      throw new TransferRuleError(ERROR_CODES.TRANSFER_INSUFFICIENT_STOCK as ErrorCode, {
        batchNo: line.batch_no,
        available,
        quantity: line.quantity
      });
    }
  }
}

/** 生成带快照的明细行：快照用于目标仓确认收货时复核来源数量是否变化。 */
export function buildSnapshotLines(
  draft: TransferOrderDraft,
  batches: InventoryBatch[],
  orders: TransferOrder[],
  nextLineId: number
): TransferLine[] {
  return draft.lines.map((line, index) => {
    const batch = batches.find((item) => item.id === line.inventory_batch_id);
    if (!batch) throw new TransferRuleError(ERROR_CODES.TRANSFER_ORDER_NOT_FOUND as ErrorCode, { transferNo: line.batch_no });
    const frozen = sumFrozenByBatch(orders, batch.id);
    return {
      id: nextLineId + index,
      inventory_batch_id: batch.id,
      supply_item_id: line.supply_item_id,
      batch_no: line.batch_no,
      quantity: line.quantity,
      source_quantity_snapshot: batch.quantity,
      frozen_quantity_snapshot: frozen + line.quantity
    } satisfies TransferLine;
  });
}

/**
 * 确认收货复核：来源冻结数量/账面数量一旦与提交时快照不一致，停止入账。
 * 任一行复核失败，整张单都不允许部分入账。
 */
export function assertReceivable(
  order: TransferOrder,
  batches: InventoryBatch[],
  orders: TransferOrder[]
): void {
  if (order.status !== "IN_TRANSIT") {
    throw new TransferRuleError(ERROR_CODES.TRANSFER_ORDER_NOT_IN_TRANSIT as ErrorCode, {
      transferNo: order.transfer_no
    });
  }
  for (const line of order.lines) {
    const batch = batches.find((item) => item.id === line.inventory_batch_id);
    if (!batch) {
      throw new TransferRuleError(ERROR_CODES.TRANSFER_ORDER_NOT_FOUND as ErrorCode, {
        transferNo: order.transfer_no
      });
    }
    const frozenCurrent = sumFrozenByBatch(orders, batch.id, order.id);
    if (frozenCurrent !== line.frozen_quantity_snapshot - line.quantity) {
      // 当前实际冻结（排除本单）与提交后应有的冻结不一致，说明期间有其他冻结/解冻。
      throw new TransferRuleError(ERROR_CODES.TRANSFER_FROZEN_CHANGED as ErrorCode, {
        batchNo: line.batch_no,
        frozenSnapshot: line.frozen_quantity_snapshot - line.quantity,
        frozenCurrent
      });
    }
    if (batch.quantity !== line.source_quantity_snapshot) {
      throw new TransferRuleError(ERROR_CODES.TRANSFER_SOURCE_QUANTITY_CHANGED as ErrorCode, {
        batchNo: line.batch_no,
        quantitySnapshot: line.source_quantity_snapshot,
        quantityCurrent: batch.quantity
      });
    }
  }
}

/** 仓库维度合计：移出/在途/已入账/可用。 */
export function summarizeWarehouse(warehouseId: number, orders: TransferOrder[]): {
  movedOut: number;
  inTransit: number;
  postedOut: number;
  postedIn: number;
} {
  const fromSource = (status: string) =>
    orders
      .filter((order) => order.source_warehouse_id === warehouseId && order.status === status)
      .flatMap(asLines)
      .reduce((total, line) => total + line.quantity, 0);
  const inTransit = fromSource("IN_TRANSIT");
  const postedOut = fromSource("POSTED");
  const postedIn = orders
    .filter((order) => order.target_warehouse_id === warehouseId && order.status === "POSTED")
    .flatMap(asLines)
    .reduce((total, line) => total + line.quantity, 0);
  return { movedOut: inTransit + postedOut, inTransit, postedOut, postedIn };
}
