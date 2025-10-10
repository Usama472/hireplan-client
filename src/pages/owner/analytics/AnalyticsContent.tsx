import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Activity,
  Download,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { ownerDashboardService, type DashboardStats } from '@/http/owner';

const AnalyticsContent: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      fetchAnalytics();
    }
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Fetching analytics data from API...');

      const statsData = await ownerDashboardService.getDashboardStats();
      setStats(statsData);
      console.log('✅ Analytics data loaded');
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
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
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights and reporting</p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {formatPercentage(stats.growthMetrics.revenueGrowth)} from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {formatPercentage(stats.growthMetrics.usersGrowth)} user growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCompanies}</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {formatPercentage(stats.growthMetrics.companiesGrowth)} company growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCompanies > 0 ? Math.round((stats.activeSubscriptions / stats.totalCompanies) * 100) : 0}% of companies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LineChart className="w-5 h-5 mr-2" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Monthly recurring revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <LineChart className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">Revenue Chart Coming Soon</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              User Distribution
            </CardTitle>
            <CardDescription>Users across companies and plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <PieChart className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">Distribution Chart Coming Soon</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Revenue Per User</CardTitle>
            <CardDescription>ARPU calculation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(stats.totalUsers > 0 ? stats.totalRevenue / stats.totalUsers : 0)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Per user average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Growth Rate</CardTitle>
            <CardDescription>New companies this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatPercentage(stats.growthMetrics.companiesGrowth)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Period over period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Growth Rate</CardTitle>
            <CardDescription>New users this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {formatPercentage(stats.growthMetrics.usersGrowth)}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Period over period
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AnalyticsContent;
