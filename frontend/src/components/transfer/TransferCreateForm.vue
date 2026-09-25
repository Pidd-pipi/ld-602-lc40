<script setup lang="ts">
import type { Warehouse } from "../../types/Warehouse";
import type { InventoryBatch } from "../../types/InventoryBatch";
import type { TransferOrder } from "../../types/TransferOrder";
import { sumFrozenByBatch } from "../../services/transferRules";
import type { TransferFlow } from "../../hooks/useTransferFlow";

const props = defineProps<{
  warehouses: Warehouse[];
  transfers: TransferOrder[];
  flow: TransferFlow;
}>();

const { form, sourceBatches } = props.flow;

function availableQuantity(batch: InventoryBatch): number {
  // 可用数量 = 账面数量 - 所有在途移库单的冻结量。
  const frozen = sumFrozenByBatch(props.transfers, batch.id);
  return batch.quantity - frozen;
}

const targetWarehouses = () => props.warehouses.filter((w) => w.id !== form.value.source_warehouse_id);
</script>

<template>
  <div class="panel transfer-form">
    <h2>新建移库单</h2>
    <div class="form-grid">
      <label>
        <span>来源仓</span>
        <select
          :value="form.source_warehouse_id || ''"
          @change="flow.selectSourceWarehouse(Number(($event.target as HTMLSelectElement).value))"
        >
          <option value="" disabled>请选择来源仓</option>
          <option v-for="w in warehouses" :key="w.id" :value="w.id">{{ w.name }}（{{ w.district }}）</option>
        </select>
      </label>
      <label>
        <span>目标仓</span>
        <select v-model.number="form.target_warehouse_id">
          <option :value="0" disabled>请选择目标仓</option>
          <option v-for="w in targetWarehouses()" :key="w.id" :value="w.id">{{ w.name }}（{{ w.district }}）</option>
        </select>
      </label>
      <label class="wide">
        <span>备注</span>
        <input v-model="form.remark" type="text" placeholder="例如：分仓防汛补货" />
      </label>
    </div>

    <div class="batch-picker">
      <span class="field-label">选择来源仓批次（可用数量 = 账面 - 在途冻结）</span>
      <div v-if="!form.source_warehouse_id" class="empty">请先选择来源仓</div>
      <table v-else-if="sourceBatches.length" class="data-table">
        <thead>
          <tr><th>批次号</th><th>物资 ID</th><th>账面</th><th>在途冻结</th><th>可用</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="batch in sourceBatches" :key="batch.id">
            <td>{{ batch.batch_no }}</td>
            <td>{{ batch.supply_item_id }}</td>
            <td>{{ batch.quantity }}</td>
            <td>{{ batch.quantity - availableQuantity(batch) }}</td>
            <td>{{ availableQuantity(batch) }}</td>
            <td>
              <button
                type="button"
                class="link-btn"
                :disabled="!!form.lines.find((l) => l.inventory_batch_id === batch.id)"
                @click="flow.addLine(batch)"
              >加入移库</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty">该仓库暂无批次库存</div>
    </div>

    <div v-if="form.lines.length" class="selected-lines">
      <strong>本次移库明细（{{ form.lines.length }} 条）</strong>
      <ul>
        <li v-for="line in form.lines" :key="line.inventory_batch_id">
          <span>批次 {{ line.batch_no }}</span>
          <label class="inline-qty">数量
            <input class="qty-input" type="number" min="1" v-model.number="line.quantity" />
          </label>
          <button type="button" class="link-btn danger" @click="flow.removeLine(line.inventory_batch_id)">删除</button>
        </li>
      </ul>
    </div>

    <div class="form-actions">
      <button type="button" class="btn primary" @click="flow.submitForm()">提交并冻结来源数量</button>
      <button type="button" class="btn" @click="flow.resetForm()">清空</button>
    </div>
  </div>
</template>
