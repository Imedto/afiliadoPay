<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  hint?: string;
}>();
</script>

<template>
  <div class="stat-card">
    <div class="label">{{ label }}</div>
    <div class="value">{{ value }}</div>
    <div v-if="hint" class="hint">
      {{ hint }}
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  padding: 1rem 1.1rem;
  border-radius: var(--rp-radius-md);
  background: var(--rp-color-surface-soft);
  border: 1px solid var(--rp-color-border-subtle);
  box-shadow: var(--rp-shadow-subtle);
}

.label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--rp-color-text-soft);
}

.value {
  margin-top: 0.25rem;
  font-size: 1.2rem;
  font-weight: 700;
}

.hint {
  margin-top: 0.1rem;
  font-size: 0.8rem;
  color: var(--rp-color-text-muted);
}
</style>

