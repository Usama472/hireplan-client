import { get, post, patch } from '../apiHelper';

// Conversation management
export const createConversation = (data: {
  to: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  jobId?: string;
  applicantId?: string;
  attachments?: any[];
}) => post('/email-chat/conversations', data);

export const getConversations = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  applicantId?: string;
}) => get('/email-chat/conversations', { params });

export const getConversation = (conversationId: string) =>
  get(`/email-chat/conversations/${conversationId}`);

export const sendMessage = (conversationId: string, data: {
  htmlContent?: string;
  textContent?: string;
  attachments?: any[];
}) => post(`/email-chat/conversations/${conversationId}/messages`, data);

export const markMessageAsRead = (conversationId: string, messageId: string) =>
  patch(`/email-chat/conversations/${conversationId}/messages/${messageId}/read`);

export const archiveConversation = (conversationId: string) =>
  patch(`/email-chat/conversations/${conversationId}/archive`);

export const closeConversation = (conversationId: string) =>
  patch(`/email-chat/conversations/${conversationId}/close`);

export const getEmailChatStats = () =>
  get('/email-chat/stats');
