/**
 * useLocalStorage
 * Hook para trabalhar com localStorage de forma reativa
 */

import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): Ref<T> {
  // Tenta carregar do localStorage
  const storedValue = localStorage.getItem(key)
  const initialValue = storedValue !== null
    ? JSON.parse(storedValue)
    : defaultValue

  const value = ref(initialValue) as Ref<T>

  // Observa mudanças e salva no localStorage
  watch(
    value,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return value
}

/**
 * Remove um item do localStorage
 */
export function removeFromLocalStorage(key: string): void {
  localStorage.removeItem(key)
}

/**
 * Limpa todo o localStorage
 */
export function clearLocalStorage(): void {
  localStorage.clear()
}
