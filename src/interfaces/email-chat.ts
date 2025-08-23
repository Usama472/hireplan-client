export interface EmailChatParticipant {
  email: string;
  name?: string;
  role: 'recruiter' | 'applicant';
  userId?: string;
  applicantId?: string;
}

export interface EmailChatAttachment {
  filename: string;
  contentType: string;
  size: number;
  url?: string;
  contentId?: string;
}

export interface EmailChatMessage {
  _id?: string;
  messageId: string;
  threadId?: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  attachments?: EmailChatAttachment[];
  timestamp: string;
  direction: 'inbound' | 'outbound';
  deliveryStatus?: 'sent' | 'delivered' | 'failed' | 'bounced';
  readReceipt?: boolean;
  readAt?: string;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    espMessageId?: string;
    references?: string[];
    inReplyTo?: string;
  };
}

export interface EmailChatConversation {
  _id?: string;
  conversationId: string;
  alias: string;
  subject: string;
  participants: EmailChatParticipant[];
  messages: EmailChatMessage[];
  status: 'active' | 'closed' | 'archived';
  tags?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  jobId?: string;
  applicantId?: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export interface CreateConversationRequest {
  to: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  jobId?: string;
  applicantId?: string;
  attachments?: EmailChatAttachment[];
}

export interface SendMessageRequest {
  htmlContent?: string;
  textContent?: string;
  attachments?: EmailChatAttachment[];
}

export interface ConversationListResponse {
  conversations: EmailChatConversation[];
  total: number;
  page: number;
  limit: number;
}

export interface EmailChatStats {
  activeConversations: number;
  closedConversations: number;
  totalConversations: number;
}
