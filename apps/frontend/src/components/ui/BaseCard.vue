<script setup lang="ts">
/**
 * BaseCard
 * Componente de card reutilizável
 */

interface Props {
  title?: string
  subtitle?: string
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  hoverable: false
})
</script>

<template>
  <section
    class="base-card"
    :class="[
      `base-card--${props.variant}`,
      `base-card--padding-${props.padding}`,
      { 'base-card--hoverable': props.hoverable }
    ]"
  >
    <header v-if="props.title || props.subtitle || $slots.header" class="base-card__header">
      <slot name="header">
        <div v-if="props.title || props.subtitle" class="base-card__header-content">
          <h3 v-if="props.title" class="base-card__title">
            {{ props.title }}
          </h3>
          <p v-if="props.subtitle" class="base-card__subtitle">
            {{ props.subtitle }}
          </p>
        </div>
      </slot>

      <div v-if="$slots.actions" class="base-card__actions">
        <slot name="actions" />
      </div>
    </header>

    <div class="base-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.base-card {
  background: var(--rp-surface-base);
  border-radius: var(--rp-radius-xl);
  transition:
    box-shadow var(--rp-transition-base),
    transform var(--rp-transition-base);
}

/* Variants */
.base-card--default {
  border: 1px solid var(--rp-border-subtle);
  box-shadow: var(--rp-shadow-xs);
}

.base-card--outlined {
  border: 1px solid var(--rp-border-base);
}

.base-card--elevated {
  border: none;
  box-shadow: var(--rp-shadow-md);
}

/* Hoverable */
.base-card--hoverable {
  cursor: pointer;
}

.base-card--hoverable:hover {
  box-shadow: var(--rp-shadow-lg);
  transform: translateY(-2px);
}

/* Padding */
.base-card--padding-none {
  padding: 0;
}

.base-card--padding-sm {
  padding: var(--rp-space-4);
}

.base-card--padding-md {
  padding: var(--rp-space-6);
}

.base-card--padding-lg {
  padding: var(--rp-space-8);
}

/* Header */
.base-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rp-space-4);
  padding-bottom: var(--rp-space-4);
  border-bottom: 1px solid var(--rp-border-subtle);
  margin-bottom: var(--rp-space-4);
}

.base-card--padding-none .base-card__header {
  padding: var(--rp-space-6);
  margin-bottom: 0;
}

.base-card__header-content {
  flex: 1;
}

.base-card__title {
  font-size: var(--rp-text-lg);
  font-weight: var(--rp-font-semibold);
  color: var(--rp-text-primary);
  margin: 0;
}

.base-card__subtitle {
  font-size: var(--rp-text-sm);
  color: var(--rp-text-secondary);
  margin: var(--rp-space-1) 0 0;
}

.base-card__actions {
  display: flex;
  align-items: center;
  gap: var(--rp-space-2);
}

/* Body */
.base-card__body {
  font-size: var(--rp-text-base);
  color: var(--rp-text-secondary);
}

.base-card--padding-none .base-card__body {
  padding: 0 var(--rp-space-6) var(--rp-space-6);
}

/* Footer */
.base-card__footer {
  padding-top: var(--rp-space-4);
  margin-top: var(--rp-space-4);
  border-top: 1px solid var(--rp-border-subtle);
}

.base-card--padding-none .base-card__footer {
  padding: var(--rp-space-6);
  margin-top: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .base-card--padding-md {
    padding: var(--rp-space-4);
  }

  .base-card--padding-lg {
    padding: var(--rp-space-6);
  }

  .base-card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .base-card__actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
