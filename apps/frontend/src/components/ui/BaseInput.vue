<script setup lang="ts">
/**
 * BaseInput
 * Componente de input com label, error, e helper text
 */

interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  error?: string | null
  helperText?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  prefixIcon?: string
  suffixIcon?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? parseFloat(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="base-input" :class="[`base-input--${props.size}`]">
    <label v-if="props.label" class="base-input__label">
      {{ props.label }}
      <span v-if="props.required" class="base-input__required">*</span>
    </label>

    <div class="base-input__wrapper" :class="{ 'base-input__wrapper--error': props.error }">
      <span v-if="props.prefixIcon" class="base-input__icon base-input__icon--prefix">
        {{ props.prefixIcon }}
      </span>

      <input
        :value="props.modelValue"
        :type="props.type"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :readonly="props.readonly"
        :required="props.required"
        class="base-input__field"
        :class="{
          'base-input__field--prefix': props.prefixIcon,
          'base-input__field--suffix': props.suffixIcon
        }"
        @input="handleInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <span v-if="props.suffixIcon" class="base-input__icon base-input__icon--suffix">
        {{ props.suffixIcon }}
      </span>
    </div>

    <p v-if="props.error" class="base-input__error">
      {{ props.error }}
    </p>

    <p v-else-if="props.helperText" class="base-input__helper">
      {{ props.helperText }}
    </p>
  </div>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: var(--rp-space-2);
}

.base-input__label {
  font-size: var(--rp-text-sm);
  font-weight: var(--rp-font-medium);
  color: var(--rp-text-primary);
}

.base-input__required {
  color: var(--rp-error-500);
  margin-left: var(--rp-space-1);
}

.base-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--rp-surface-base);
  border: 1px solid var(--rp-border-base);
  border-radius: var(--rp-radius-lg);
  transition:
    border-color var(--rp-transition-fast),
    box-shadow var(--rp-transition-fast);
}

.base-input__wrapper:focus-within {
  border-color: var(--rp-interactive-focus);
  box-shadow: 0 0 0 3px var(--rp-primary-100);
}

.base-input__wrapper--error {
  border-color: var(--rp-error-500);
}

.base-input__wrapper--error:focus-within {
  box-shadow: 0 0 0 3px var(--rp-error-100);
}

.base-input__field {
  flex: 1;
  width: 100%;
  border: none;
  background: transparent;
  color: var(--rp-text-primary);
  font-family: var(--rp-font-sans);
  outline: none;
}

.base-input__field::placeholder {
  color: var(--rp-text-tertiary);
}

.base-input__field:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Sizes */
.base-input--sm .base-input__field {
  padding: var(--rp-space-2) var(--rp-space-3);
  font-size: var(--rp-text-sm);
  min-height: 32px;
}

.base-input--md .base-input__field {
  padding: var(--rp-space-3) var(--rp-space-4);
  font-size: var(--rp-text-base);
  min-height: 40px;
}

.base-input--lg .base-input__field {
  padding: var(--rp-space-4) var(--rp-space-5);
  font-size: var(--rp-text-lg);
  min-height: 48px;
}

/* Icons */
.base-input__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--rp-icon-tertiary);
  font-size: var(--rp-text-lg);
  pointer-events: none;
}

.base-input__icon--prefix {
  padding-left: var(--rp-space-4);
}

.base-input__icon--suffix {
  padding-right: var(--rp-space-4);
}

.base-input__field--prefix {
  padding-left: var(--rp-space-2) !important;
}

.base-input__field--suffix {
  padding-right: var(--rp-space-2) !important;
}

/* Helper & Error */
.base-input__helper,
.base-input__error {
  font-size: var(--rp-text-xs);
  margin: 0;
}

.base-input__helper {
  color: var(--rp-text-tertiary);
}

.base-input__error {
  color: var(--rp-error-600);
  font-weight: var(--rp-font-medium);
}

/* Responsive */
@media (max-width: 768px) {
  .base-input--md .base-input__field {
    min-height: 44px; /* Touch-friendly */
  }
}
</style>
