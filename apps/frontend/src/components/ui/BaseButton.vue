<script setup lang="ts">
/**
 * BaseButton
 * Componente de botão reutilizável com múltiplas variantes e tamanhos
 */

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  as?: 'button' | 'a'
  loading?: boolean
  disabled?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  as: 'button',
  loading: false,
  disabled: false,
  block: false
})
</script>

<template>
  <component
    :is="props.as"
    class="base-button"
    :class="[
      `base-button--${props.variant}`,
      `base-button--${props.size}`,
      {
        'base-button--loading': props.loading,
        'base-button--disabled': props.disabled,
        'base-button--block': props.block
      }
    ]"
    :disabled="props.disabled || props.loading"
  >
    <span v-if="props.loading" class="base-button__spinner" aria-label="Carregando"></span>
    <span class="base-button__content" :class="{ 'base-button__content--loading': props.loading }">
      <slot />
    </span>
  </component>
</template>

<style scoped>
.base-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--rp-space-2);
  font-family: var(--rp-font-sans);
  font-weight: var(--rp-font-medium);
  text-align: center;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    background-color var(--rp-transition-fast),
    color var(--rp-transition-fast),
    border-color var(--rp-transition-fast),
    transform var(--rp-transition-fast),
    box-shadow var(--rp-transition-fast);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Sizes */
.base-button--sm {
  padding: var(--rp-space-2) var(--rp-space-3);
  font-size: var(--rp-text-sm);
  border-radius: var(--rp-radius-md);
  min-height: 32px;
}

.base-button--md {
  padding: var(--rp-space-3) var(--rp-space-5);
  font-size: var(--rp-text-base);
  border-radius: var(--rp-radius-lg);
  min-height: 40px;
}

.base-button--lg {
  padding: var(--rp-space-4) var(--rp-space-6);
  font-size: var(--rp-text-lg);
  border-radius: var(--rp-radius-lg);
  min-height: 48px;
}

/* Variants */
.base-button--primary {
  background: linear-gradient(135deg, var(--rp-primary-500), var(--rp-primary-600));
  color: white;
  box-shadow: var(--rp-shadow-sm);
}

.base-button--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--rp-primary-600), var(--rp-primary-700));
  box-shadow: var(--rp-shadow-md);
  transform: translateY(-1px);
}

.base-button--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--rp-shadow-sm);
}

.base-button--secondary {
  background: var(--rp-surface-base);
  color: var(--rp-text-primary);
  border-color: var(--rp-border-base);
  box-shadow: var(--rp-shadow-xs);
}

.base-button--secondary:hover:not(:disabled) {
  background: var(--rp-bg-subtle);
  border-color: var(--rp-border-strong);
  box-shadow: var(--rp-shadow-sm);
}

.base-button--ghost {
  background: transparent;
  color: var(--rp-text-secondary);
  border-color: transparent;
}

.base-button--ghost:hover:not(:disabled) {
  background: var(--rp-interactive-hover);
  color: var(--rp-text-primary);
}

.base-button--danger {
  background: linear-gradient(135deg, var(--rp-error-500), var(--rp-error-600));
  color: white;
  box-shadow: var(--rp-shadow-sm);
}

.base-button--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--rp-error-600), var(--rp-error-700));
  box-shadow: var(--rp-shadow-md);
  transform: translateY(-1px);
}

.base-button--success {
  background: linear-gradient(135deg, var(--rp-success-500), var(--rp-success-600));
  color: white;
  box-shadow: var(--rp-shadow-sm);
}

.base-button--success:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--rp-success-600), var(--rp-success-700));
  box-shadow: var(--rp-shadow-md);
  transform: translateY(-1px);
}

/* States */
.base-button--disabled,
.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.base-button--loading {
  cursor: wait;
}

.base-button--block {
  width: 100%;
  display: flex;
}

/* Spinner */
.base-button__spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.base-button__content {
  transition: opacity var(--rp-transition-fast);
}

.base-button__content--loading {
  opacity: 0;
}

/* Focus */
.base-button:focus-visible {
  outline: 2px solid var(--rp-interactive-focus);
  outline-offset: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .base-button--md {
    min-height: 44px; /* Touch-friendly size */
  }
}
</style>
