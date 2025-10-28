import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    // Don't scroll for hash navigation
    if (window.location.hash) {
      previousPathname.current = pathname;
      return;
    }
    
    // Don't scroll when navigating between chat pages
    const isCurrentlyInChats = pathname.startsWith('/dashboard/chats');
    const wasInChats = previousPathname.current?.startsWith('/dashboard/chats');
    
    // Only prevent scroll if both previous and current routes are chats
    if (isCurrentlyInChats && wasInChats) {
      previousPathname.current = pathname;
      return;
    }
    
    // Scroll to top for all other navigation
    window.scrollTo(0, 0);
    previousPathname.current = pathname;
  }, [pathname])

  return null
} 