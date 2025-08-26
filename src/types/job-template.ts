export interface JobTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  jobTitle: string;
  jobBoardTitle?: string;
  jobDescription: string;
  department?: string;
  customDepartment?: string;
  workplaceType: string;
  jobLocation?: {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode?: string;
  };
  employmentType: string;
  workSetting?: string;
  country?: string;
  language?: string;
  hiringTimeline?: string;
  hoursPerWeek?: {
    min?: number;
    max?: number;
  };
  schedule?: string[];
  educationRequirement?: string;
  requiredQualifications?: Array<{
    text: string;
    weight?: number;
  }>;
  preferredQualifications?: Array<{
    text: string;
    weight?: number;
  }>;
  jobRequirements?: string[];
  payType?: string;
  payRate?: {
    type: string;
    amount?: number;
    min?: number;
    max?: number;
    period?: string;
  };
  benefits?: string[];
  exemptStatus?: string;
  customQuestions?: Array<{
    question: string;
    type: string;
    options?: string[];
    required?: boolean;
    autoFail?: boolean;
  }>;
  backgroundScreeningDisclaimer?: boolean;
  isActive: boolean;
  isPublic: boolean;
  tags?: string[];
  usageCount: number;
  createdBy: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  company: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobTemplateData {
  name: string;
  description?: string;
  category?: string;
  jobTitle: string;
  jobDescription: string;
  workplaceType: string;
  employmentType: string;
  isPublic?: boolean;
  tags?: string[];
  [key: string]: any;
}

export interface JobTemplateFilters {
  name?: string;
  category?: string;
  tags?: string;
  isPublic?: boolean;
  search?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
}
