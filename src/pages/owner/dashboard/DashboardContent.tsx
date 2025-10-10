import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  Users
} from 'lucide-react';
import { ownerDashboardService, type DashboardStats, type RecentActivity, type SystemHealth } from '@/http/owner';

const DashboardContent: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Fetching dashboard data from API...');

      // Try to fetch real data from API
      try {
        const [statsData, activityData, healthData] = await Promise.all([
          ownerDashboardService.getDashboardStats(),
          ownerDashboardService.getRecentActivity(5),
          ownerDashboardService.getSystemHealth()
        ]);

        setStats(statsData);
        setRecentActivity(activityData);
        setSystemHealth(healthData);
        console.log('✅ Dashboard data loaded from API');
      } catch (apiError) {
        console.error('⚠️ API error:', apiError);
        throw apiError; // Re-throw to show empty state
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      // Set empty data on error
      setStats({
        totalCompanies: 0,
        activeCompanies: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        suspendedAccounts: 0,
        totalUsers: 0,
        growthMetrics: {
          companiesGrowth: 0,
          usersGrowth: 0,
          revenueGrowth: 0
        }
      });
      setRecentActivity([]);
      setSystemHealth({
        apiResponseTime: 0,
        databasePerformance: 'Unknown',
        serverUptime: '0%',
        activeUsers: 0,
        status: 'down'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Platform overview and metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalCompanies || 0}</div>
            <p className="text-xs text-green-600 font-medium mt-1">
              +{stats?.growthMetrics.companiesGrowth.toFixed(1) || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.activeSubscriptions || 0}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {stats?.totalCompanies ? Math.round((stats.activeSubscriptions / stats.totalCompanies) * 100) : 0}% subscription rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">${stats?.totalRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-green-600 font-medium mt-1">
              +{stats?.growthMetrics.revenueGrowth.toFixed(1) || 0}% growth
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Suspended</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.suspendedAccounts || 0}</div>
            <p className="text-xs text-red-600 font-medium mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const colorClass = activity.type === 'company_registered' ? 'bg-green-500' :
                                 activity.type === 'subscription_upgraded' ? 'bg-blue-500' : 'bg-yellow-500';
                return (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 ${colorClass} rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle className="text-lg font-semibold">System Health</CardTitle>
            <CardDescription>Platform status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response Time</span>
                <span className="text-green-600 font-medium">{systemHealth?.apiResponseTime || 0}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Performance</span>
                <span className="text-green-600 font-medium">{systemHealth?.databasePerformance || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Uptime</span>
                <span className="text-green-600 font-medium">{systemHealth?.serverUptime || '0%'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Users</span>
                <span className="text-blue-600 font-medium">{systemHealth?.activeUsers?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardContent;
