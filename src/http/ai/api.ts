import { apiHelper } from "../apiHelper";

// Suggest qualifications based on job description
export const suggestQualifications = async (data: {
  jobTitle: string;
  jobDescription: string;
  company?: string;
}) => {
  return apiHelper<{ qualifications: string[] }>({
    method: "post",
    url: "/ai/suggest-qualifications",
    data,
  });
};

// Enhance job description
export const enhanceJobDescription = async (data: {
  jobTitle: string;
  jobDescription: string;
  company?: string;
  requirements?: string[];
}) => {
  return apiHelper<{ 
    enhancedDescription: string;
    suggestedQualifications: string[];
  }>({
    method: "post",
    url: "/ai/enhance-job-description",
    data,
  });
};

