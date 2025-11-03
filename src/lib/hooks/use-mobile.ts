import * as React from 'react'
import { isMobileDevice, MobileLayoutManager, MOBILE_BREAKPOINT } from '@/utils/mobile-layout'

// Get initial mobile state immediately to prevent flash
const getInitialMobileState = (): boolean => {
  if (typeof window === 'undefined') return false // SSR fallback
  return isMobileDevice()
}

export function useIsMobile() {
  // Initialize with actual mobile state immediately to prevent flash
  const [isMobile, setIsMobile] = React.useState<boolean>(getInitialMobileState)
  const layoutManager = MobileLayoutManager.getInstance()

  React.useEffect(() => {
    // Minimal flash prevention (no CSS class manipulation)
    layoutManager.preventFlash()
    
    // Double-check and set the correct initial state
    const currentMobileState = window.innerWidth < MOBILE_BREAKPOINT
    setIsMobile(currentMobileState)
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const newMobileState = window.innerWidth < MOBILE_BREAKPOINT
      if (newMobileState !== isMobile) {
        // Simple state change without layout manipulation
        setIsMobile(newMobileState)
      }
    }
    
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [isMobile, layoutManager])

  return isMobile
}
