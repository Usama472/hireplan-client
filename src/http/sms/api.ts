import { get, post, put, del, patch } from '../apiHelper';
import type {
  SMSTemplate,
  SMSMessage,
  SMSAnalytics,
  SendSMSRequest,
  SendSMSWithTemplateRequest,
  SendChatInviteRequest,
  CreateSMSTemplateRequest,
  UpdateSMSTemplateRequest,
  SMSTemplateListResponse,
  SMSMessageListResponse,
} from '@/interfaces/sms';

// SMS Template endpoints
export const createSMSTemplate = async (data: CreateSMSTemplateRequest): Promise<SMSTemplate> => {
  return await post('/sms-templates', data);
};

export const getSMSTemplates = async (params?: {
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
}): Promise<SMSTemplateListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.append('category', params.category);
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  
  const queryString = queryParams.toString();
  return await get(`/sms-templates${queryString ? `?${queryString}` : ''}`);
};

export const getSMSTemplate = async (templateId: string): Promise<SMSTemplate> => {
  return await get(`/sms-templates/${templateId}`);
};

export const updateSMSTemplate = async (
  templateId: string,
  data: UpdateSMSTemplateRequest
): Promise<SMSTemplate> => {
  return await patch(`/sms-templates/${templateId}`, data);
};

export const deleteSMSTemplate = async (templateId: string): Promise<void> => {
  return await del(`/sms-templates/${templateId}`);
};

export const getDefaultSMSTemplates = async (): Promise<SMSTemplate[]> => {
  return await get('/sms-templates/defaults');
};

export const createDefaultSMSTemplates = async (): Promise<SMSTemplate[]> => {
  return await post('/sms-templates/defaults', {});
};

// SMS Message endpoints
export const sendSMS = async (data: SendSMSRequest): Promise<SMSMessage> => {
  return await post('/sms', data);
};

export const sendSMSWithTemplate = async (data: SendSMSWithTemplateRequest): Promise<SMSMessage> => {
  return await post('/sms/template', data);
};

export const sendChatInvite = async (data: SendChatInviteRequest): Promise<{
  sms: SMSMessage;
  chatLink: string;
  token: string;
}> => {
  return await post('/sms/chat-invite', data);
};

export const getSMSMessages = async (params?: {
  status?: string;
  direction?: string;
  applicantId?: string;
  jobId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}): Promise<SMSMessageListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.direction) queryParams.append('direction', params.direction);
  if (params?.applicantId) queryParams.append('applicantId', params.applicantId);
  if (params?.jobId) queryParams.append('jobId', params.jobId);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  
  const queryString = queryParams.toString();
  return await get(`/sms${queryString ? `?${queryString}` : ''}`);
};

export const getSMSConversation = async (
  applicantId: string,
  jobId?: string
): Promise<SMSMessage[]> => {
  const queryParams = new URLSearchParams();
  if (jobId) queryParams.append('jobId', jobId);
  
  const queryString = queryParams.toString();
  return await get(`/sms/conversation/${applicantId}${queryString ? `?${queryString}` : ''}`);
};

export const getSMSAnalytics = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<SMSAnalytics> => {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  
  const queryString = queryParams.toString();
  return await get(`/sms/analytics${queryString ? `?${queryString}` : ''}`);
};

// Update delivery status (for webhook handling - typically internal)
export const updateDeliveryStatus = async (data: {
  messageId: string;
  status: string;
  deliveredAt?: string;
  errorMessage?: string;
}): Promise<void> => {
  return await post('/sms/delivery-status', data);
};
