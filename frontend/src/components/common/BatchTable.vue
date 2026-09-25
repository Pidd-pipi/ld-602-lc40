<script setup lang="ts">
import type { InventoryBatch } from "../../types/InventoryBatch";
import type { SupplyItem } from "../../types/SupplyItem";
import type { TransferOrder } from "../../types/TransferOrder";
import { computed } from "vue";
import { formatDate, formatNumber } from "../../utils/formatters";
import StatusBadge from "./StatusBadge.vue";
import EmptyState from "./EmptyState.vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    batches: InventoryBatch[];
    supplyItems: SupplyItem[];
    warehouseName: (id: number) => string;
    transfers?: TransferOrder[];
    frozenOfBatch?: (batchId: number) => number;
    showWarehouse?: boolean;
    adjustable?: boolean;
  }>(),
  { title: "库存批次", transfers: () => [], showWarehouse: false, adjustable: false }
);

const emit = defineEmits<{ (e: "adjust", batch: InventoryBatch): void }>();

const itemName = (id: number) => props.supplyItems.find((item) => item.id === id)?.name ?? `物资${id}`;
const itemUnit = (id: number) => props.supplyItems.find((item) => item.id === id)?.unit ?? "";

const frozenOf = (batchId: number) =>
  props.frozenOfBatch
    ? props.frozenOfBatch(batchId)
    : props.transfers
        .filter((order) => order.source_batch_id === batchId && order.status === "IN_TRANSIT")
        .reduce((sum, order) => sum + order.quantity, 0);

const movedOutOf = (batchId: number) =>
  props.transfers.filter((order) => order.source_batch_id === batchId).reduce((sum, order) => sum + order.quantity, 0);

const postedOf = (batchId: number) =>
  props.transfers
    .filter((order) => order.source_batch_id === batchId && order.status === "POSTED")
    .reduce((sum, order) => sum + order.quantity, 0);

const columns = computed(() => {
  const base = [
    { key: "batch_no", label: "批次号" },
    { key: "supply", label: "物资" },
    ...(props.showWarehouse ? [{ key: "warehouse", label: "所在仓" }] : []),
    { key: "quantity", label: "实际库存" },
    { key: "frozen", label: "在途冻结" },
    { key: "available", label: "可用库存" },
    { key: "movedOut", label: "移出合计" },
    { key: "inTransit", label: "在途" },
    { key: "posted", label: "已入账" },
    { key: "expire_at", label: "到期时间" },
    { key: "quality_status", label: "质量状态" }
  ];
  if (props.adjustable) base.push({ key: "actions", label: "盘点" });
  return base;
});
</script>

<template>
  <div class="shared-widget batch-table">
    <strong class="widget-title">{{ title }}</strong>
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :class="{ num: ['quantity','frozen','available','movedOut','inTransit','posted'].includes(column.key) }">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="batch in batches" :key="batch.id">
          <td class="mono">{{ batch.batch_no }}</td>
          <td>{{ itemName(batch.supply_item_id) }}</td>
          <td v-if="showWarehouse">{{ warehouseName(batch.warehouse_id) }}</td>
          <td class="num">{{ formatNumber(batch.quantity) }} {{ itemUnit(batch.supply_item_id) }}</td>
          <td class="num" :class="{ warn: frozenOf(batch.id) > 0 }">{{ formatNumber(frozenOf(batch.id)) }}</td>
          <td class="num ok">{{ formatNumber(batch.quantity - frozenOf(batch.id)) }}</td>
          <td class="num">{{ formatNumber(movedOutOf(batch.id)) }}</td>
          <td class="num" :class="{ warn: frozenOf(batch.id) > 0 }">{{ formatNumber(frozenOf(batch.id)) }}</td>
          <td class="num">{{ formatNumber(postedOf(batch.id)) }}</td>
          <td>{{ formatDate(batch.expire_at) }}</td>
          <td><StatusBadge :value="batch.quality_status" /></td>
          <td v-if="adjustable">
            <button class="btn small ghost" @click="emit('adjust', batch)">盘点调整</button>
          </td>
        </tr>
      </tbody>
    </table>
    <EmptyState v-if="batches.length === 0" text="该仓库暂无库存批次" />
  </div>
</template>
