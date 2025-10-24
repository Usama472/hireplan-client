'use client'
import { getSession } from '@/http/auth/mutateSession'
import createGenericContext from '@/lib/utils/create-generic-context'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { AuthBroadcastChannel } from '../AuthBroadcastChannel'
import simpleSubscriptionAPI from '@/http/subscription/simple-api'
import { clientAccessToken } from '@/constants'

interface SubscriptionStatus {
  hasActiveSubscription: boolean
  planId: string | null
  planName: string | null
  subscriptionStatus: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  stripeSubscriptionId?: string
}

interface AuthSessionContext {
  data: Awaited<ReturnType<typeof getSession>> | undefined
  status: 'loading' | 'authenticated' | 'unauthenticated'
  role: 'admin' | 'user' | null
  subscription: SubscriptionStatus | null
  subscriptionLoading: boolean
  updateUser?: (user: any) => void
  refreshSubscription?: () => Promise<void>
}
const [_useAuthSessionContext, AuthSessionContextProvider] =
  createGenericContext<AuthSessionContext>()

export const AuthSessionProvider = ({ children }: PropsWithChildren) => {
  // Check for cached data on mount for instant render
  const getInitialState = () => {
    if (typeof window === 'undefined') {
      return {
        data: undefined,
        status: 'loading' as const,
        role: null,
        subscription: null,
        subscriptionLoading: false,
      };
    }
    
    const token = localStorage.getItem('clientAccessToken');
    const cachedProfile = localStorage.getItem('cachedUserProfile');
    
    if (token && cachedProfile) {
      try {
        const profile = JSON.parse(cachedProfile);
        return {
          data: { user: profile, accessToken: token },
          status: 'authenticated' as const,
          role: profile.role,
          subscription: null,
          subscriptionLoading: false,
        };
      } catch {
        return {
          data: undefined,
          status: 'loading' as const,
          role: null,
          subscription: null,
          subscriptionLoading: false,
        };
      }
    }
    
    return {
      data: undefined,
      status: 'loading' as const,
      role: null,
      subscription: null,
      subscriptionLoading: false,
    };
  };
  
  const [state, setState] = useState<AuthSessionContext>({
    ...getInitialState(),
    updateUser: () => {},
    refreshSubscription: async () => {},
  })

  // Fetch subscription status
  const fetchSubscriptionStatus = async (userId?: string): Promise<SubscriptionStatus | null> => {
    console.log('🔄 fetchSubscriptionStatus called with userId:', userId)
    if (!userId) {
      console.log('❌ No userId provided to fetchSubscriptionStatus')
      return null
    }
    
    try {
      console.log('📞 Making API call to getStatus...')
      setState(prev => ({ ...prev, subscriptionLoading: true }))
      const subscriptionData = await simpleSubscriptionAPI.getStatus()
      console.log('✅ Subscription status API response:', subscriptionData)
      return subscriptionData
    } catch (error) {
      console.error('❌ Failed to fetch subscription status:', error)
      return {
        hasActiveSubscription: false,
        planId: null,
        planName: null,
        subscriptionStatus: 'error'
      }
    } finally {
      setState(prev => ({ ...prev, subscriptionLoading: false }))
    }
  }

  useEffect(() => {
    // Check if we're on a public route - if so, delay auth check
    const publicRoutes = ['/', '/contact', '/privacy', '/terms', '/faq', '/signup', '/login', '/forgot-password']
    const isPublicRoute = publicRoutes.some(route => 
      window.location.pathname === route || 
      window.location.pathname.startsWith('/company/') ||
      window.location.pathname.startsWith('/apply/') ||
      window.location.pathname.startsWith('/interview/')
    )
    
    // For public routes, skip auth check entirely - set as unauthenticated immediately
    if (isPublicRoute && !localStorage.getItem(clientAccessToken)) {
      setState(prev => ({
        ...prev,
        data: null,
        status: 'unauthenticated',
        role: null,
        subscription: null,
        subscriptionLoading: false,
      }))
      return
    }
    
    // Start loading session in background (non-blocking) only if needed
    const setSessionState = async () => {
      try {
        const session = await getSession({ shouldBroadcast: false })
        console.log('🔍 Session data received:', session)
        
        if (session === null) {
          setState(prev => ({
            ...prev,
            data: null,
            status: 'unauthenticated',
            role: null,
            subscription: null,
            subscriptionLoading: false,
          }))
        } else {
          // Set session data immediately - don't wait for subscription
          setState(prev => ({
            ...prev,
            data: session,
            status: 'authenticated',
            role: session?.user.role,
            subscriptionLoading: true,
          }))
          
          // Fetch subscription in background (non-blocking)
          console.log('👤 User object:', session.user)
          const userId = session.user.id || session.user._id
          console.log('🆔 Using User ID:', userId)
          
          fetchSubscriptionStatus(userId).then(subscriptionStatus => {
            setState(prev => ({
              ...prev,
              subscription: subscriptionStatus,
              subscriptionLoading: false,
            }))
          }).catch(() => {
            setState(prev => ({
              ...prev,
              subscription: null,
              subscriptionLoading: false,
            }))
          })
        }
      } catch (error) {
        console.error('Authentication error:', error)
        setState(prev => ({
          ...prev,
          data: null,
          status: 'unauthenticated',
          role: null,
          subscription: null,
          subscriptionLoading: false,
        }))
      }
    }
    
    // Don't await - let it run in background
    setSessionState()
    AuthBroadcastChannel().addEventListener('message', setSessionState)
    return () => {
      AuthBroadcastChannel().removeEventListener('message', setSessionState)
    }
  }, [])

  const updateUser = (user: any) => {
    setState(
      (prev) =>
        ({
          ...prev,
          data: { ...prev.data, user },
        } as unknown as AuthSessionContext)
    )
  }

  const refreshSubscription = async () => {
    if (state.data?.user?._id) {
      const subscriptionStatus = await fetchSubscriptionStatus(state.data.user._id)
      setState(prev => ({
        ...prev,
        subscription: subscriptionStatus,
      }))
    }
  }

  return (
    <AuthSessionContextProvider
      value={{
        data: state.data,
        status: state.status,
        role: state.role,
        subscription: state.subscription,
        subscriptionLoading: state.subscriptionLoading,
        updateUser,
        refreshSubscription,
      }}
    >
      {children}
    </AuthSessionContextProvider>
  )
}

interface Props {
  required: boolean
}
const useAuthSessionContext = (props?: Props) => {
  const { data, status, role, subscription, subscriptionLoading, updateUser, refreshSubscription } = _useAuthSessionContext()
  if (props?.required) {
    if (!data || status === 'unauthenticated') {
      throw new Error('User is not authenticated')
    }
  }
  return { data, status, role, subscription, subscriptionLoading, updateUser, refreshSubscription }
}
export default useAuthSessionContext
