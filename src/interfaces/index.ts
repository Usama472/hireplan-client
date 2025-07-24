import type { ReactNode } from 'react'

export type AppRoutesType = {
  id: number | string
  url: string
  element: ReactNode
  isPrivate: boolean
}

export type DefaultLayoutProps = {
  children: ReactNode
}

export interface CompanyInfo {
  companyName: string
  websiteUrl: string
  industry: string
  companySize: string
  address: string
  city: string
  state: string
  zipCode: string
  country?: string
}

export interface Template {
  id: string
  title: string
  description: string
  image: string
  likes: number
  featured: boolean
  new: boolean
  category: string
  tags: string[]
  demoUrl: string
}

export interface CardWrapperProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hoverEffect?: boolean
  variant?: 'default' | 'elevated' | 'bordered' | 'minimal'
  padding?: 'none' | 'small' | 'medium' | 'large'
  isInteractive?: boolean
}

export interface EmailData {
  id: string
  sender: string
  senderEmail: string
  recipients: string[]
  subject: string
  preview: string
  body: string
  time: string
  date: string
  isRead: boolean
  isStarred: boolean
  hasAttachment: boolean
  attachments?: {
    name: string
    size: string
    type: string
  }[]
  labels: string[]
  isAssigned?: boolean
  assignedTo?: string
  isFollowing?: boolean
  followUpDate?: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Job {
  id: string

  // Job Ad
  jobTitle: string // Internal title
  jobBoardTitle: string // External title
  jobDescription: string
  backgroundScreeningDisclaimer?: boolean

  // Position Details
  jobStatus: 'low' | 'medium' | 'high' | 'urgent' // Changed from priority
  workplaceType: 'onsite' | 'remote' | 'hybrid' // Updated values
  jobLocation: {
    address: string
    city: string
    state: string
    zipCode: string
  }
  employmentType: 'full-time' | 'part-time' | 'contract' | 'seasonal'
  educationRequirement: string
  department: string
  customDepartment?: string
  payType:
    | 'hourly'
    | 'salary'
    | 'base-commission'
    | 'base-tips'
    | 'base-bonus'
    | 'commission-only'
    | 'other'
  payRate: {
    type: 'fixed' | 'range'
    amount?: number
    min?: number
    max?: number
  }
  positionsToHire: number
  exemptStatus?: 'exempt' | 'non-exempt' | 'not-applicable'
  eeoJobCategory?: string
  jobRequirements: string[]

  // Settings & Notifications
  startDate: string
  endDate: string
  notifyOnApplication?: {
    enabled: boolean
    recipients: string[]
  }
  dailyRoundup?: {
    enabled: boolean
    recipients: string[]
    time: string
  }

  // Legacy fields for compatibility
  company?: string
  location?: string // Computed from jobLocation
  type?: string // Mapped from employmentType
  experience?: string // Derived from educationRequirement
  salary?: {
    min: number
    max: number
    currency: string
  }
  requirements?: string[] // Mapped from jobRequirements
  benefits?: string[]
  skills?: string[]
  status: 'active' | 'paused' | 'closed' | 'draft'
  applicants: number
  views: number
  matches: number
  createdAt: string
  updatedAt: string
  deadline?: string // Mapped from endDate
  priority?: 'low' | 'medium' | 'high' | 'urgent' // Mapped from jobStatus
  remote?: boolean // Derived from workplaceType
  featured?: boolean
}

export interface JobFilters {
  search: string
  status: string[]
  type: string[]
  experience: string[]
  location: string
  department: string[]
  priority: string[]
  dateRange: string
}

export interface JobStats {
  totalJobs: number
  activeJobs: number
  totalApplicants: number
  avgMatchScore: number
  fillRate: number
}

export interface CorrespondenceTemplate {
  id: string
  name: string
  type: 'email' | 'sms'
  subject?: string
  content: string
  characterCount: number
}

export interface AutomationRule {
  id: string
  name: string
  trigger: {
    type: 'status-change' | 'ai-score' | 'time-based'
    condition: string
    value: any
  }
  action: {
    type: 'send-template' | 'change-status' | 'notify'
    templateId?: string
    newStatus?: string
    delay?: number
  }
}

export interface JobCreationData {
  // Job Ad
  jobTitle: string
  jobBoardTitle: string
  jobDescription: string
  backgroundScreeningDisclaimer: boolean

  // Position Details
  jobStatus: 'low' | 'medium' | 'high' | 'urgent'
  workplaceType: 'onsite' | 'remote' | 'hybrid'
  jobLocation: {
    address: string
    city: string
    state: string
    zipCode: string
  }
  employmentType: 'full-time' | 'part-time' | 'contract' | 'seasonal'
  educationRequirement: string
  department: string
  customDepartment?: string
  payType:
    | 'hourly'
    | 'salary'
    | 'base-commission'
    | 'base-tips'
    | 'base-bonus'
    | 'commission-only'
    | 'other'
  payRate: {
    type: 'fixed' | 'range'
    amount?: number
    min?: number
    max?: number
  }
  positionsToHire: number
  exemptStatus: 'exempt' | 'non-exempt' | 'not-applicable'
  eeoJobCategory: string
  jobRequirements: string[]

  // Settings & Notifications
  startDate: string
  endDate: string
  notifyOnApplication: {
    enabled: boolean
    recipients: string[]
  }
  dailyRoundup: {
    enabled: boolean
    recipients: string[]
    time: string
  }
  externalApplicationSetup: {
    redirectUrl?: string
    customFields: string[]
  }
}

export const APPLICANT_STATUSES = [
  'ai-reviewed',
  'contacting',
  'requires-manual-review',
  'reviewed',
  'scheduled-meeting',
  'shortlist',
  'denial-instant',
  'denial-manual-review',
  'denial-post-interview',
  'interviewed-follow-up',
] as const

export type ApplicantStatus = (typeof APPLICANT_STATUSES)[number]

export interface RecruiterRegistrationInput {
  firstName: string
  lastName: string
  email: string
  password: string
  paymentPlan: string
  companyRole: string
  minimumMatchScore: number
  autoRejectThreshold: number
  experienceWeight: number
  educationWeight: number
  certificationsWeight: number
  keywordsWeight: number
  companyName: string
  websiteUrl?: string
  industry: string
  companySize: string
  address: string
  city: string
  state: string
  zipCode: string
  country?: string
}

export interface ErrorResponse {
  message: string
}

export * from '@/interfaces/enums'
export * from '@/interfaces/forms'
