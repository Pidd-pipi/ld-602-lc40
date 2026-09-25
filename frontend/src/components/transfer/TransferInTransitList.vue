<script setup lang="ts">
import type { Warehouse } from "../../types/Warehouse";
import type { TransferOrder } from "../../types/TransferOrder";
import type { TransferFlow } from "../../hooks/useTransferFlow";
import TransferStatusBadge from "../common/TransferStatusBadge.vue";
import { formatDate } from "../../utils/formatters";

const props = defineProps<{
  orders: TransferOrder[];
  warehouses: Warehouse[];
  flow: TransferFlow;
}>();

function warehouseName(id: number): string {
  return props.warehouses.find((w) => w.id === id)?.name ?? `仓库#${id}`;
}
</script>

<template>
  <div class="panel">
    <h2>移库单列表（在途 / 已入账）</h2>
    <div v-if="!orders.length" class="empty">暂无移库单</div>
    <article v-for="order in orders" :key="order.id" class="transfer-card">
      <header>
        <div>
          <strong class="transfer-no">{{ order.transfer_no }}</strong>
          <TransferStatusBadge :value="order.status" />
        </div>
        <div class="transfer-meta">
          <span>{{ warehouseName(order.source_warehouse_id) }} → {{ warehouseName(order.target_warehouse_id) }}</span>
          <span>提交：{{ formatDate(order.created_at) }}</span>
          <span v-if="order.status === 'POSTED'">收货：{{ formatDate(order.received_at) }}</span>
        </div>
      </header>
      <table class="data-table">
        <thead>
          <tr><th>批次号</th><th>物资 ID</th><th>数量</th><th>提交时账面快照</th><th>提交时冻结快照</th></tr>
        </thead>
        <tbody>
          <tr v-for="line in order.lines" :key="line.id">
            <td>{{ line.batch_no }}</td>
            <td>{{ line.supply_item_id }}</td>
            <td>{{ line.quantity }}</td>
            <td>{{ line.source_quantity_snapshot }}</td>
            <td>{{ line.frozen_quantity_snapshot }}</td>
          </tr>
        </tbody>
      </table>
      <footer v-if="order.remark || order.status === 'IN_TRANSIT'" class="transfer-footer">
        <em v-if="order.remark">备注：{{ order.remark }}（发起人：{{ order.created_by }}）</em>
        <button
          v-if="order.status === 'IN_TRANSIT'"
          type="button"
          class="btn primary"
          @click="flow.confirmReceive(order)"
        >目标仓确认收货</button>
      </footer>
    </article>
  </div>
</template>
