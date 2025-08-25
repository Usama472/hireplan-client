'use client'
import { getSession } from '@/http/auth/mutateSession'
import createGenericContext from '@/lib/utils/create-generic-context'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { AuthBroadcastChannel } from '../AuthBroadcastChannel'
import simpleSubscriptionAPI from '@/http/subscription/simple-api'

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
  const [state, setState] = useState<AuthSessionContext>({
    data: undefined,
    status: 'loading',
    role: null,
    subscription: null,
    subscriptionLoading: false,
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
          // Always fetch fresh subscription status after authentication
          console.log('👤 User object:', session.user)
          const userId = session.user.id || session.user._id
          console.log('🆔 Using User ID:', userId)
          setState(prev => ({ ...prev, subscriptionLoading: true }))
          const subscriptionStatus = await fetchSubscriptionStatus(userId)
          
          setState(prev => ({
            ...prev,
            data: session,
            status: 'authenticated',
            role: session?.user.role,
            subscription: subscriptionStatus,
            subscriptionLoading: false,
          }))
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
