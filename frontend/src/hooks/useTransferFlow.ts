import { computed, ref } from "vue";
import type { InventoryBatch } from "../types/InventoryBatch";
import type { TransferOrderDraft } from "../types/TransferOrder";
import type { TransferOrder } from "../types/TransferOrder";
import { createTransferOrderForm, createTransferLineDraft } from "../constructors/TransferOrderConstructor";

export interface TransferFormLine {
  inventory_batch_id: number;
  supply_item_id: number;
  batch_no: string;
  quantity: number;
}

/**
 * 移库流程：管理新建表单、来源仓批次联动、提交/收货的反馈消息。
 * 业务校验全部下沉到 services/transferRules，这里只负责视图状态。
 */
export function useTransferFlow(options: {
  getBatches: () => InventoryBatch[];
  submit: (draft: TransferOrderDraft) => Promise<void>;
  receive: (id: number) => Promise<void>;
}) {
  const form = ref<TransferOrderDraft>(createTransferOrderForm());
  const feedback = ref<{ type: "success" | "error"; text: string } | null>(null);

  const sourceBatches = computed(() =>
    options.getBatches().filter((batch) => batch.warehouse_id === form.value.source_warehouse_id)
  );

  function selectSourceWarehouse(warehouseId: number) {
    form.value.source_warehouse_id = warehouseId;
    form.value.lines = [];
  }

  function addLine(batch: InventoryBatch) {
    const exists = form.value.lines.some((line) => line.inventory_batch_id === batch.id);
    if (exists) return;
    form.value.lines.push(
      createTransferLineDraft({
        inventory_batch_id: batch.id,
        supply_item_id: batch.supply_item_id,
        batch_no: batch.batch_no,
        quantity: 1
      })
    );
  }

  function removeLine(batchId: number) {
    form.value.lines = form.value.lines.filter((line) => line.inventory_batch_id !== batchId);
  }

  function resetForm() {
    form.value = createTransferOrderForm();
    feedback.value = null;
  }

  async function submitForm() {
    try {
      await options.submit(form.value);
      feedback.value = { type: "success", text: "移库单已提交，来源数量已冻结，等待目标仓收货。" };
      resetForm();
    } catch (error) {
      feedback.value = {
        type: "error",
        text: error instanceof Error ? error.message : "提交失败，请检查表单"
      };
    }
  }

  async function confirmReceive(order: TransferOrder) {
    try {
      await options.receive(order.id);
      feedback.value = { type: "success", text: `移库单 ${order.transfer_no} 已确认收货并转入目标仓库存。` };
    } catch (error) {
      feedback.value = {
        type: "error",
        text: error instanceof Error ? error.message : "确认收货失败"
      };
    }
  }

  return {
    form,
    feedback,
    sourceBatches,
    selectSourceWarehouse,
    addLine,
    removeLine,
    resetForm,
    submitForm,
    confirmReceive
  };
}

export type TransferFlow = ReturnType<typeof useTransferFlow>;
