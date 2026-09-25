import type { TransferLine, TransferOrder, TransferOrderDraft } from "../types/TransferOrder";
import type { TransferStatus } from "../types/TransferStatus";

export const createDefaultTransferLine = (overrides: Partial<TransferLine> = {}): TransferLine => ({
  id: 0,
  inventory_batch_id: 0,
  supply_item_id: 0,
  batch_no: "",
  quantity: 0,
  source_quantity_snapshot: 0,
  frozen_quantity_snapshot: 0,
  ...overrides
});

export const createTransferLineDraft = (
  overrides: Pick<TransferLine, "inventory_batch_id" | "supply_item_id" | "batch_no" | "quantity"> &
    Partial<TransferLine>
) => createDefaultTransferLine(overrides);

export const createDefaultTransferOrder = (overrides: Partial<TransferOrder> = {}): TransferOrder => ({
  id: 0,
  transfer_no: "",
  source_warehouse_id: 0,
  target_warehouse_id: 0,
  status: "IN_TRANSIT" as TransferStatus,
  created_by: "",
  remark: "",
  lines: [],
  created_at: "",
  shipped_at: "",
  received_at: "",
  ...overrides
});

/** 新建移库单表单：不含系统字段。 */
export const createTransferOrderForm = (
  overrides: Partial<TransferOrderDraft> = {}
): TransferOrderDraft => ({
  source_warehouse_id: 0,
  target_warehouse_id: 0,
  created_by: "仓库员",
  remark: "",
  lines: [],
  ...overrides
});

/** 后端/本地存储返回对象构造。 */
export const createTransferOrderResponse = createDefaultTransferOrder;
