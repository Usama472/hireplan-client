import type { JobFormSchema } from "@/lib/validations/forms/job-form-schema";
import type { ReactNode } from "react";

export type AppRoutesType = {
  id: number | string;
  url: string;
  element: ReactNode;
  isPrivate: boolean;
};

export type DefaultLayoutProps = {
  children: ReactNode;
};

export interface CompanyInfo {
  companyName: string;
  websiteUrl: string;
  industry: string;
  companySize: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  image: string;
  likes: number;
  featured: boolean;
  new: boolean;
  category: string;
  tags: string[];
  demoUrl: string;
}

export interface CardWrapperProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  variant?: "default" | "elevated" | "bordered" | "minimal";
  padding?: "none" | "small" | "medium" | "large";
  isInteractive?: boolean;
}

export interface EmailData {
  id: string;
  sender: string;
  senderEmail: string;
  recipients: string[];
  subject: string;
  preview: string;
  body: string;
  time: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
  labels: string[];
  isAssigned?: boolean;
  assignedTo?: string;
  isFollowing?: boolean;
  followUpDate?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface PayRate {
  type: "fixed" | "range";
  amount?: number;
  min?: number;
  max?: number;
}

export type JobFormData = JobFormSchema;
export type JobFormDataWithId = JobFormSchema & {
  id: string;
  status?: string;
  applicantsCount?: number;
  company?: string;
  createdAt: string;
  views?: number;
};

export interface JobLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface ExternalApplicationSetup {
  customFields: string[];
  redirectUrl: string;
}

export interface AIRule {
  id: string;
  text: string;
}

export interface Automation {
  enabledRules: string[];
  aiRules: AIRule[];
}

export type JobFormDefaultValues = JobFormData;

// Helper type for form validation
export type JobFormStepFields = {
  1: Array<
    keyof Pick<JobFormData, "jobTitle" | "jobBoardTitle" | "jobDescription">
  >;
  2: Array<
    keyof Pick<
      JobFormData,
      | "jobStatus"
      | "workplaceType"
      | "jobLocation"
      | "employmentType"
      | "educationRequirement"
      | "department"
      | "customDepartment"
      | "payType"
      | "payRate"
      | "positionsToHire"
      | "jobRequirements"
      | "exemptStatus"
      | "eeoJobCategory"
    >
  >;
  3: Array<
    keyof Pick<
      JobFormData,
      "startDate" | "endDate" | "externalApplicationSetup" | "automation"
    >
  >;
  4: Array<never>;
  5: Array<never>;
};

// Constants for form options
export const JOB_STATUS_OPTIONS = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
] as const;

export const WORKPLACE_TYPE_OPTIONS = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "internship", label: "Internship" },
] as const;

export const PAY_TYPE_OPTIONS = [
  { value: "salary", label: "Salary" },
  { value: "hourly", label: "Hourly" },
  { value: "commission", label: "Commission" },
  { value: "contract", label: "Contract" },
] as const;

export const PAY_RATE_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed Amount" },
  { value: "range", label: "Salary Range" },
] as const;

export const EXEMPT_STATUS_OPTIONS = [
  { value: "exempt", label: "Exempt" },
  { value: "non-exempt", label: "Non-Exempt" },
  { value: "not-applicable", label: "Not Applicable" },
] as const;

export const EEO_JOB_CATEGORY_OPTIONS = [
  {
    value: "executive-senior-level",
    label: "Executive/Senior Level Officials and Managers",
  },
  { value: "first-mid-level", label: "First/Mid-Level Officials and Managers" },
  { value: "professionals", label: "Professionals" },
  { value: "technicians", label: "Technicians" },
  { value: "sales-workers", label: "Sales Workers" },
  { value: "administrative-support", label: "Administrative Support Workers" },
  { value: "craft-workers", label: "Craft Workers" },
  { value: "operatives", label: "Operatives" },
  { value: "laborers-helpers", label: "Laborers and Helpers" },
  { value: "service-workers", label: "Service Workers" },
] as const;

export interface JobFilters {
  search: string;
  status: string[];
  type: string[];
  experience: string[];
  location: string;
  department: string[];
  priority: string[];
  dateRange: string;
}

export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  totalApplicants: number;
  avgMatchScore: number;
  fillRate: number;
}

export interface CorrespondenceTemplate {
  id: string;
  name: string;
  type: "email" | "sms";
  subject?: string;
  content: string;
  characterCount: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: "status-change" | "ai-score" | "time-based";
    condition: string;
    value: any;
  };
  action: {
    type: "send-template" | "change-status" | "notify";
    templateId?: string;
    newStatus?: string;
    delay?: number;
  };
}

export const APPLICANT_STATUSES = [
  "ai-reviewed",
  "contacting",
  "requires-manual-review",
  "reviewed",
  "scheduled-meeting",
  "shortlist",
  "denial-instant",
  "denial-manual-review",
  "denial-post-interview",
  "interviewed-follow-up",
] as const;

export type ApplicantStatus = (typeof APPLICANT_STATUSES)[number];

export interface RecruiterRegistrationInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  paymentPlan: string;
  companyRole: string;
  jobCategory: string;
  companyName: string;
  websiteUrl?: string;
  industry: string;
  companySize: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface ErrorResponse {
  message: string;
}

export interface CustomField {
  field: string;
  value: string;
  required: boolean;
}

export interface IApplicant {
  firstName: string;
  lastName: string;
  city: string;
  state: string;
  currentSalary?: string;
  expectedSalary?: string;
  experienceYears?: string;
  currentJobTitle?: string;
  currentEmployer?: string;
  availabilityDate?: Date;
  resume?: string;
  email: string;
  phone?: string;
  education?: string;
  skills?: string[] | string;
  jobHistory?: string;
  coverLetter?: string;
  noticePeriod?: string;
  customFields?: CustomField[];
  jobId: string;
  companyId: string;
  jobTitle?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export * from "@/interfaces/enums";
export * from "@/interfaces/forms";
