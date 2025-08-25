export interface OwnerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  lastLogin: string;
}

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

export interface OwnerStats {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  growthRate: number;
}
