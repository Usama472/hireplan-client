'use client'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { type PropsWithChildren, useEffect, useState } from 'react'
import useAuthSessionContext from '../context/AuthSessionContext'

const UnauthenticatedRoutes = ['/login', '/signup']
const AuthVerificationRoutes = ['/verification']
const AuthenticatedRoutes = ['/dashboard'] as string[]

const AuthRedirection = ({ children }: PropsWithChildren) => {
  const { status } = useAuthSessionContext()
  const [isReloading, setReloading] = useState(false)

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
    return <LoadingScreen />
  }
  return <>{children}</>
}

export default AuthRedirection
