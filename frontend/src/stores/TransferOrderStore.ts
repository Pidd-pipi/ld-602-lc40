import { defineStore } from "pinia";
import { listTransferOrder, createTransferOrder, receiveTransferOrder } from "../api/TransferOrder";
import type { TransferOrder, TransferOrderCreatePayload } from "../types/TransferOrder";

export const useTransferOrderStore = defineStore("transferOrder", {
  state: () => ({ rows: [] as TransferOrder[], loading: false, submitting: false }),
  getters: {
    inTransitRows: (state) => state.rows.filter((row) => row.status === "IN_TRANSIT"),
    postedRows: (state) => state.rows.filter((row) => row.status === "POSTED"),
    /** 某批次在途冻结数量 */
    frozenOfBatch: (state) => (batchId: number) =>
      state.rows
        .filter((row) => row.source_batch_id === batchId && row.status === "IN_TRANSIT")
        .reduce((sum, row) => sum + row.quantity, 0)
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listTransferOrder();
      } finally {
        this.loading = false;
      }
    },
    /** 提交移库单：来源数量先冻结（在途） */
    async submit(payload: TransferOrderCreatePayload) {
      this.submitting = true;
      try {
        const created = await createTransferOrder(payload);
        this.rows = [created, ...this.rows.filter((row) => row.id !== created.id)];
        return created;
      } finally {
        this.submitting = false;
      }
    },
    /** 目标仓确认收货：冻结数量转入库存 */
    async receive(id: number) {
      const received = await receiveTransferOrder(id);
      const index = this.rows.findIndex((row) => row.id === id);
      if (index >= 0) this.rows[index] = received;
      else this.rows = [received, ...this.rows];
      return received;
    }
  }
});
