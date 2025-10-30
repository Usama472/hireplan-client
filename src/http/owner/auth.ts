import { ownerPost, ownerGet } from './apiHelper';

export interface OwnerLoginRequest {
  email: string;
  password: string;
}

export interface OwnerLoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface OwnerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  lastLogin: string;
}

class OwnerAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private static instance: OwnerAuthService | null = null;

  // Singleton pattern to maintain state across re-renders
  static getInstance(): OwnerAuthService {
    if (!OwnerAuthService.instance) {
      OwnerAuthService.instance = new OwnerAuthService();
    }
    return OwnerAuthService.instance;
  }

  constructor() {
    if (OwnerAuthService.instance) {
      // Return existing instance to maintain state
      return OwnerAuthService.instance;
    }

    // Load tokens from localStorage on initialization
    // Use separate token keys for owner authentication
    this.loadTokens();
    console.log('🔧 OwnerAuthService initialized');
    console.log('Initial access token:', this.accessToken ? 'Present' : 'Missing');
    console.log('Initial is authenticated:', this.isAuthenticated());
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem('owner_access_token');
    this.refreshToken = localStorage.getItem('owner_refresh_token');
  }

  async login(credentials: OwnerLoginRequest): Promise<OwnerLoginResponse> {
    try {
      console.log('🔐 Attempting owner login with:', credentials.email);
      const response = await ownerPost('/owner/auth/login', credentials);
      
      // Extract data from response (backend wraps in data object)
      const data = response.data || response;

      console.log('📦 Login response:', response);
      console.log('🔑 Extracted data:', data);

      // Store tokens using owner-specific keys (separate from regular client)
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;

      if (!accessToken || !refreshToken) {
        console.error('❌ No tokens in response:', data);
        throw new Error('No tokens received from server');
      }

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      localStorage.setItem('owner_access_token', accessToken);
      localStorage.setItem('owner_refresh_token', refreshToken);

      // Ensure singleton instance has updated tokens
      if (OwnerAuthService.instance) {
        OwnerAuthService.instance.loadTokens();
      }

      console.log('✅ Owner login successful');
      console.log('🔑 Token storage verification:');
      console.log('   Access token:', accessToken.substring(0, 20) + '...');
      console.log('   Access token length:', accessToken.length);
      console.log('   localStorage access token:', localStorage.getItem('owner_access_token')?.substring(0, 20) + '...');
      console.log('   Service is authenticated:', this.isAuthenticated());
      
      return data;
    } catch (error: any) {
      console.error('❌ Owner login failed:', error.response?.data || error.message);
      throw new Error('Owner login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await ownerPost('/owner/auth/logout', {}, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        });
      }
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear tokens
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('owner_access_token');
      localStorage.removeItem('owner_refresh_token');

      // Update singleton instance
      if (OwnerAuthService.instance) {
        OwnerAuthService.instance.loadTokens();
      }
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }

    try {
      const response = await ownerPost('/owner/auth/refresh', {
        refreshToken: this.refreshToken
      });

      this.accessToken = response.accessToken;
      localStorage.setItem('owner_access_token', response.accessToken);

      // Update singleton instance
      if (OwnerAuthService.instance) {
        OwnerAuthService.instance.loadTokens();
      }

      return response.accessToken;
    } catch (error) {
      // Refresh failed, clear tokens
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('owner_access_token');
      localStorage.removeItem('owner_refresh_token');

      // Update singleton instance
      if (OwnerAuthService.instance) {
        OwnerAuthService.instance.loadTokens();
      }
      return null;
    }
  }

  async getCurrentUser(): Promise<OwnerUser | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const response = await get('/owner/auth/me', {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      return response;
    } catch (error) {
      // Token might be expired, try to refresh
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        try {
          const response = await get('/owner/auth/me', {
            headers: { Authorization: `Bearer ${newToken}` }
          });
          return response;
        } catch (refreshError) {
          return null;
        }
      }
      return null;
    }
  }

  isAuthenticated(): boolean {
    // Check localStorage directly for more reliable authentication
    const storedToken = localStorage.getItem('owner_access_token');
    return !!(storedToken && (storedToken === 'hardcoded-access-token' || storedToken.length > 10));
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Add auth header to requests
  getAuthHeaders(): Record<string, string> {
    return this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {};
  }

  // Update password (for account setup)
  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await ownerPost('/owner/auth/update-password', data, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      return response;
    } catch (error: any) {
      console.error('❌ Failed to update password:', error);
      throw error;
    }
  }
}

export const ownerAuthService = new OwnerAuthService();
