'use client'
import { getSession } from '@/http/auth/mutateSession'
import createGenericContext from '@/lib/utils/create-generic-context'
import { useEffect, useState, type PropsWithChildren } from 'react'
import { AuthBroadcastChannel } from '../AuthBroadcastChannel'

interface AuthSessionContext {
  data: Awaited<ReturnType<typeof getSession>> | undefined
  status: 'loading' | 'authenticated' | 'unauthenticated'
  role: 'admin' | 'user' | null
  updateUser?: (user: any) => void
}
const [_useAuthSessionContext, AuthSessionContextProvider] =
  createGenericContext<AuthSessionContext>()

export const AuthSessionProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<AuthSessionContext>({
    data: undefined,
    status: 'loading',
    role: null,
    updateUser: () => {},
  })

  useEffect(() => {
    const setSessionState = () => {
      getSession({ shouldBroadcast: false })
        .then((session) => {
          setState({
            data: session,
            status: session === null ? 'unauthenticated' : 'authenticated',
            role: session?.user.role,
          })
        })
        .catch((error) => {
          console.error(error)
          setState({
            data: null,
            status: 'unauthenticated',
            role: null,
          })
        })
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

  return (
    <AuthSessionContextProvider
      value={{
        data: state.data,
        status: state.status,
        role: state.role,
        updateUser,
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
  const { data, status, role, updateUser } = _useAuthSessionContext()
  if (props?.required) {
    if (!data || status === 'unauthenticated') {
      throw new Error('User is not authenticated')
    }
  }
  return { data, status, role, updateUser }
}
export default useAuthSessionContext
