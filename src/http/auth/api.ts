import type { RecruiterRegistrationInput } from '@/interfaces'
import { post } from '../apiHelper'

export const signin = (email: string, password: string) =>
  post('/auth/login', { email, password })

export const signup = (data: RecruiterRegistrationInput) =>
  post('/auth/register', data)

export const logout = (authToken: string) => post('/auth/logout', { authToken })

export const forgotPassword = (email: string) =>
  post('/auth/forgot-password', { email })

export const resetPasswordWithToken = (token: string, newPassword: string) =>
  post('/auth/reset-password', { token, newPassword })
