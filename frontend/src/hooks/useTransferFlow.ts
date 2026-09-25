import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useTransferOrderStore } from "../stores/TransferOrderStore";
import { useInventoryBatchStore } from "../stores/InventoryBatchStore";
import { useWarehouseStore } from "../stores/WarehouseStore";
import { useSupplyItemStore } from "../stores/SupplyItemStore";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { TransferOrderCreatePayload } from "../types/TransferOrder";

/**
 * 移库流程 hook：串联「提交冻结 → 在途 → 确认收货入账」状态机，
 * 统一收口错误提示与操作日志模板，供仓库页和调拨页共用。
 */
export function useTransferFlow() {
  const transferStore = useTransferOrderStore();
  const batchStore = useInventoryBatchStore();
  const warehouseStore = useWarehouseStore();
  const supplyItemStore = useSupplyItemStore();

  const { rows: transfers, loading, submitting } = storeToRefs(transferStore);
  const { rows: batches } = storeToRefs(batchStore);
  const { rows: warehouses } = storeToRefs(warehouseStore);
  const { rows: supplyItems } = storeToRefs(supplyItemStore);

  const feedback = ref<{ type: "success" | "error"; message: string } | null>(null);

  const warehouseName = (id: number) => warehouses.value.find((row) => row.id === id)?.name ?? `仓库${id}`;
  const supplyName = (id: number) => supplyItems.value.find((row) => row.id === id)?.name ?? `物资${id}`;
  const supplyUnit = (id: number) => supplyItems.value.find((row) => row.id === id)?.unit ?? "";

  /** 批次在途冻结数量 */
  const frozenOfBatch = (batchId: number) =>
    transfers.value
      .filter((order) => order.source_batch_id === batchId && order.status === "IN_TRANSIT")
      .reduce((sum, order) => sum + order.quantity, 0);

  const availableOfBatch = (batchId: number) => {
    const batch = batches.value.find((row) => row.id === batchId);
    return batch ? batch.quantity - frozenOfBatch(batchId) : 0;
  };

  const inTransitTransfers = computed(() => transfers.value.filter((order) => order.status === "IN_TRANSIT"));
  const postedTransfers = computed(() => transfers.value.filter((order) => order.status === "POSTED"));

  /** 仓库维度汇总：移出 / 在途 / 已入账 */
  const warehouseSummary = (warehouseId: number) => {
    const mine = transfers.value.filter((order) => order.source_warehouse_id === warehouseId);
    const movedOut = mine.reduce((sum, order) => sum + order.quantity, 0);
    const inTransit = mine.filter((order) => order.status === "IN_TRANSIT").reduce((sum, order) => sum + order.quantity, 0);
    const posted = mine.filter((order) => order.status === "POSTED").reduce((sum, order) => sum + order.quantity, 0);
    return { movedOut, inTransit, posted };
  };

  /** 批次维度汇总 */
  const batchSummary = (batchId: number) => {
    const mine = transfers.value.filter((order) => order.source_batch_id === batchId);
    const movedOut = mine.reduce((sum, order) => sum + order.quantity, 0);
    const inTransit = mine.filter((order) => order.status === "IN_TRANSIT").reduce((sum, order) => sum + order.quantity, 0);
    const posted = mine.filter((order) => order.status === "POSTED").reduce((sum, order) => sum + order.quantity, 0);
    return { movedOut, inTransit, posted };
  };

  async function submitTransfer(payload: TransferOrderCreatePayload) {
    feedback.value = null;
    try {
      const created = await transferStore.submit(payload);
      await batchStore.load();
      feedback.value = { type: "success", message: `${LOG_TEMPLATES.TransferOrder[0]}：单号 ${created.transfer_no}，已冻结来源批次 ${created.quantity} ${supplyUnit(created.supply_item_id)}` };
      return created;
    } catch (error) {
      feedback.value = { type: "error", message: (error as { message?: string })?.message ?? "移库单提交失败" };
      throw error;
    }
  }

  async function receiveTransfer(id: number) {
    feedback.value = null;
    try {
      const received = await transferStore.receive(id);
      await batchStore.load();
      feedback.value = { type: "success", message: `${LOG_TEMPLATES.TransferOrder[1]}：单号 ${received.transfer_no}，${received.quantity} ${supplyUnit(received.supply_item_id)} 已转入「${warehouseName(received.target_warehouse_id)}」` };
      return received;
    } catch (error) {
      feedback.value = { type: "error", message: (error as { message?: string })?.message ?? "确认收货失败" };
      throw error;
    }
  }

  return {
    transfers,
    loading,
    submitting,
    batches,
    warehouses,
    supplyItems,
    feedback,
    inTransitTransfers,
    postedTransfers,
    warehouseName,
    supplyName,
    supplyUnit,
    frozenOfBatch,
    availableOfBatch,
    warehouseSummary,
    batchSummary,
    submitTransfer,
    receiveTransfer
  };
}
