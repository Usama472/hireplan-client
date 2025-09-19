import { get, post, put } from '../apiHelper'

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
