/**
 * useForm
 * Hook para gerenciar formulários com validação
 */

import { ref, reactive, computed, type Ref } from 'vue'

export interface ValidationRule<T = any> {
  validator: (value: T) => boolean
  message: string
}

export interface FieldConfig<T = any> {
  value: T
  rules?: ValidationRule<T>[]
}

export interface FormConfig {
  [key: string]: FieldConfig
}

export interface FormField<T = any> {
  value: Ref<T>
  error: Ref<string | null>
  touched: Ref<boolean>
  validate: () => boolean
  reset: () => void
}

export interface UseFormReturn<T extends FormConfig> {
  fields: { [K in keyof T]: FormField<T[K]['value']> }
  values: { [K in keyof T]: T[K]['value'] }
  errors: { [K in keyof T]: string | null }
  isValid: Ref<boolean>
  isDirty: Ref<boolean>
  validate: () => boolean
  reset: () => void
  setValues: (values: Partial<{ [K in keyof T]: T[K]['value'] }>) => void
}

export function useForm<T extends FormConfig>(config: T): UseFormReturn<T> {
  const fields = reactive({}) as { [K in keyof T]: FormField<T[K]['value']> }

  // Cria fields reativos para cada campo do config
  for (const key in config) {
    const fieldConfig = config[key]

    fields[key] = {
      value: ref(fieldConfig.value),
      error: ref<string | null>(null),
      touched: ref(false),

      validate() {
        const rules = fieldConfig.rules || []
        this.touched = true

        for (const rule of rules) {
          if (!rule.validator(this.value)) {
            this.error = rule.message
            return false
          }
        }

        this.error = null
        return true
      },

      reset() {
        this.value = fieldConfig.value
        this.error = null
        this.touched = false
      }
    } as FormField<T[typeof key]['value']>
  }

  // Computed: valores atuais de todos os campos
  const values = computed(() => {
    const vals = {} as { [K in keyof T]: T[K]['value'] }
    for (const key in fields) {
      vals[key] = fields[key].value
    }
    return vals
  })

  // Computed: erros de todos os campos
  const errors = computed(() => {
    const errs = {} as { [K in keyof T]: string | null }
    for (const key in fields) {
      errs[key] = fields[key].error
    }
    return errs
  })

  // Computed: formulário válido?
  const isValid = computed(() => {
    return Object.values(fields).every(field => field.error === null)
  })

  // Computed: algum campo foi alterado?
  const isDirty = computed(() => {
    return Object.values(fields).some(field => field.touched)
  })

  // Valida todos os campos
  function validate(): boolean {
    let valid = true
    for (const key in fields) {
      if (!fields[key].validate()) {
        valid = false
      }
    }
    return valid
  }

  // Reseta todos os campos
  function reset() {
    for (const key in fields) {
      fields[key].reset()
    }
  }

  // Define valores de múltiplos campos
  function setValues(newValues: Partial<{ [K in keyof T]: T[K]['value'] }>) {
    for (const key in newValues) {
      if (fields[key]) {
        fields[key].value = newValues[key] as any
      }
    }
  }

  return {
    fields,
    values,
    errors,
    isValid,
    isDirty,
    validate,
    reset,
    setValues
  }
}

// Validadores comuns
export const validators = {
  required: (message = 'Campo obrigatório'): ValidationRule => ({
    validator: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      return value != null
    },
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validator: (value: string) => value.length >= min,
    message: message || `Mínimo de ${min} caracteres`
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validator: (value: string) => value.length <= max,
    message: message || `Máximo de ${max} caracteres`
  }),

  email: (message = 'E-mail inválido'): ValidationRule<string> => ({
    validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validator: (value: number) => value >= min,
    message: message || `Valor mínimo é ${min}`
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validator: (value: number) => value <= max,
    message: message || `Valor máximo é ${max}`
  }),

  pattern: (regex: RegExp, message = 'Formato inválido'): ValidationRule<string> => ({
    validator: (value: string) => regex.test(value),
    message
  })
}
