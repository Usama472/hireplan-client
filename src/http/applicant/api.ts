import { get, post, put } from '../apiHelper'

export const applyJob = async (payload: any) => {
  const response = await post('/applicants/apply', payload)
  return response
}

export const getApplicants = async (jobId: string) =>
  get(`/applicants/${jobId}`)

export const updateApplicantStatus = async (
  jobId: string,
  applicantId: string,
  status: string
) => {
  return await put(`/applicants/${jobId}/status`, { status, applicantId })
}
