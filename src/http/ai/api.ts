import { apiHelper } from "../apiHelper";

// Suggest qualifications based on job description
export const suggestQualifications = async (data: {
  jobTitle: string;
  jobDescription: string;
  company?: string;
}) => {
  return apiHelper.post("/ai/suggest-qualifications", data) as Promise<{
    qualifications: string[];
  }>;
};

// Enhance job description
export const enhanceJobDescription = async (data: {
  jobTitle: string;
  jobDescription: string;
  company?: string;
  requirements?: string[];
  compensation?: string;
  location?: string;
  language?: string;
  employmentType?: string;
  instructions?: string;
}) => {
  return apiHelper.post("/ai/enhance-job-description", data) as Promise<{
    enhancedDescription: string;
    suggestedQualifications: string[];
  }>;
};
