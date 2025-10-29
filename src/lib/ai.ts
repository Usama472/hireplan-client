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
    suggestedQualifications: string[]
  }
}

export const enhanceJobDescription = async (
  data: EnhanceJobDescriptionRequest
): Promise<{ enhancedDescription: string; suggestedQualifications: string[] }> => {
  const response = await post('/ai/enhance-job-description', data) as EnhanceJobDescriptionResponse
  
  if (!response.status) {
    throw new Error('Failed to enhance job description')
  }
  
  return {
    enhancedDescription: response.data.enhancedDescription,
    suggestedQualifications: response.data.suggestedQualifications || []
  }
}