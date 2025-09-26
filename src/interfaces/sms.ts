export interface SMSTemplateVariable {
  _id?: string;
  key: string;
  title: string;
}

export interface SMSTemplate {
  _id: string;
  name: string;
  category: 'invite' | 'notification' | 'reminder' | 'follow-up' | 'custom';
  message: string;
  isActive: boolean;
  description: string;
  variables: SMSTemplateVariable[];
  characterCount: number;
  maxLength: number; // SMS character limit (160 for single SMS, 1600 for long SMS)
  createdBy?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SMSMessage {
  _id: string;
  messageId: string;
  to: string; // Phone number
  from: string; // Sender (HirePlan number)
  message: string;
  templateId?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  direction: 'inbound' | 'outbound';
  characterCount: number;
  segmentCount: number; // Number of SMS segments (for billing)
  deliveryStatus?: string;
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  
  // Context data
  applicantId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  jobId?: {
    _id: string;
    jobTitle: string;
  };
  companyId: string;
  
  // Metadata
  metadata?: {
    conversationId?: string;
    automationId?: string;
    source?: 'manual' | 'automation' | 'chat_invite' | 'reminder' | 'template';
    [key: string]: any;
  };
  
  createdAt?: string;
  updatedAt?: string;
}

export interface SMSAnalytics {
  totalMessages: number;
  sentMessages: number;
  deliveredMessages: number;
  failedMessages: number;
  totalSegments: number;
  deliveryRate: number;
  successRate: number;
}

export interface SendSMSRequest {
  to: string;
  message: string;
  templateId?: string;
  applicantId?: string;
  jobId?: string;
  metadata?: any;
}

export interface SendSMSWithTemplateRequest {
  templateId: string;
  to: string;
  templateData: any;
  applicantId?: string;
  jobId?: string;
  metadata?: any;
}

export interface SendChatInviteRequest {
  applicantId: string;
  jobId: string;
  templateId?: string;
  customMessage?: string;
}

export interface CreateSMSTemplateRequest {
  name: string;
  category: 'invite' | 'notification' | 'reminder' | 'follow-up' | 'custom';
  message: string;
  description?: string;
  maxLength?: number;
  variables?: SMSTemplateVariable[];
}

export interface UpdateSMSTemplateRequest extends Partial<CreateSMSTemplateRequest> {
  isActive?: boolean;
}

export interface SMSTemplateListResponse {
  results: SMSTemplate[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface SMSMessageListResponse {
  results: SMSMessage[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Template variable options for different contexts
export interface TemplateVariableOption {
  key: string;
  title: string;
  category: 'applicant' | 'job' | 'company' | 'system';
  description?: string;
}

export const DEFAULT_TEMPLATE_VARIABLES: TemplateVariableOption[] = [
  // Applicant variables
  { key: 'applicant.firstName', title: 'Applicant First Name', category: 'applicant' },
  { key: 'applicant.lastName', title: 'Applicant Last Name', category: 'applicant' },
  { key: 'applicant.email', title: 'Applicant Email', category: 'applicant' },
  { key: 'applicant.phone', title: 'Applicant Phone', category: 'applicant' },
  
  // Job variables
  { key: 'job.jobTitle', title: 'Job Title', category: 'job' },
  { key: 'job.id', title: 'Job ID', category: 'job' },
  
  // Company variables
  { key: 'company.name', title: 'Company Name', category: 'company' },
  { key: 'company.id', title: 'Company ID', category: 'company' },
  
  // System variables
  { key: 'shortChatLink', title: 'Short Chat Link', category: 'system' },
  { key: 'shortInterviewLink', title: 'Short Interview Link', category: 'system' },
  { key: 'interview.date', title: 'Interview Date', category: 'system' },
  { key: 'interview.time', title: 'Interview Time', category: 'system' },
];

export const SMS_CATEGORIES = [
  { value: 'invite', label: 'Chat Invitation', description: 'Invite applicants to start conversations' },
  { value: 'notification', label: 'Notification', description: 'Status updates and confirmations' },
  { value: 'reminder', label: 'Reminder', description: 'Interview and deadline reminders' },
  { value: 'follow-up', label: 'Follow-up', description: 'Follow-up messages and check-ins' },
  { value: 'custom', label: 'Custom', description: 'Custom message templates' },
] as const;

export const SMS_MAX_LENGTH = 160; // Standard SMS length only

// Approximate length of generated short link (hireplan.co/c/abc123)
export const CHAT_LINK_LENGTH = 25;
