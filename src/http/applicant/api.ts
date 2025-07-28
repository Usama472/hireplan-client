import { get, post } from '../apiHelper'

export const applyJob = async (payload: any) => {
  const response = await post('/applicants/apply', payload)
  return response
}

export const getApplicants = async (jobId: string) =>
  get(`/applicants/${jobId}`)
