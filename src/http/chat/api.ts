import { get, post, patch } from '../apiHelper';

// Unified Chat API - supports all channels (email, SMS, portal)

// Conversation management
export const createConversation = (data: {
  to: string;
  subject: string;
  content: string;
  htmlContent?: string;
  channel?: 'email' | 'sms' | 'portal';
  jobId?: string;
  applicantId?: string;
  templateId?: string;
  metadata?: any;
}) => post('/chat/conversations', data);

export const getConversations = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  channel?: 'email' | 'sms' | 'portal';
  applicantId?: string;
}) => get('/chat/conversations', { params });

export const getConversation = (conversationId: string) =>
  get(`/chat/conversations/${conversationId}`);

export const sendMessage = (conversationId: string, data: {
  content: string;
  htmlContent?: string;
  channel?: 'email' | 'sms' | 'portal';
  attachments?: any[];
  metadata?: any;
}) => post(`/chat/conversations/${conversationId}/messages`, data);

export const markMessageAsRead = (conversationId: string, messageId: string) =>
  patch(`/chat/conversations/${conversationId}/messages/${messageId}/read`);

export const archiveConversation = (conversationId: string) =>
  patch(`/chat/conversations/${conversationId}/archive`);

export const closeConversation = (conversationId: string) =>
  patch(`/chat/conversations/${conversationId}/close`);

export const getChatStats = () =>
  get('/chat/stats');

// Quick send functions for different channels
export const sendEmailMessage = (conversationId: string, content: string, htmlContent?: string) =>
  sendMessage(conversationId, { content, htmlContent, channel: 'email' });

export const sendSMSMessage = (conversationId: string, content: string) =>
  sendMessage(conversationId, { content, channel: 'sms' });

export const sendPortalMessage = (conversationId: string, content: string, htmlContent?: string) =>
  sendMessage(conversationId, { content, htmlContent, channel: 'portal' });

// Backward compatibility aliases (maintains existing API calls)
export const getEmailConversations = getConversations;
export const sendEmailConversationMessage = sendEmailMessage;
export const getEmailChatStats = getChatStats;

// Channel-specific conversation creation
export const createEmailConversation = (data: {
  to: string;
  subject: string;
  content: string;
  htmlContent?: string;
  jobId?: string;
  applicantId?: string;
}) => createConversation({ ...data, channel: 'email' });

export const createSMSConversation = (data: {
  to: string;
  subject: string;
  content: string;
  jobId?: string;
  applicantId?: string;
}) => createConversation({ ...data, channel: 'sms' });

export const createPortalConversation = (data: {
  to: string;
  subject: string;
  content: string;
  htmlContent?: string;
  jobId?: string;
  applicantId?: string;
}) => createConversation({ ...data, channel: 'portal' });

// Bulk operations
export const markAllMessagesAsRead = (conversationId: string) =>
  patch(`/chat/conversations/${conversationId}/messages/read-all`);

export const getUnreadCount = () =>
  get('/chat/conversations/unread-count');

// Advanced features
export const searchConversations = (params: {
  query: string;
  channel?: 'email' | 'sms' | 'portal';
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) => get('/chat/conversations/search', { params });

export const getConversationsByApplicant = (applicantId: string, params?: {
  page?: number;
  limit?: number;
}) => getConversations({ ...params, applicantId });

// Migration and utilities
export const migrateFromEmailChat = () =>
  post('/chat/migrate-from-email-chat');

export const validateConversationAccess = (conversationId: string) =>
  get(`/chat/conversations/${conversationId}/access`);

// Types for frontend use
export interface ChatMessage {
  messageId: string;
  content: string;
  htmlContent?: string;
  channel: 'email' | 'sms' | 'portal';
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  from: string;
  to: string[];
  readAt?: Date;
  deliveryStatus: 'sent' | 'delivered' | 'failed' | 'read';
  metadata?: any;
}

export interface ChatConversation {
  _id: string;
  conversationId: string;
  subject: string;
  participants: Array<{
    email: string;
    name?: string;
    role: 'recruiter' | 'applicant';
    userId?: string;
    applicantId?: string;
    phoneNumber?: string;
  }>;
  messages: ChatMessage[];
  channels: ('email' | 'sms' | 'portal')[];
  primaryChannel: 'email' | 'sms' | 'portal';
  applicantId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    city?: string;
    state?: string;
    jobId?: {
      _id: string;
      jobTitle: string;
      department?: string;
      location?: string;
    };
  };
  status: 'active' | 'closed' | 'archived';
  priority: 'low' | 'normal' | 'high';
  tags: string[];
  lastMessageAt: Date;
  metrics?: {
    totalMessages: number;
    unreadCount: number;
    lastActivityAt: Date;
  };
  metadata?: {
    source: 'email' | 'sms' | 'portal' | 'auto' | 'recruiter_initiated';
    [key: string]: any;
  };
}

export interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  closedConversations: number;
  archivedConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  channelBreakdown: {
    email: number;
    sms: number;
    portal: number;
  };
}
