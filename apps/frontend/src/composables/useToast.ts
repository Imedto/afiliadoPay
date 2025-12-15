/**
 * useToast
 * Sistema de notificações toast
 */

import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

const toasts = ref<Toast[]>([])
let idCounter = 0

export function useToast() {
  function addToast(toast: Omit<Toast, 'id'>) {
    const id = `toast-${++idCounter}`
    const newToast: Toast = { ...toast, id }

    toasts.value.push(newToast)

    // Auto remove após a duração especificada
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function success(message: string, duration?: number) {
    return addToast({ message, type: 'success', duration })
  }

  function error(message: string, duration?: number) {
    return addToast({ message, type: 'error', duration })
  }

  function warning(message: string, duration?: number) {
    return addToast({ message, type: 'warning', duration })
  }

  function info(message: string, duration?: number) {
    return addToast({ message, type: 'info', duration })
  }

  function clear() {
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clear
  }
}
