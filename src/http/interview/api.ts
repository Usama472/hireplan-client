import { get, post } from '../apiHelper';

export interface SchedulingData {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    interviewType: string;
    duration: number;
  };
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  availableSlots: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    available: boolean;
  }>;
}

export interface ScheduleInterviewRequest {
  jobId: string;
  applicantId: string;
  slotId: string;
  scheduledTime: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

export interface ScheduleInterviewResponse {
  success: boolean;
  message: string;
  interview?: {
    id: string;
    meetingLink?: string;
    scheduledTime: string;
  };
}

/**
 * Get scheduling data for a specific job and applicant
 */
export const getSchedulingData = async (
  jobId: string,
  applicantId: string
): Promise<{ success: boolean; data: SchedulingData; message?: string }> => {
  return await get(`/interviews/schedule-data/${jobId}/${applicantId}`);
};

/**
 * Schedule an interview for the given slot
 */
export const scheduleInterview = async (
  request: ScheduleInterviewRequest
): Promise<ScheduleInterviewResponse> => {
  return await post('/interviews/schedule', request);
};

/**
 * Get available time slots for a specific job
 */
export const getAvailableSlots = async (
  jobId: string,
  startDate?: string,
  endDate?: string
) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  return await get(`/interviews/available-slots/${jobId}?${params}`);
};