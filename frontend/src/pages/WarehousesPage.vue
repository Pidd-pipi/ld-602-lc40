<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useWarehouseStore } from "../stores/WarehouseStore";
import { useInventoryBatchStore } from "../stores/InventoryBatchStore";
import { useSupplyItemStore } from "../stores/SupplyItemStore";
import { useTransferOrderStore } from "../stores/TransferOrderStore";
import { useTransferFlow } from "../hooks/useTransferFlow";
import { buildBatchView, summarizeWarehouse } from "../services/transferRules";
import TransferCreateForm from "../components/transfer/TransferCreateForm.vue";
import TransferInTransitList from "../components/transfer/TransferInTransitList.vue";
import TransferStatusBadge from "../components/common/TransferStatusBadge.vue";

const warehouseStore = useWarehouseStore();
const batchStore = useInventoryBatchStore();
const supplyItemStore = useSupplyItemStore();
const transferStore = useTransferOrderStore();

const selectedWarehouseId = ref<number>(0);

const flow = useTransferFlow({
  getBatches: () => batchStore.rows,
  submit: (draft) => transferStore.submit(draft),
  // 收货会改来源/目标批次库存，成功后同步刷新批次表
  receive: async (id) => {
    await transferStore.receive(id);
    await batchStore.load();
  }
});
const { feedback } = flow;

const warehouses = computed(() => warehouseStore.rows);
const selectedId = computed(() => selectedWarehouseId.value || warehouses.value[0]?.id || 0);
const warehouseBatches = computed(() =>
  batchStore.rows.filter((batch) => batch.warehouse_id === selectedId.value)
);
const batchViews = computed(() =>
  warehouseBatches.value.map((batch) => buildBatchView(batch, transferStore.rows))
);
const warehouseSummary = computed(() => summarizeWarehouse(selectedId.value, transferStore.rows));

function supplyName(id: number): string {
  return supplyItemStore.rows.find((item) => item.id === id)?.name ?? `物资#${id}`;
}
function supplyUnit(id: number): string {
  return supplyItemStore.rows.find((item) => item.id === id)?.unit ?? "";
}

onMounted(async () => {
  await Promise.all([
    warehouseStore.load(),
    batchStore.load(),
    supplyItemStore.load(),
    transferStore.load()
  ]);
  selectedWarehouseId.value = warehouses.value[0]?.id ?? 0;
});
</script>

<template>
  <section class="warehouse-page">
    <div class="panel">
      <h2>仓库选择</h2>
      <div class="warehouse-tabs">
        <button
          v-for="w in warehouses"
          :key="w.id"
          type="button"
          :class="{ active: w.id === selectedId }"
          @click="selectedWarehouseId = w.id"
        >
          {{ w.name }}
          <small>{{ w.district }}</small>
        </button>
      </div>
      <div class="summary-grid">
        <div class="stat"><span>移出数量合计</span><strong>{{ warehouseSummary.movedOut }}</strong></div>
        <div class="stat"><span>在途冻结合计</span><strong>{{ warehouseSummary.inTransit }}</strong></div>
        <div class="stat"><span>已入账（转出）</span><strong>{{ warehouseSummary.postedOut }}</strong></div>
        <div class="stat"><span>已入账（转入）</span><strong>{{ warehouseSummary.postedIn }}</strong></div>
      </div>
    </div>

    <div class="panel">
      <h2>批次库存与移库数量</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>批次号</th><th>物资</th><th>账面数量</th><th>移出</th><th>在途冻结</th><th>可用</th><th>已入账转出</th><th>已入账转入</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="view of batchViews" :key="view.batch.id">
            <td>{{ view.batch.batch_no }}</td>
            <td>{{ supplyName(view.batch.supply_item_id) }}（{{ supplyUnit(view.batch.supply_item_id) }}）</td>
            <td>{{ view.batch.quantity }}</td>
            <td>{{ view.movedOut }}</td>
            <td><span class="frozen-mark">{{ view.inTransit }}</span></td>
            <td>{{ view.available }}</td>
            <td>{{ view.postedOut }}</td>
            <td>{{ view.postedIn }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!batchViews.length" class="empty">该仓库暂无批次</div>
    </div>

    <TransferCreateForm
      :warehouses="warehouses"
      :transfers="transferStore.rows"
      :flow="flow"
    />

    <div v-if="feedback" class="feedback" :class="feedback.type">
      {{ feedback.text }}
    </div>

    <TransferInTransitList
      :orders="transferStore.rows"
      :warehouses="warehouses"
      :flow="flow"
    />

    <div class="panel legend">
      <h2>状态说明</h2>
      <p><TransferStatusBadge value="IN_TRANSIT" /> 来源仓数量已冻结，等待目标仓确认收货。</p>
      <p><TransferStatusBadge value="POSTED" /> 目标仓已收货，来源扣减、转入库存已入账。</p>
    </div>
  </section>
</template>
