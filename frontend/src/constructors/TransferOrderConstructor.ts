import type { TransferOrder, TransferOrderCreatePayload } from "../types/TransferOrder";

/** 移库单默认对象：列表/详情占位 */
export const createDefaultTransferOrder = (overrides: Partial<TransferOrder> = {}): TransferOrder => ({
  id: 0,
  transfer_no: "",
  source_warehouse_id: 1,
  target_warehouse_id: 2,
  supply_item_id: 0,
  batch_no: "",
  quantity: 1,
  status: "IN_TRANSIT",
  created_by: "",
  created_at: "",
  received_at: null,
  source_batch_id: 0,
  target_batch_id: null,
  source_quantity_snapshot: 0,
  frozen_total_snapshot: 0,
  remark: "",
  ...overrides
});

/** 新建移库单表单 */
export const createTransferOrderForm = (
  overrides: Partial<TransferOrderCreatePayload> = {}
): TransferOrderCreatePayload => ({
  source_warehouse_id: 1,
  target_warehouse_id: 2,
  source_batch_id: 0,
  quantity: 1,
  created_by: "仓库员-王磊",
  remark: "",
  ...overrides
});

/** 响应对象包装，保持与后端 DTO 结构一致 */
export const createTransferOrderResponse = createDefaultTransferOrder;
