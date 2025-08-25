import { get, post } from '../apiHelper';

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

  constructor() {
    // Load tokens from localStorage on initialization
    this.accessToken = localStorage.getItem('owner_access_token');
    this.refreshToken = localStorage.getItem('owner_refresh_token');
  }

  async login(credentials: OwnerLoginRequest): Promise<OwnerLoginResponse> {
    try {
      const data = await post('/owner/auth/login', credentials);
      
      // Store tokens
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      localStorage.setItem('owner_access_token', data.accessToken);
      localStorage.setItem('owner_refresh_token', data.refreshToken);
      
      return data;
    } catch (error) {
      throw new Error('Owner login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await post('/owner/auth/logout', {}, {
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
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }

    try {
      const response = await post('/owner/auth/refresh', {
        refreshToken: this.refreshToken
      });
      
      this.accessToken = response.accessToken;
      localStorage.setItem('owner_access_token', response.accessToken);
      
      return response.accessToken;
    } catch (error) {
      // Refresh failed, clear tokens
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('owner_access_token');
      localStorage.removeItem('owner_refresh_token');
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
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Add auth header to requests
  getAuthHeaders(): Record<string, string> {
    return this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {};
  }
}

export const ownerAuthService = new OwnerAuthService();
