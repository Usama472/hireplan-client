import CompanyLayout from '@/components/common/CompanyLayout'
import { LoadingScreen } from '@/components/common/LoadingScreen'
import { ROUTES } from '@/constants'
import useAuthSessionContext from '@/lib/context/AuthSessionContext'
import { type FC } from 'react'
import { Navigate } from 'react-router-dom'

export type CompanyRouteProps = {
  children: React.ReactNode
}

const CompanyRoute: FC<CompanyRouteProps> = ({ children }) => {
  const { data, status } = useAuthSessionContext()
  const company = data?.user?.company || null

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status === 'unauthenticated') {
    return <Navigate to={ROUTES.LOGIN} />
  }

  console.log(data)

  return <CompanyLayout>{children}</CompanyLayout>
}

export default CompanyRoute
