import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  CreditCard,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  Activity,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Loader2
} from 'lucide-react';
import { ownerDashboardService, type DashboardStats, type RecentActivity, type SystemHealth } from '@/http/owner';

const DashboardContentNew: React.FC = () => {
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
      const [statsData, activityData, healthData] = await Promise.all([
        ownerDashboardService.getDashboardStats(),
        ownerDashboardService.getRecentActivity(10),
        ownerDashboardService.getSystemHealth()
      ]);

      setStats(statsData);
      setRecentActivity(activityData);
      setSystemHealth(healthData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-600 mt-2">Platform overview and performance metrics</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Companies */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
              {stats && stats.growthMetrics?.companiesGrowth > 0 && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                  <ArrowUp className="w-3 h-3" />
                  <span className="text-xs font-semibold">{stats.growthMetrics.companiesGrowth.toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Total Companies</p>
              <p className="text-4xl font-bold mt-1">{stats?.totalCompanies || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              {stats && stats.growthMetrics?.usersGrowth > 0 && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                  <ArrowUp className="w-3 h-3" />
                  <span className="text-xs font-semibold">{stats.growthMetrics.usersGrowth.toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Total Users</p>
              <p className="text-4xl font-bold mt-1">{stats?.totalUsers || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Paid Subscriptions</p>
              <p className="text-4xl font-bold mt-1">{stats?.activeSubscriptions || 0}</p>
              <p className="text-white/70 text-xs mt-1">
                {stats?.totalCompanies ? Math.round((stats.activeSubscriptions / stats.totalCompanies) * 100) : 0}% of companies
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              {stats && stats.growthMetrics?.revenueGrowth > 0 && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded-full">
                  <ArrowUp className="w-3 h-3" />
                  <span className="text-xs font-semibold">{stats.growthMetrics.revenueGrowth.toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Monthly Revenue</p>
              <p className="text-4xl font-bold mt-1">${((stats as any)?.monthlyRevenue || 0).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Jobs Posted</p>
                <p className="text-2xl font-bold text-gray-900">{(stats as any)?.totalJobs || 0}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Across all companies
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Applicants</p>
                <p className="text-2xl font-bold text-gray-900">{(stats as any)?.totalApplicants || 0}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Platform-wide applications
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-green-600 capitalize">
                  {systemHealth?.status || 'Healthy'}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              All systems operational
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-600">Latest platform events</p>
            </div>
          </div>

          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'company_created' ? 'bg-blue-500' :
                      activity.type === 'user_created' ? 'bg-purple-500' :
                      activity.type === 'subscription_created' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {(activity as any).metadata?.companyName && (
                    <div className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border">
                      {(activity as any).metadata.companyName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardContentNew;

