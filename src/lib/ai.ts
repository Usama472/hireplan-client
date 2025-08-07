import { post } from '@/http/apiHelper'

export interface EnhanceJobDescriptionRequest {
  jobTitle: string
  jobDescription: string
  company?: string
  requirements?: string[]
}

export interface EnhanceJobDescriptionResponse {
  status: boolean
  data: {
    enhancedDescription: string
  }
}

export const enhanceJobDescription = async (
  data: EnhanceJobDescriptionRequest
): Promise<string> => {
  const response = await post('/ai/enhance-job-description', data) as EnhanceJobDescriptionResponse
  
  if (!response.status) {
    throw new Error('Failed to enhance job description')
  }
  
  return response.data.enhancedDescription
}