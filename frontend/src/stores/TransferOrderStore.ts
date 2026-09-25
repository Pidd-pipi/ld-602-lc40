import { defineStore } from "pinia";
import {
  createTransferOrder,
  listTransferOrder,
  receiveTransferOrder
} from "../api/TransferOrder";
import type { TransferOrder, TransferOrderDraft } from "../types/TransferOrder";
import { TransferRuleError } from "../services/transferRules";

interface TransferOrderState {
  rows: TransferOrder[];
  loading: boolean;
  submitting: boolean;
  lastError: string;
}

export const useTransferOrderStore = defineStore("transferOrder", {
  state: (): TransferOrderState => ({ rows: [], loading: false, submitting: false, lastError: "" }),
  getters: {
    inTransitRows: (state) => state.rows.filter((row) => row.status === "IN_TRANSIT"),
    postedRows: (state) => state.rows.filter((row) => row.status === "POSTED")
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listTransferOrder();
        this.lastError = "";
      } finally {
        this.loading = false;
      }
    },
    /** 提交移库单；校验失败时写入 lastError 并抛出，由页面提示具体原因。 */
    async submit(draft: TransferOrderDraft) {
      this.submitting = true;
      try {
        await createTransferOrder(draft);
        this.lastError = "";
        await this.load();
      } catch (error) {
        this.lastError = error instanceof TransferRuleError ? error.message : "提交移库单失败，请重试";
        throw error;
      } finally {
        this.submitting = false;
      }
    },
    /** 目标仓确认收货；来源冻结数量变化时拒绝入账并提示原因。 */
    async receive(id: number) {
      this.submitting = true;
      try {
        await receiveTransferOrder(id);
        this.lastError = "";
        await this.load();
      } catch (error) {
        this.lastError = error instanceof TransferRuleError ? error.message : "确认收货失败，请重试";
        throw error;
      } finally {
        this.submitting = false;
      }
    }
  }
});
