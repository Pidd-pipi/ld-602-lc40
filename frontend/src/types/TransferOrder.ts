import type { TransferStatus } from "../types/TransferStatus";

/**
 * 仓库间移库单：提交后来源仓批次数量先冻结（在途），目标仓确认收货后才转入库存。
 */
export interface TransferOrder {
  id: number;
  transfer_no: string;
  source_warehouse_id: number;
  target_warehouse_id: number;
  supply_item_id: number;
  batch_no: string;
  quantity: number;
  status: TransferStatus;
  created_by: string;
  created_at: string;
  received_at: string | null;
  /** 提交时冻结的来源批次 */
  source_batch_id: number;
  /** 收货后入账的目标批次 */
  target_batch_id: number | null;
  /** 提交时来源批次实际库存快照，用于确认收货时的乐观校验 */
  source_quantity_snapshot: number;
  /** 提交时该批次全部在途冻结数量快照（含本单） */
  frozen_total_snapshot: number;
  remark: string;
}

/** 创建移库单请求 */
export interface TransferOrderCreatePayload {
  source_warehouse_id: number;
  target_warehouse_id: number;
  source_batch_id: number;
  quantity: number;
  created_by: string;
  remark?: string;
}
