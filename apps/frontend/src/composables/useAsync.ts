/**
 * useAsync
 * Hook para gerenciar operações assíncronas
 */

import { ref, type Ref } from 'vue'

export interface AsyncState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  execute: (...args: any[]) => Promise<T | undefined>
  reset: () => void
}

export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>
): AsyncState<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function execute(...args: any[]): Promise<T | undefined> {
    loading.value = true
    error.value = null

    try {
      const result = await asyncFunction(...args)
      data.value = result
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro desconhecido'
      return undefined
    } finally {
      loading.value = false
    }
  }

  function reset() {
    data.value = null
    loading.value = false
    error.value = null
  }

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}
