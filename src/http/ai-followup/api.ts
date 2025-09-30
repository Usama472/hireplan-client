import { get, post, put, del } from '../apiHelper';

const BASE_URL = '/ai-followup';

export interface AIFollowupQuestion {
  question: string;
  category: 'technical' | 'experience' | 'cultural' | 'behavioral' | 'custom';
  scoringCriteria?: string;
}

export interface AIFollowupResponse {
  question: string;
  answer: string;
  aiScore: number;
  aiAnalysis: string;
  scoringReason: string;
  timestamp: string;
}

export interface AIFollowupSuggestion {
  type: 'hire' | 'maybe' | 'reject';
  confidence: number;
  reasoning: string;
  keyStrengths: string[];
  concerns: string[];
  questionAnalysis: Array<{
    question: string;
    score: number;
    analysis: string;
  }>;
}

export interface AIFollowup {
  _id: string;
  applicantId: string;
  jobId: string;
  automationId: string;
  conversationId?: string;
  questions: AIFollowupQuestion[];
  responses: AIFollowupResponse[];
  finalSuggestion?: AIFollowupSuggestion;
  processingStatus: 'pending' | 'questions_sent' | 'responses_received' | 'analysis_complete' | 'failed';
  allQuestionsAnswered: boolean;
  emailSent: boolean;
  emailSentAt?: string;
  responseDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAIFollowupRequest {
  applicantId: string;
  jobId: string;
  automationId: string;
  questions: AIFollowupQuestion[];
  responseDeadlineHours?: number;
  emailSubject?: string;
}

export interface ProcessFollowupResponseRequest {
  followupId: string;
  emailContent: string;
  fromEmail: string;
}

// Create AI follow-up
export const createFollowup = (data: CreateAIFollowupRequest) => {
  return post(`${BASE_URL}`, data);
};

// Get AI follow-up by ID
export const getFollowupById = (followupId: string) => {
  return get(`${BASE_URL}/${followupId}`);
};

// Send follow-up questions via email
export const sendFollowupQuestions = (followupId: string) => {
  return post(`${BASE_URL}/${followupId}/send`);
};

// Process follow-up response
export const processFollowupResponse = (data: ProcessFollowupResponseRequest) => {
  return post(`${BASE_URL}/process-response`, data);
};

// Generate final AI suggestion
export const generateFinalSuggestion = (followupId: string) => {
  return post(`${BASE_URL}/${followupId}/generate-suggestion`);
};

// Get AI follow-ups with pagination
export const getFollowups = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  processingStatus?: string;
  applicantId?: string;
  jobId?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
  }
  const queryString = searchParams.toString();
  return get(`${BASE_URL}${queryString ? `?${queryString}` : ''}`);
};

// Get AI follow-up stats
export const getFollowupStats = () => {
  return get(`${BASE_URL}/stats`);
};

// Get follow-ups by applicant
export const getFollowupsByApplicant = (applicantId: string) => {
  return get(`${BASE_URL}/applicant/${applicantId}`);
};

// Get follow-ups by job
export const getFollowupsByJob = (jobId: string) => {
  return get(`${BASE_URL}/job/${jobId}`);
};

// Get follow-up analytics
export const getFollowupAnalytics = (timeRange: number = 30) => {
  return get(`${BASE_URL}/analytics?timeRange=${timeRange}`);
};

// Delete AI follow-up
export const deleteFollowup = (followupId: string) => {
  return del(`${BASE_URL}/${followupId}`);
};
