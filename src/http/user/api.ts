import { get, put } from '../apiHelper'

export const getProfile = () => get('/users/profile')

export const resetPassword = (data: {
  currentPassword: string
  newPassword: string
}) => put('/users/password', data)

export const updateProfile = (data: Record<string, any>) =>
  put('/users/profile', data)
