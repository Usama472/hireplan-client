import { apiHelperUnAuth } from "../apiHelper";

const BASE_URL = '/subscription';

export interface Subscription {
  _id: string;
  userId: string;
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
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export const subscriptionAPI = {
  // Get user's subscription
  getSubscription: async (userId: string): Promise<Subscription | null> => {
    try {
      const response = await apiHelperUnAuth.get(`${BASE_URL}/user/${userId}`);
      return response.data || null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get verified subscription status (checks against Stripe)
  getVerifiedSubscriptionStatus: async (): Promise<{
    hasActiveSubscription: boolean;
    planId: string | null;
    planName: string | null;
    subscriptionStatus: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    verifiedWithStripe: boolean;
  }> => {
    try {
      const response = await apiHelperUnAuth.get(`${BASE_URL}/status/verified`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting verified subscription status:', error);
      return {
        hasActiveSubscription: false,
        planId: null,
        planName: null,
        subscriptionStatus: 'error',
        verifiedWithStripe: false
      };
    }
  },

  // Create a new subscription
  createSubscription: async (data: {
    userId: string;
    planId: string;
    stripePriceId: string;
    quantity?: number;
    metadata?: Record<string, any>;
  }): Promise<Subscription> => {
    const response = await apiHelperUnAuth.post(BASE_URL, data);
    return response.data;
  },

  // Update subscription
  updateSubscription: async (subscriptionId: string, updates: {
    planId?: string;
    stripePriceId?: string;
    quantity?: number;
    cancelAtPeriodEnd?: boolean;
    metadata?: Record<string, any>;
  }): Promise<Subscription> => {
    const response = await apiHelperUnAuth.put(`${BASE_URL}/${subscriptionId}`, updates);
    return response.data;
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> => {
    const response = await apiHelperUnAuth.post(`${BASE_URL}/${subscriptionId}/cancel`, {
      cancelAtPeriodEnd
    });
    return response.data;
  },

  // Reactivate subscription
  reactivateSubscription: async (subscriptionId: string): Promise<Subscription> => {
    const response = await apiHelperUnAuth.post(`${BASE_URL}/${subscriptionId}/reactivate`);
    return response.data;
  },

  // Create Stripe checkout session
  createCheckoutSession: async (data: {
    customerId?: string;
    planId: string; // Changed from priceId to planId
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, any>;
  }): Promise<CheckoutSessionResponse> => {
    const response = await apiHelperUnAuth.post(`${BASE_URL}/checkout/session`, data);
    return response.data;
  },

  // Create customer portal session
  createCustomerPortalSession: async (data: {
    customerId?: string;
    returnUrl: string;
  }): Promise<CustomerPortalResponse> => {
    const response = await apiHelperUnAuth.post(`${BASE_URL}/portal/session`, data);
    return response.data;
  },

  // Get subscription statistics (admin only)
  getSubscriptionStats: async () => {
    const response = await apiHelperUnAuth.get(`${BASE_URL}/stats`);
    return response.data;
  },
};

// Default export
export default subscriptionAPI;
