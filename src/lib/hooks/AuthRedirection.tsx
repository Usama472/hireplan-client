'use client'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { type PropsWithChildren, useEffect, useState } from 'react'
import useAuthSessionContext from '../context/AuthSessionContext'

const UnauthenticatedRoutes = ['/login', '/signup']
const AuthVerificationRoutes = ['/verification']
const AuthenticatedRoutes = ['/dashboard'] as string[]
const PublicRoutes = ['/', '/contact', '/privacy', '/terms', '/company', '/apply', '/interview', '/outlook/auth', '/zoom/auth']

const AuthRedirection = ({ children }: PropsWithChildren) => {
  const [isReloading, setReloading] = useState(false)
  
  // Check if current route is public
  const isPublicRoute = PublicRoutes.some(route => 
    window.location.pathname === route || 
    window.location.pathname.startsWith(route + '/')
  )

  // For public routes, render immediately without any auth checks
  if (isPublicRoute) {
    return <>{children}</>
  }

  // Only use auth context for private routes
  const { status } = useAuthSessionContext()

  useEffect(() => {
    if (AuthVerificationRoutes.includes(window.location.pathname)) {
      return
    }
    if (
      status === 'unauthenticated' &&
      AuthenticatedRoutes.some((v) => window.location.pathname.includes(v))
    ) {
      window.location.href = '/login'
    }
    if (
      status === 'authenticated' &&
      UnauthenticatedRoutes.some((v) => window.location.pathname.includes(v))
    ) {
      window.location.href = '/dashboard/jobs'
    }
  }, [status])

  useEffect(() => {
    setReloading(false)
    const handleBeforeUnload = () => {
      setReloading(true)
      return
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  if (status === 'loading' || isReloading) {
    return <LoadingScreen message="Setting up your workspace..." />
  }
  return <>{children}</>
}

export default AuthRedirection
