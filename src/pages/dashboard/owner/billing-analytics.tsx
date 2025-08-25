import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  CreditCard,
  Download,
  Calendar,
  BarChart3
} from 'lucide-react';

export function BillingAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API call
  const mockData = {
    revenue: {
      current: 45231,
      previous: 37654,
      change: '+20.1%',
      trend: 'up'
    },
    subscriptions: {
      current: 892,
      previous: 823,
      change: '+8.4%',
      trend: 'up'
    },
    churn: {
      current: 2.3,
      previous: 3.1,
      change: '-25.8%',
      trend: 'down'
    },
    mrr: {
      current: 45231,
      previous: 37654,
      change: '+20.1%',
      trend: 'up'
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing Analytics</h2>
          <p className="text-gray-600 mt-1">
            Monitor revenue, subscriptions, and business metrics
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
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
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.revenue.current)}</div>
            <div className={`flex items-center text-xs ${getTrendColor(mockData.revenue.trend)}`}>
              {getTrendIcon(mockData.revenue.trend)}
              <span className="ml-1">{mockData.revenue.change}</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(mockData.subscriptions.current)}</div>
            <div className={`flex items-center text-xs ${getTrendColor(mockData.subscriptions.trend)}`}>
              {getTrendIcon(mockData.subscriptions.trend)}
              <span className="ml-1">{mockData.subscriptions.change}</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(mockData.churn.current)}</div>
            <div className={`flex items-center text-xs ${getTrendColor(mockData.churn.trend)}`}>
              {getTrendIcon(mockData.churn.trend)}
              <span className="ml-1">{mockData.churn.change}</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockData.mrr.current)}</div>
            <div className={`flex items-center text-xs ${getTrendColor(mockData.mrr.trend)}`}>
              {getTrendIcon(mockData.mrr.trend)}
              <span className="ml-1">{mockData.mrr.change}</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>
            Monthly recurring revenue over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart will be displayed here</p>
              <p className="text-sm text-gray-400">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>
              Current subscription plan breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Professional</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">65%</div>
                  <div className="text-xs text-gray-500">580 subscriptions</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium">Starter</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">30%</div>
                  <div className="text-xs text-gray-500">268 subscriptions</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">Enterprise</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">5%</div>
                  <div className="text-xs text-gray-500">44 subscriptions</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>
              Current subscription health overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Active</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">85%</div>
                  <div className="text-xs text-gray-500">758 subscriptions</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium">Past Due</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">8%</div>
                  <div className="text-xs text-gray-500">71 subscriptions</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Canceled</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">7%</div>
                  <div className="text-xs text-gray-500">63 subscriptions</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Billing Activity</CardTitle>
          <CardDescription>
            Latest subscription changes and payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {i === 1 && 'Subscription renewed'}
                    {i === 2 && 'New subscription created'}
                    {i === 3 && 'Payment failed'}
                    {i === 4 && 'Plan upgraded'}
                    {i === 5 && 'Subscription canceled'}
                  </p>
                  <p className="text-xs text-gray-500">
                    user{i}@example.com • {i === 1 ? 'Professional Plan' : 'Starter Plan'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {i === 1 ? '+$79' : i === 2 ? '+$29' : i === 3 ? 'Failed' : i === 4 ? '+$50' : '-$29'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {i === 1 ? '2 hours ago' : i === 2 ? '4 hours ago' : i === 3 ? '6 hours ago' : i === 4 ? '1 day ago' : '2 days ago'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
