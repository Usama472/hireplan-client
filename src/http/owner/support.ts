import { ownerGet, ownerPost, ownerPatch } from './apiHelper';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'account' | 'feature_request' | 'other';
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  company?: {
    companyName: string;
  };
  assignedTo?: string;
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

class OwnerSupportService {
  async getAllTickets(): Promise<SupportTicket[]> {
    try {
      const response = await ownerGet('/owner/support');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch support tickets');
    }
  }

  async getTicketById(ticketId: string): Promise<SupportTicket> {
    try {
      const response = await ownerGet(`/owner/support/${ticketId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch support ticket');
    }
  }

  async createTicket(data: {
    title: string;
    description: string;
    userId: string;
    priority?: string;
    category?: string;
  }): Promise<SupportTicket> {
    try {
      const response = await ownerPost('/owner/support', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create support ticket');
    }
  }

  async updateTicketStatus(ticketId: string, status: string): Promise<SupportTicket> {
    try {
      const response = await ownerPatch(`/owner/support/${ticketId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update ticket status');
    }
  }

  async addMessage(ticketId: string, message: string, author: string, authorType: string = 'owner'): Promise<SupportTicket> {
    try {
      const response = await ownerPost(`/owner/support/${ticketId}/message`, {
        message,
        author,
        authorType
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to add message');
    }
  }

  async assignTicket(ticketId: string, assignedTo: string): Promise<SupportTicket> {
    try {
      const response = await ownerPatch(`/owner/support/${ticketId}/assign`, { assignedTo });
      return response.data;
    } catch (error) {
      throw new Error('Failed to assign ticket');
    }
  }
}

export const ownerSupportService = new OwnerSupportService();
