<script setup lang="ts">
const props = withDefaults(defineProps<{ value: string; text?: string }>(), { text: "" });
const label = props.text || props.value.replace(/_/g, " ");
const toneByValue: Record<string, string> = {
  TRANSFER_IN_TRANSIT: "tone-amber",
  TRANSFER_POSTED: "tone-green",
  QUALIFIED: "tone-green"
};
</script>
<template>
  <span class="badge" :class="toneByValue[value] ?? ''">{{ label }}</span>
</template>
