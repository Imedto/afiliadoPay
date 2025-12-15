/**
 * useBreakpoints
 * Composable para detectar breakpoints responsivos
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'

export interface Breakpoints {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop' | 'large-desktop'
}

export function useBreakpoints() {
  const windowWidth = ref(0)

  const isMobile = computed(() => windowWidth.value < 768)
  const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
  const isDesktop = computed(() => windowWidth.value >= 1024 && windowWidth.value < 1280)
  const isLargeDesktop = computed(() => windowWidth.value >= 1280)

  const currentBreakpoint = computed<Breakpoints['currentBreakpoint']>(() => {
    if (isMobile.value) return 'mobile'
    if (isTablet.value) return 'tablet'
    if (isDesktop.value) return 'desktop'
    return 'large-desktop'
  })

  function updateWidth() {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    currentBreakpoint
  }
}
