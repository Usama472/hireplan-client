import { apiHelper } from "../apiHelper";

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

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planId: string | null;
  planName: string | null;
  subscriptionStatus: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  subscription: Subscription | null;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export const subscriptionAPI = {
  // Get current user's subscription status
  getMySubscriptionStatus: async (): Promise<SubscriptionStatus> => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      console.log('🔄 Making API call to:', `${BASE_URL}/status?t=${timestamp}`);
      const response = await apiHelper.get(`${BASE_URL}/status?t=${timestamp}`);
      console.log('✅ API response:', response);
      return response.data;
    } catch (error: any) {
      console.error('❌ API call failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      return {
        hasActiveSubscription: false,
        planId: null,
        planName: null,
        subscriptionStatus: 'error',
        subscription: null
      };
    }
  },

  // Create Stripe checkout session
  createCheckoutSession: async (data: {
    planId: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, any>;
  }): Promise<CheckoutSessionResponse> => {
    const response = await apiHelper.post(`${BASE_URL}/checkout/session`, data);
    return response.data;
  },

  // Create customer portal session
  createCustomerPortalSession: async (data: {
    returnUrl: string;
  }): Promise<CustomerPortalResponse> => {
    const response = await apiHelper.post(`${BASE_URL}/portal/session`, data);
    return response.data;
  },

  // Cancel current user's subscription
  cancelMySubscription: async (cancelAtPeriodEnd: boolean = true): Promise<Subscription> => {
    const response = await apiHelper.post(`${BASE_URL}/cancel`, {
      cancelAtPeriodEnd
    });
    return response.data;
  },

  // Reactivate current user's subscription
  reactivateMySubscription: async (): Promise<Subscription> => {
    const response = await apiHelper.post(`${BASE_URL}/reactivate`, {});
    return response.data;
  },
};

// Default export
export default subscriptionAPI;