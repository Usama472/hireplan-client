import { get, post, patch, del } from '../apiHelper';

export interface OwnerStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  growthRate: number;
}

export interface OwnerUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
  status: string;
  subscription: string;
  lastLogin: string;
  createdAt: string;
}

export interface OwnerSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  createdAt: string;
}

export interface OwnerBillingStats {
  revenue: {
    current: number;
    previous: number;
    change: string;
    trend: 'up' | 'down';
  };
  subscriptions: {
    current: number;
    previous: number;
    change: string;
    trend: 'up' | 'down';
  };
  churn: {
    current: number;
    previous: number;
    change: string;
    trend: 'up' | 'down';
  };
  mrr: {
    current: number;
    previous: number;
    change: string;
    trend: 'up' | 'down';
  };
}

export const ownerApi = {
  // Get dashboard statistics
  getStats: async (): Promise<OwnerStats> => {
    const response = await get('/owner/stats');
    return response;
  },

  // Get all users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }): Promise<{ users: OwnerUser[]; total: number; page: number; limit: number }> => {
    const response = await apiHelper.get('/owner/users', { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (userId: string): Promise<OwnerUser> => {
    const response = await apiHelper.get(`/owner/users/${userId}`);
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId: string, status: string): Promise<OwnerUser> => {
    const response = await apiHelper.patch(`/owner/users/${userId}/status`, { status });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await apiHelper.delete(`/owner/users/${userId}`);
  },

  // Get all subscriptions
  getSubscriptions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    planId?: string;
  }): Promise<{ subscriptions: OwnerSubscription[]; total: number; page: number; limit: number }> => {
    const response = await apiHelper.get('/owner/subscriptions', { params });
    return response.data;
  },

  // Get subscription by ID
  getSubscription: async (subscriptionId: string): Promise<OwnerSubscription> => {
    const response = await apiHelper.get(`/owner/subscriptions/${subscriptionId}`);
    return response.data;
  },

  // Update subscription
  updateSubscription: async (subscriptionId: string, updates: any): Promise<OwnerSubscription> => {
    const response = await apiHelper.patch(`/owner/subscriptions/${subscriptionId}`, updates);
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<OwnerSubscription> => {
    const response = await apiHelper.post(`/owner/subscriptions/${subscriptionId}/cancel`, { cancelAtPeriodEnd });
    return response.data;
  },

  // Reactivate subscription
  reactivateSubscription: async (subscriptionId: string): Promise<OwnerSubscription> => {
    const response = await apiHelper.post(`/owner/subscriptions/${subscriptionId}/reactivate`);
    return response.data;
  },

  // Get billing analytics
  getBillingStats: async (timeRange: string = '30d'): Promise<OwnerBillingStats> => {
    const response = await apiHelper.get('/owner/billing/stats', { params: { timeRange } });
    return response.data;
  },

  // Export users
  exportUsers: async (format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await apiHelper.get('/owner/users/export', { 
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Export subscriptions
  exportSubscriptions: async (format: 'csv' | 'xlsx' = 'csv'): Promise<Blob> => {
    const response = await apiHelper.get('/owner/subscriptions/export', { 
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },
};
