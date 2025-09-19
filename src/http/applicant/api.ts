import { get, post, put } from '../apiHelper'
import axios from 'axios'

// Completely separate axios instance for public endpoints (no interceptors)
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://hireplan.co/api/v1',
  headers: {
    'Content-Type': 'application/json',
  }
})

// Ensure no auth headers are added to public API
publicApi.interceptors.request.use(
  (config) => {
    // Explicitly remove any authorization headers
    delete config.headers.Authorization
    return config
  },
  (error) => Promise.reject(error)
)

// Public API helpers (no JWT token)
const publicGet = async (url: string, params?: any) => {
  const response = await publicApi.get(url, { params })
  return response.data
}

const publicPost = async (url: string, data: any) => {
  const response = await publicApi.post(url, data)
  return response.data
}

const publicPut = async (url: string, data: any) => {
  const response = await publicApi.put(url, data)
  return response.data
}

export const applyJob = async (payload: any) => {
  const response = await post('/applicants/apply', payload)
  return response
}

export const getApplicants = async (jobId: string) =>
  get(`/applicants/${jobId}`)

export const getAllApplicants = async (queryParams?: string) =>
  get(`/applicants${queryParams || ''}`)

export const updateApplicantStatus = async (
  jobId: string,
  applicantId: string,
  status: string
) => {
  return await put(`/applicants/${jobId}/status`, { status, applicantId })
}

export const updateApplicantStatusDirect = async (
  applicantId: string,
  status: string
) => {
  return await put(`/applicants/status/${applicantId}`, { status })
}

export const requestAIAssessment = async (applicantId: string) => {
  return await get(`/applicants/ai-calculation?applicationId=${applicantId}`)
}

// Partial application tracking (public endpoints - no auth required)
export const createPartialApplication = async (payload: any) => {
  const response = await publicPost('/applicants/partial', payload)
  return response
}

export const updatePartialApplication = async (applicationId: string, payload: any) => {
  const response = await publicPut(`/applicants/partial/${applicationId}`, payload)
  return response
}

export const getPartialApplication = async (email: string, jobId: string) => {
  const response = await publicGet('/applicants/partial', { email, jobId })
  return response
}

export const getPartialApplicationByToken = async (token: string) => {
  const response = await publicGet(`/applicants/partial/token/${token}`)
  return response
}
