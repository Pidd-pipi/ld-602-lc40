<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Warehouse } from "../../types/Warehouse";
import type { SupplyItem } from "../../types/SupplyItem";
import type { InventoryBatch } from "../../types/InventoryBatch";
import type { TransferOrderCreatePayload } from "../../types/TransferOrder";
import { createTransferOrderForm } from "../../constructors/TransferOrderConstructor";
import { formatNumber } from "../../utils/formatters";

const props = defineProps<{
  modelValue: boolean;
  warehouses: Warehouse[];
  batches: InventoryBatch[];
  supplyItems: SupplyItem[];
  submitting: boolean;
  frozenOfBatch: (batchId: number) => number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", payload: TransferOrderCreatePayload): Promise<void> | void;
}>();

const form = ref<TransferOrderCreatePayload>(createTransferOrderForm());

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) form.value = createTransferOrderForm();
  }
);

const sourceBatches = computed(() =>
  props.batches.filter((batch) => batch.warehouse_id === form.value.source_warehouse_id)
);

const selectedBatch = computed(() => props.batches.find((batch) => batch.id === form.value.source_batch_id) ?? null);
const selectedItem = computed(() =>
  props.supplyItems.find((item) => item.id === selectedBatch.value?.supply_item_id) ?? null
);
const frozenQty = computed(() => (selectedBatch.value ? props.frozenOfBatch(selectedBatch.value.id) : 0));
const availableQty = computed(() => (selectedBatch.value ? selectedBatch.value.quantity - frozenQty.value : 0));

const sameWarehouse = computed(() => form.value.source_warehouse_id === form.value.target_warehouse_id);
const insufficient = computed(() => form.value.quantity > availableQty.value);
const batchInTransit = computed(() => (selectedBatch.value ? frozenQty.value > 0 : false));

const canSubmit = computed(
  () =>
    form.value.source_batch_id > 0 &&
    form.value.quantity > 0 &&
    !sameWarehouse.value &&
    !insufficient.value &&
    !batchInTransit.value &&
    !props.submitting
);

function onSourceWarehouseChange() {
  form.value.source_batch_id = 0;
}

async function onSubmit() {
  if (!canSubmit.value) return;
  await emit("submit", { ...form.value });
}
</script>

<template>
  <div v-if="modelValue" class="modal-mask" @click.self="emit('update:modelValue', false)">
    <div class="modal transfer-dialog">
      <header>
        <h3>新建移库单</h3>
        <button class="icon-btn" @click="emit('update:modelValue', false)">×</button>
      </header>
      <div class="form-grid">
        <label class="field">
          <span>来源仓 *</span>
          <select v-model.number="form.source_warehouse_id" @change="onSourceWarehouseChange">
            <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">{{ warehouse.name }}</option>
          </select>
        </label>
        <label class="field">
          <span>目标仓 *</span>
          <select v-model.number="form.target_warehouse_id">
            <option
              v-for="warehouse in warehouses"
              :key="warehouse.id"
              :value="warehouse.id"
              :disabled="warehouse.id === form.source_warehouse_id"
            >{{ warehouse.name }}</option>
          </select>
        </label>
        <p v-if="sameWarehouse" class="field-error">来源仓与目标仓不能相同</p>

        <label class="field field-wide">
          <span>移出批次 *</span>
          <select v-model.number="form.source_batch_id">
            <option :value="0" disabled>请选择来源仓内的库存批次</option>
            <option v-for="batch in sourceBatches" :key="batch.id" :value="batch.id">
              {{ batch.batch_no }} ·
              {{ supplyItems.find((item) => item.id === batch.supply_item_id)?.name ?? batch.supply_item_id }} ·
              库存 {{ formatNumber(batch.quantity) }}
            </option>
          </select>
        </label>

        <div v-if="selectedBatch" class="batch-hint field-wide">
          <div>
            <span class="hint-label">批次号</span><strong>{{ selectedBatch.batch_no }}</strong>
          </div>
          <div>
            <span class="hint-label">物资</span><strong>{{ selectedItem?.name ?? "-" }}</strong>
          </div>
          <div>
            <span class="hint-label">实际库存</span><strong>{{ formatNumber(selectedBatch.quantity) }} {{ selectedItem?.unit }}</strong>
          </div>
          <div>
            <span class="hint-label">在途冻结</span>
            <strong :class="{ warn: frozenQty > 0 }">{{ formatNumber(frozenQty) }} {{ selectedItem?.unit }}</strong>
          </div>
          <div>
            <span class="hint-label">可移出</span>
            <strong class="ok">{{ formatNumber(availableQty) }} {{ selectedItem?.unit }}</strong>
          </div>
        </div>
        <p v-if="batchInTransit" class="field-error">该批次已有在途移库单，需目标仓确认收货后才能再次移出</p>

        <label class="field">
          <span>移库数量 *</span>
          <input v-model.number="form.quantity" type="number" min="1" :max="availableQty" />
        </label>
        <label class="field">
          <span>经办人</span>
          <input v-model="form.created_by" type="text" placeholder="仓库员姓名" />
        </label>
        <p v-if="insufficient && form.quantity > 0" class="field-error">
          库存不足：当前可用 {{ formatNumber(availableQty) }}，申请移出 {{ formatNumber(form.quantity) }}
        </p>

        <label class="field field-wide">
          <span>备注</span>
          <input v-model="form.remark" type="text" placeholder="移库事由，如台风预警前补给" />
        </label>
      </div>
      <footer>
        <button class="btn ghost" @click="emit('update:modelValue', false)">取消</button>
        <button class="btn primary" :disabled="!canSubmit" @click="onSubmit">
          {{ submitting ? "提交中…" : "提交并冻结来源库存" }}
        </button>
      </footer>
    </div>
  </div>
</template>
