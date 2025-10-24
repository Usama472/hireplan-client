import { ownerGet, ownerPost } from './apiHelper';

export interface Company {
  id: string;
  companyName: string;
  organizationId: number;
  industry: string;
  companySize: string;
  status: 'active' | 'suspended' | 'inactive';
  maxJobPostings?: number | null; // null or undefined = unlimited
  createdAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  company?: {
    companyName: string;
  };
  createdAt: string;
  lastLogin?: string;
}

export interface SuspendedAccountSummary {
  totalSuspendedUsers: number;
  totalSuspendedCompanies: number;
  recentlySuspended: Array<{
    id: string;
    type: 'user' | 'company';
    name: string;
    suspendedAt: string;
    reason?: string;
  }>;
}

class OwnerManagementService {
  async getAllCompanies(): Promise<Company[]> {
    try {
      const response = await ownerGet('/owner/management/companies');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch companies');
    }
  }

  async suspendCompany(companyId: string, reason?: string): Promise<Company> {
    try {
      const response = await ownerPost(`/owner/management/companies/${companyId}/suspend`, { reason });
      return response.data;
    } catch (error) {
      throw new Error('Failed to suspend company');
    }
  }

  async activateCompany(companyId: string): Promise<Company> {
    try {
      const response = await ownerPost(`/owner/management/companies/${companyId}/activate`, {});
      return response.data;
    } catch (error) {
      throw new Error('Failed to activate company');
    }
  }

  async getAllUsers(companyId?: string): Promise<User[]> {
    try {
      const params = companyId ? `?companyId=${companyId}` : '';
      const response = await ownerGet(`/owner/management/users${params}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  }

  async suspendUser(userId: string, reason?: string): Promise<User> {
    try {
      const response = await ownerPost(`/owner/management/users/${userId}/suspend`, { reason });
      return response.data;
    } catch (error) {
      throw new Error('Failed to suspend user');
    }
  }

  async activateUser(userId: string): Promise<User> {
    try {
      const response = await ownerPost(`/owner/management/users/${userId}/activate`, {});
      return response.data;
    } catch (error) {
      throw new Error('Failed to activate user');
    }
  }

  async bulkSuspendUsers(userIds: string[], reason?: string): Promise<any> {
    try {
      const response = await ownerPost('/owner/management/users/bulk-suspend', { userIds, reason });
      return response.data;
    } catch (error) {
      throw new Error('Failed to bulk suspend users');
    }
  }

  async bulkActivateUsers(userIds: string[]): Promise<any> {
    try {
      const response = await ownerPost('/owner/management/users/bulk-activate', { userIds });
      return response.data;
    } catch (error) {
      throw new Error('Failed to bulk activate users');
    }
  }

  async getSuspendedAccounts(): Promise<SuspendedAccountSummary> {
    try {
      const response = await ownerGet('/owner/management/suspended-accounts');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch suspended accounts summary');
    }
  }

  async getCompanyJobs(companyId: string): Promise<any[]> {
    try {
      const response = await ownerGet(`/owner/management/companies/${companyId}/jobs`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch company jobs');
    }
  }

  async getCompanyDetails(companyId: string): Promise<any> {
    try {
      const response = await ownerGet(`/owner/management/companies/${companyId}/details`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch company details');
    }
  }
}

export const ownerManagementService = new OwnerManagementService();
