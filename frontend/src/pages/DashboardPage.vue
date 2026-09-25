<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useTransferOrderStore } from "../stores/TransferOrderStore";
import { useWarehouseStore } from "../stores/WarehouseStore";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import { TransferStatusText } from "../constants/TransferStatus";
import { formatDate, formatNumber } from "../utils/formatters";

const transferStore = useTransferOrderStore();
const warehouseStore = useWarehouseStore();
const { rows: transfers } = storeToRefs(transferStore);
const { rows: warehouses } = storeToRefs(warehouseStore);

const inTransit = computed(() => transfers.value.filter((order) => order.status === "IN_TRANSIT"));
const inTransitQty = computed(() => inTransit.value.reduce((sum, order) => sum + order.quantity, 0));
const postedQty = computed(() =>
  transfers.value.filter((order) => order.status === "POSTED").reduce((sum, order) => sum + order.quantity, 0)
);
const warehouseName = (id: number) => warehouses.value.find((row) => row.id === id)?.name ?? `仓库${id}`;

onMounted(async () => {
  await Promise.all([transferStore.load(), warehouseStore.load()]);
});
</script>

<template>
  <section class="workbench dashboard-transfer">
    <div class="panel wide">
      <h2>在途移库监控</h2>
      <div class="metrics">
        <StatCard label="在途移库单" :value="inTransit.length" />
        <StatCard label="在途冻结数量" :value="formatNumber(inTransitQty)" />
        <StatCard label="累计已入账数量" :value="formatNumber(postedQty)" />
      </div>
      <table v-if="inTransit.length" class="dashboard-transfer-table">
        <thead>
          <tr><th>单号</th><th>来源仓 → 目标仓</th><th>批次</th><th class="num">冻结数量</th><th>状态</th><th>提交时间</th></tr>
        </thead>
        <tbody>
          <tr v-for="order in inTransit" :key="order.id">
            <td class="mono">{{ order.transfer_no }}</td>
            <td>{{ warehouseName(order.source_warehouse_id) }} → {{ warehouseName(order.target_warehouse_id) }}</td>
            <td class="mono">{{ order.batch_no }}</td>
            <td class="num">{{ formatNumber(order.quantity) }}</td>
            <td><StatusBadge value="TRANSFER_IN_TRANSIT" :text="TransferStatusText.IN_TRANSIT" /></td>
            <td>{{ formatDate(order.created_at) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-hint">当前没有在途移库单</p>
    </div>
  </section>
</template>
