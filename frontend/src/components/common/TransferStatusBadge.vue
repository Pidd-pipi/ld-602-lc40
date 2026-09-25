<script setup lang="ts">
import { computed } from "vue";
import { formatTransferStatus } from "../../utils/formatters";

const props = defineProps<{ value: string }>();
const tone = computed(() => (props.value === "POSTED" ? "posted" : "transit"));
</script>

<template>
  <span class="badge transfer-badge" :class="tone">{{ formatTransferStatus(value) }}</span>
</template>
