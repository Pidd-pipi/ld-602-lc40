import type { TransferStatus } from "../types/TransferStatus";

/** 移库单中的一条批次明细；提交时锁定快照，目标仓收货时按快照入账。 */
export interface TransferLine {
  id: number;
  inventory_batch_id: number;
  supply_item_id: number;
  batch_no: string;
  quantity: number;
  /** 提交时该来源批次的账面库存快照，用于收货时复核来源数量是否变化。 */
  source_quantity_snapshot: number;
  /** 提交时该来源批次的累计冻结数量快照，用于收货时复核冻结数量是否变化。 */
  frozen_quantity_snapshot: number;
}

export interface TransferOrder {
  id: number;
  transfer_no: string;
  source_warehouse_id: number;
  target_warehouse_id: number;
  status: TransferStatus;
  created_by: string;
  remark: string;
  lines: TransferLine[];
  created_at: string;
  shipped_at: string;
  received_at: string;
}

/** 创建移库单时的表单结构（此时明细尚未带快照）。 */
export type TransferOrderDraft = Omit<
  TransferOrder,
  "id" | "transfer_no" | "status" | "created_at" | "shipped_at" | "received_at" | "lines"
> & {
  lines: Array<Pick<TransferLine, "inventory_batch_id" | "supply_item_id" | "batch_no" | "quantity">>;
};
