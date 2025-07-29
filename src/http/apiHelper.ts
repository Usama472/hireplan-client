import { clientAccessToken } from '@/constants'
import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://45.33.83.41:5000/v1'

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
    if (error.response && error.response.status === 401) {
      window.location.href = '/login'
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
