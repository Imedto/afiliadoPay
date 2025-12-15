/**
 * useDebounce
 * Hook para debounce de valores e funções
 */

import { ref, watch, type Ref } from 'vue'

/**
 * Debounce de um valor reativo
 */
export function useDebounce<T>(value: Ref<T>, delay = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(value, (newValue) => {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}

/**
 * Debounce de uma função
 */
export function useDebouncedFn<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function debouncedFunction(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
