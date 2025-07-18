import type { FC } from 'react'
import { AuthLayout } from '@components/layouts/AuthLayout'
import { LoginForm } from '@/components/forms/LoginForm'

const Login: FC = () => (
  <AuthLayout
    title='Sign in to your account'
    footerText="Don't have an account?"
    footerLinkText='Sign up'
    footerLinkHref='/signup'
    showSocial={false}
  >
    <LoginForm />
  </AuthLayout>
)

export default Login
