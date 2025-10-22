import { get, post } from './apiHelper';

export interface CreateSupportTicketRequest {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'technical' | 'billing' | 'account' | 'feature_request' | 'other';
}

export interface SupportTicketResponse {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'account' | 'feature_request' | 'other';
  userId: string;
  messages: Array<{
    id: string;
    message: string;
    author: string;
    authorType: 'user' | 'owner' | 'system';
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const createTicket = (data: CreateSupportTicketRequest) => 
  post('/support/ticket', data);

export const getMyTickets = () => 
  get('/support/tickets');

export const getTicketById = (ticketId: string) => 
  get(`/support/ticket/${ticketId}`);

export const addMessage = (ticketId: string, message: string) => 
  post(`/support/ticket/${ticketId}/message`, { message });

