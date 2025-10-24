'use client'
import { type PropsWithChildren } from 'react'

const AuthRedirection = ({ children }: PropsWithChildren) => {
  // Check auth completely synchronously - no useEffect delays
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('hireme-client-token');
    const currentPath = window.location.pathname;
    
    // INSTANT redirect: If logged in and on login/signup/home, redirect NOW
    if (token && (currentPath === '/' || currentPath === '/login' || currentPath === '/signup')) {
      window.location.href = '/dashboard/jobs';
      return null; // Don't render anything while redirecting
    }
    
    // INSTANT redirect: If NOT logged in and on dashboard, redirect NOW
    if (!token && currentPath.startsWith('/dashboard')) {
      window.location.href = '/login';
      return null; // Don't render anything while redirecting
    }
  }

  // Render page for valid routes only
  return <>{children}</>
}

export default AuthRedirection
