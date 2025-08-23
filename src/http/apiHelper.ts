import { clientAccessToken } from '@/constants'
import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'https://hireplan.co/api/v1'

export const axiosApi = axios.create({
  baseURL: API_URL,
})

axiosApi.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${localStorage.getItem(
      clientAccessToken
    )}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosApi.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Only redirect to login for 401s that happen on authenticated routes,
    // not during login attempts themselves
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname
      const isLoginPage = currentPath === '/login'
      const isSignupPage = currentPath === '/signup'
      const isForgotPasswordPage = currentPath === '/forgot-password'
      
      // Don't redirect if user is already on auth pages
      if (!isLoginPage && !isSignupPage && !isForgotPasswordPage) {
        localStorage.removeItem(clientAccessToken)
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export async function get(
  url: string,
  config: Record<string, any> = {}
): Promise<any> {
  return await axiosApi
    .get(url, { ...config })
    .then((response) => response.data)
}

export async function post(
  url: string,
  data: object,
  config: Record<string, any> = {}
): Promise<any> {
  return await axiosApi
    .post(url, data, { ...config })
    .then((response) => response.data)
}

export async function put(
  url: string,
  data: object = {},
  config: Record<string, any> = {}
): Promise<any> {
  return await axiosApi
    .put(url, data, { ...config })
    .then((response) => response.data)
}

export async function del(
  url: string,
  config: Record<string, any> = {}
): Promise<any> {
  return await axiosApi
    .delete(url, { ...config })
    .then((response) => response.data)
}

export async function patch(
  url: string,
  data: object = {},
  config: Record<string, any> = {}
): Promise<any> {
  return await axiosApi
    .patch(url, data, { ...config })
    .then((response) => response.data)
}
