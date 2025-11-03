import { post, get } from './apiHelper';

class CompanySignupService {
  async verifySignupToken(token: string): Promise<{
    company: {
      id: string;
      companyName: string;
      websiteUrl?: string;
      industry?: string;
      companySize?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
      planId?: string;
      customMonthlyPrice?: number | null;
      maxJobPostings?: number | null;
    };
    adminInfo: {
      adminEmail: string;
      adminFirstName: string;
      adminLastName: string;
    };
    expiresAt: Date;
  }> {
    try {
      const response = await get(`/company-signup/verify/${token}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify signup token');
    }
  }

  async completeSignup(token: string, userData: { password: string }): Promise<{
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      username: string;
      companyRole: string;
    };
    company: {
      id: string;
      companyName: string;
      organizationId: number;
      slug: string;
      planId?: string;
      customMonthlyPrice?: number | null;
      maxJobPostings?: number | null;
    };
    tokens: {
      accessToken: {
        token: string;
        expires: Date;
      };
    };
    requiresCheckout: boolean;
  }> {
    try {
      const response = await post(`/company-signup/complete/${token}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to complete signup');
    }
  }
}

export const companySignupService = new CompanySignupService();
export default companySignupService;
