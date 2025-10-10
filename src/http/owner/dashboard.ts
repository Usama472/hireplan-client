import { ownerGet } from './apiHelper';

export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  activeSubscriptions: number;
  totalRevenue: number;
  suspendedAccounts: number;
  totalUsers: number;
  growthMetrics: {
    companiesGrowth: number;
    usersGrowth: number;
    revenueGrowth: number;
  };
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface SystemHealth {
  apiResponseTime: number;
  databasePerformance: string;
  serverUptime: string;
  activeUsers: number;
  status: 'healthy' | 'degraded' | 'down';
}

class OwnerDashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await ownerGet('/owner/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch dashboard stats');
    }
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await ownerGet(`/owner/dashboard/activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch recent activity');
    }
  }

  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await ownerGet('/owner/dashboard/health');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch system health');
    }
  }

  async getPlatformOverview(): Promise<any> {
    try {
      const response = await ownerGet('/owner/dashboard/overview');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch platform overview');
    }
  }
}

export const ownerDashboardService = new OwnerDashboardService();
