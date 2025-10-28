import { ownerGet, ownerPost, ownerPut, ownerDelete } from './apiHelper';

export interface OwnerAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'tech-support';
  status: 'active' | 'suspended' | 'inactive';
  lastLogin?: Date;
  invitedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  invitedAt?: Date;
  createdAt: Date;
}

export interface CreateOwnerAccountRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'tech-support';
}

export interface CreateOwnerAccountResponse {
  owner: OwnerAccount;
  inviteLink: string;
  tempPassword: string;
}

class OwnerAccountsService {
  async getAllAccounts(): Promise<OwnerAccount[]> {
    const response = await ownerGet('/owner/management/owner-accounts');
    return response.data;
  }

  async createAccount(data: CreateOwnerAccountRequest): Promise<CreateOwnerAccountResponse> {
    const response = await ownerPost('/owner/management/owner-accounts', data);
    return response.data;
  }

  async updateAccount(ownerId: string, updates: Partial<{
    firstName: string;
    lastName: string;
    role: 'owner' | 'tech-support';
    status: string;
  }>): Promise<OwnerAccount> {
    const response = await ownerPut(`/owner/management/owner-accounts/${ownerId}`, updates);
    return response.data;
  }

  async deleteAccount(ownerId: string): Promise<void> {
    await ownerDelete(`/owner/management/owner-accounts/${ownerId}`);
  }

  async resendInvitation(ownerId: string): Promise<{ inviteLink: string; tempPassword: string }> {
    const response = await ownerPost(`/owner/management/owner-accounts/${ownerId}/resend-invitation`, {});
    return response.data;
  }
}

export const ownerAccountsService = new OwnerAccountsService();

