<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useWarehouseStore } from "../stores/WarehouseStore";
import { useInventoryBatchStore } from "../stores/InventoryBatchStore";
import { useSupplyItemStore } from "../stores/SupplyItemStore";
import { useTransferOrderStore } from "../stores/TransferOrderStore";
import { useTransferFlow } from "../hooks/useTransferFlow";
import { adjustInventoryBatchQuantity } from "../api/InventoryBatch";
import BatchTable from "../components/common/BatchTable.vue";
import StatCard from "../components/common/StatCard.vue";
import TransferOrderDialog from "../components/common/TransferOrderDialog.vue";
import TransferOrderTable from "../components/common/TransferOrderTable.vue";
import type { InventoryBatch } from "../types/InventoryBatch";
import type { TransferOrderCreatePayload } from "../types/TransferOrder";
import { formatNumber } from "../utils/formatters";

const warehouseStore = useWarehouseStore();
const batchStore = useInventoryBatchStore();
const supplyItemStore = useSupplyItemStore();
const transferOrderStore = useTransferOrderStore();
const { rows: warehouses } = storeToRefs(warehouseStore);
const { rows: batches } = storeToRefs(batchStore);
const { rows: supplyItems } = storeToRefs(supplyItemStore);

const {
  transfers,
  submitting,
  feedback,
  warehouseName,
  supplyName,
  supplyUnit,
  frozenOfBatch,
  warehouseSummary,
  submitTransfer,
  receiveTransfer
} = useTransferFlow();

const selectedWarehouseId = ref<number>(1);
const dialogVisible = ref(false);
const adjustTarget = ref<InventoryBatch | null>(null);
const adjustQuantity = ref<number>(0);
const adjusting = ref(false);
const receivingId = ref<number | null>(null);

const selectedWarehouse = computed(() => warehouses.value.find((row) => row.id === selectedWarehouseId.value));
const warehouseBatches = computed(() => batches.value.filter((batch) => batch.warehouse_id === selectedWarehouseId.value));
const warehouseTransfers = computed(() =>
  transfers.value
    .filter((order) => order.source_warehouse_id === selectedWarehouseId.value || order.target_warehouse_id === selectedWarehouseId.value)
    .slice()
    .sort((a, b) => b.id - a.id)
);
const inTransitInWarehouse = computed(() => warehouseTransfers.value.filter((order) => order.status === "IN_TRANSIT"));

const summary = computed(() => warehouseSummary(selectedWarehouseId.value));

const stockTotal = computed(() => warehouseBatches.value.reduce((sum, batch) => sum + batch.quantity, 0));
const frozenTotal = computed(() => warehouseBatches.value.reduce((sum, batch) => sum + frozenOfBatch(batch.id), 0));

onMounted(async () => {
  await Promise.all([warehouseStore.load(), batchStore.load(), supplyItemStore.load(), transferOrderStore.load()]);
  if (warehouses.value.length > 0) selectedWarehouseId.value = warehouses.value[0].id;
});

async function onSubmit(payload: TransferOrderCreatePayload) {
  try {
    await submitTransfer(payload);
    dialogVisible.value = false;
  } catch {
    // 错误原因由 useTransferFlow 的 feedback 统一展示
  }
}

async function onReceive(id: number) {
  receivingId.value = id;
  try {
    await receiveTransfer(id);
  } catch {
    // 冻结数量变化等拦截原因由 feedback 展示，单据保留在途状态
  } finally {
    receivingId.value = null;
  }
}

function openAdjust(batch: InventoryBatch) {
  adjustTarget.value = batch;
  adjustQuantity.value = batch.quantity;
}

async function confirmAdjust() {
  if (!adjustTarget.value) return;
  adjusting.value = true;
  try {
    await adjustInventoryBatchQuantity(adjustTarget.value.id, adjustQuantity.value);
    await batchStore.load();
    adjustTarget.value = null;
  } catch (error) {
    feedback.value = { type: "error", message: (error as { message?: string })?.message ?? "盘点调整失败" };
  } finally {
    adjusting.value = false;
  }
}
</script>

