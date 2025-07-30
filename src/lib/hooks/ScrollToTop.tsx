import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top when route changes, but don't scroll for hash navigation
    if (!window.location.hash) {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
} 