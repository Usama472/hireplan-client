import { apiHelper } from "../apiHelper";

const BASE_URL = '/subscription';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planId: string | null;
  planName: string | null;
  subscriptionStatus: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  stripeSubscriptionId?: string;
}

export const simpleSubscriptionAPI = {
  // Get Stripe configuration
  getConfig: async () => {
    try {
      console.log('🚀 API: Getting Stripe config from backend');
      const response = await apiHelper.get(`${BASE_URL}/config`);
      console.log('📥 API: Config received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ API: Failed to get Stripe config:', error);
      throw error;
    }
  },

  // Get subscription status
  getStatus: async (): Promise<SubscriptionStatus> => {
    try {
      console.log('🚀 API: Making request to', `${BASE_URL}/status`);
      const response = await apiHelper.get(`${BASE_URL}/status`);
      console.log('📥 API: Response received:', response);
      return response.data;
    } catch (error) {
      console.error('❌ API: Failed to get subscription status:', error);
      return {
        hasActiveSubscription: false,
        planId: null,
        planName: null,
        subscriptionStatus: 'error'
      };
    }
  },

  // Create checkout session
  createCheckout: async (planId: string, successUrl: string, cancelUrl: string) => {
    const response = await apiHelper.post(`${BASE_URL}/checkout/session`, {
      planId,
      successUrl,
      cancelUrl
    });
    return response.data;
  },

  // Create portal session
  createPortal: async (returnUrl: string) => {
    const response = await apiHelper.post(`${BASE_URL}/portal/session`, {
      returnUrl
    });
    return response.data;
  },

  // Cancel subscription
  cancel: async (cancelAtPeriodEnd: boolean = true) => {
    const response = await apiHelper.post(`${BASE_URL}/cancel`, {
      cancelAtPeriodEnd
    });
    return response.data;
  },

  // Reactivate subscription
  reactivate: async () => {
    const response = await apiHelper.post(`${BASE_URL}/reactivate`, {});
    return response.data;
  },

  // Create subscription with payment method (for custom checkout)
  createSubscription: async (data: {
    planId: string;
    paymentMethodId: string;
    billingDetails: any;
  }) => {
    console.log('🚀 Creating subscription with data:', { ...data, paymentMethodId: data.paymentMethodId?.substring(0, 10) + '...' });
    const response = await apiHelper.post(`${BASE_URL}/create`, data);
    console.log('📥 Subscription creation response:', response);
    return response;
  }
};

export default simpleSubscriptionAPI;
