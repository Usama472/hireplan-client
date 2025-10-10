import { ownerGet, ownerPost, ownerPut, ownerDelete } from './apiHelper';

export interface OwnerSubscription {
  id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  company?: {
    companyName: string;
  };
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  planId: string;
  planName: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  endedAt?: string;
  trialStart?: string;
  trialEnd?: string;
  quantity: number;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionAnalytics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  pastDueSubscriptions: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  growthRate: number;
}

export interface RevenueData {
  period: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  oneTimeCharges: number;
  refunds: number;
}

class OwnerSubscriptionService {
  async getAllSubscriptions(): Promise<OwnerSubscription[]> {
    try {
      const response = await ownerGet('/owner/subscriptions');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch subscriptions');
    }
  }

  async getSubscriptionById(subscriptionId: string): Promise<OwnerSubscription> {
    try {
      const response = await ownerGet(`/owner/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch subscription');
    }
  }

  async getSubscriptionsByCompany(companyId: string): Promise<OwnerSubscription[]> {
    try {
      const response = await ownerGet(`/owner/subscriptions/company/${companyId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch company subscriptions');
    }
  }

  async suspendSubscription(subscriptionId: string): Promise<OwnerSubscription> {
    try {
      const response = await ownerPost(`/owner/subscriptions/${subscriptionId}/suspend`, {});
      return response.data;
    } catch (error) {
      throw new Error('Failed to suspend subscription');
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<OwnerSubscription> {
    try {
      const response = await ownerPost(`/owner/subscriptions/${subscriptionId}/reactivate`, {});
      return response.data;
    } catch (error) {
      throw new Error('Failed to reactivate subscription');
    }
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<OwnerSubscription> {
    try {
      const response = await ownerPost(`/owner/subscriptions/${subscriptionId}/cancel`, {
        cancelAtPeriodEnd
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to cancel subscription');
    }
  }

  async retryPayment(subscriptionId: string): Promise<any> {
    try {
      const response = await ownerPost(`/owner/subscriptions/${subscriptionId}/retry-payment`, {});
      return response.data;
    } catch (error) {
      throw new Error('Failed to retry payment');
    }
  }

  async updateSubscriptionPlan(subscriptionId: string, newPlanId: string, prorationBehavior: string = 'create_prorations'): Promise<OwnerSubscription> {
    try {
      const response = await ownerPut(`/owner/subscriptions/${subscriptionId}/plan`, {
        newPlanId,
        prorationBehavior
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update subscription plan');
    }
  }

  async getSubscriptionAnalytics(period: string = '30d'): Promise<SubscriptionAnalytics> {
    try {
      const response = await ownerGet(`/owner/subscriptions/analytics/data?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch subscription analytics');
    }
  }

  async getRevenueData(period: string = '30d'): Promise<RevenueData> {
    try {
      const response = await ownerGet(`/owner/subscriptions/revenue/data?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch revenue data');
    }
  }
}

export const ownerSubscriptionService = new OwnerSubscriptionService();
