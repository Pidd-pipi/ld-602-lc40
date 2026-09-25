<script setup lang="ts">
import type { TransferOrder } from "../../types/TransferOrder";
import { TransferStatusText } from "../../constants/TransferStatus";
import { formatDate, formatNumber } from "../../utils/formatters";
import EmptyState from "./EmptyState.vue";
import StatusBadge from "./StatusBadge.vue";

defineProps<{
  rows: TransferOrder[];
  warehouseName: (id: number) => string;
  supplyName: (id: number) => string;
  supplyUnit: (id: number) => string;
  acting?: boolean;
}>();

const emit = defineEmits<{ (e: "receive", id: number): void }>();
</script>

<template>
  <div class="transfer-table">
    <table>
      <thead>
        <tr>
          <th>移库单号</th>
          <th>来源仓 → 目标仓</th>
          <th>批次 / 物资</th>
          <th class="num">数量</th>
          <th>状态</th>
          <th>提交时间</th>
          <th>收货时间</th>
          <th>经办人</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in rows" :key="order.id">
          <td class="mono">{{ order.transfer_no }}</td>
          <td>{{ warehouseName(order.source_warehouse_id) }} → {{ warehouseName(order.target_warehouse_id) }}</td>
          <td>
            <span class="mono">{{ order.batch_no }}</span>
            <small>{{ supplyName(order.supply_item_id) }}</small>
          </td>
          <td class="num">{{ formatNumber(order.quantity) }} {{ supplyUnit(order.supply_item_id) }}</td>
          <td><StatusBadge :value="`TRANSFER_${order.status}`" :text="TransferStatusText[order.status]" /></td>
          <td>{{ order.created_at ? formatDate(order.created_at) : "-" }}</td>
          <td>{{ order.received_at ? formatDate(order.received_at) : "-" }}</td>
          <td>{{ order.created_by }}</td>
          <td>
            <button
              v-if="order.status === 'IN_TRANSIT'"
              class="btn small primary"
              :disabled="acting"
              @click="emit('receive', order.id)"
            >确认收货</button>
          </td>
        </tr>
      </tbody>
    </table>
    <EmptyState v-if="rows.length === 0" text="暂无移库单" />
  </div>
</template>