<template>
  <section class="warehouse-page">
    <div class="page-toolbar">
      <div class="warehouse-tabs">
        <button
          v-for="warehouse in warehouses"
          :key="warehouse.id"
          :class="{ active: warehouse.id === selectedWarehouseId }"
          @click="selectedWarehouseId = warehouse.id"
        >{{ warehouse.name }}</button>
      </div>
      <button class="btn primary" @click="dialogVisible = true">＋ 新建移库单</button>
    </div>

    <p v-if="selectedWarehouse" class="warehouse-meta">
      {{ selectedWarehouse.district }} · {{ selectedWarehouse.address }} · 仓管员工号 {{ selectedWarehouse.manager_id }} ·
      联系电话 {{ selectedWarehouse.contact_phone }}
    </p>

    <section class="metrics metrics-5">
      <StatCard label="实际库存合计" :value="formatNumber(stockTotal)" />
      <StatCard label="在途冻结合计" :value="formatNumber(frozenTotal)" />
      <StatCard label="移出数量合计" :value="formatNumber(summary.movedOut)" />
      <StatCard label="在途数量" :value="formatNumber(summary.inTransit)" />
      <StatCard label="已入账数量" :value="formatNumber(summary.posted)" />
    </section>

    <div v-if="feedback" :class="['feedback', feedback.type]" role="alert">
      <span>{{ feedback.type === "success" ? "✓" : "⚠" }}</span>
      <p>{{ feedback.message }}</p>
      <button class="icon-btn" @click="feedback = null">×</button>
    </div>

    <div class="panel">
      <h2>在途移库单（等待目标仓收货）</h2>
      <TransferOrderTable
        :rows="inTransitInWarehouse"
        :warehouse-name="warehouseName"
        :supply-name="supplyName"
        :supply-unit="supplyUnit"
        :acting="receivingId !== null"
        @receive="onReceive"
      />
    </div>

    <div class="panel">
      <h2>库存批次（实际 / 冻结 / 可用 / 移出 / 在途 / 已入账）</h2>
      <BatchTable
        title=""
        :batches="warehouseBatches"
        :supply-items="supplyItems"
        :warehouse-name="warehouseName"
        :transfers="transfers"
        :frozen-of-batch="frozenOfBatch"
        :adjustable="true"
        @adjust="openAdjust"
      />
    </div>

    <div class="panel">
      <h2>移库记录</h2>
      <TransferOrderTable
        :rows="warehouseTransfers"
        :warehouse-name="warehouseName"
        :supply-name="supplyName"
        :supply-unit="supplyUnit"
        :acting="receivingId !== null"
        @receive="onReceive"
      />
    </div>

    <TransferOrderDialog
      v-model="dialogVisible"
      :warehouses="warehouses"
      :batches="batches"
      :supply-items="supplyItems"
      :submitting="submitting"
      :frozen-of-batch="frozenOfBatch"
      @submit="onSubmit"
    />

    <div v-if="adjustTarget" class="modal-mask" @click.self="adjustTarget = null">
      <div class="modal">
        <header>
          <h3>盘点调整批次数量</h3>
          <button class="icon-btn" @click="adjustTarget = null">×</button>
        </header>
        <p class="modal-tip">
          批次 <strong>{{ adjustTarget.batch_no }}</strong> 当前实际库存 {{ adjustTarget.quantity }}，
          在途冻结 {{ frozenOfBatch(adjustTarget.id) }}。若在移库单收货前改动库存数量，确认收货时将触发冻结校验并停止入账。
        </p>
        <input v-model.number="adjustQuantity" type="number" :min="frozenOfBatch(adjustTarget.id)" />
        <footer>
          <button class="btn ghost" @click="adjustTarget = null">取消</button>
          <button class="btn primary" :disabled="adjusting" @click="confirmAdjust">
            {{ adjusting ? "保存中…" : "保存盘点结果" }}
          </button>
        </footer>
      </div>
    </div>
  </section>
</template>
