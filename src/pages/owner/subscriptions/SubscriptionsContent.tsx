import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  Search,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye,
  Settings
} from 'lucide-react';
import { ownerSubscriptionService, type OwnerSubscription, type SubscriptionAnalytics, type RevenueData } from '@/http/owner';

const SubscriptionsContent: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<OwnerSubscription[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Fetching subscription data from API...');

      const [subscriptionsData, analyticsData, revenueData] = await Promise.all([
        ownerSubscriptionService.getAllSubscriptions(),
        ownerSubscriptionService.getSubscriptionAnalytics(),
        ownerSubscriptionService.getRevenueData()
      ]);

      setSubscriptions(subscriptionsData);
      setAnalytics(analyticsData);
      setRevenue(revenueData);
      console.log('✅ Subscription data loaded:', { subscriptions: subscriptionsData.length });
    } catch (error) {
      console.error('❌ Error fetching subscription data:', error);
      setSubscriptions([]);
      setAnalytics({
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        canceledSubscriptions: 0,
        pastDueSubscriptions: 0,
        monthlyRecurringRevenue: 0,
        churnRate: 0,
        growthRate: 0
      });
      setRevenue({
        period: '30d',
        totalRevenue: 0,
        subscriptionRevenue: 0,
        oneTimeCharges: 0,
        refunds: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const companyName = subscription.company?.companyName || `${subscription.userId.firstName} ${subscription.userId.lastName}`;
    const matchesSearch = companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.userId.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesPlan = planFilter === 'all' || subscription.planId === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      case 'incomplete':
        return <Badge className="bg-gray-100 text-gray-800">Incomplete</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Badge variant="outline">Starter</Badge>;
      case 'professional':
        return <Badge className="bg-blue-100 text-blue-800">Professional</Badge>;
      case 'enterprise':
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>;
      default:
        return <Badge variant="secondary">{planName}</Badge>;
    }
  };

  const calculateRevenue = () => {
    return revenue?.totalRevenue || 0;
  };

  const getUpcomingRenewals = () => {
    return analytics?.activeSubscriptions || 0;
  };

  const handleRetryPayment = async (subscriptionId: string) => {
    try {
      await ownerSubscriptionService.retryPayment(subscriptionId);
      await fetchData();
    } catch (error) {
      console.error('Error retrying payment:', error);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
        <p className="text-gray-600">Monitor and manage all subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateRevenue().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.activeSubscriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.totalSubscriptions ? Math.round((analytics.activeSubscriptions / analytics.totalSubscriptions) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.pastDueSubscriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUpcomingRenewals()}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            {filteredSubscriptions.length} of {subscriptions.length} subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No subscriptions found</p>
              <p className="text-sm">Subscriptions will appear here when users subscribe</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Current Period</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {subscription.company?.companyName || `${subscription.userId.firstName} ${subscription.userId.lastName}`}
                        </div>
                        <div className="text-sm text-gray-500">{subscription.userId.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(subscription.planName)}</TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${subscription.metadata?.amount || '0'}/month
                      </div>
                    </TableCell>
                    <TableCell>{subscription.quantity || 1}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                        {subscription.status === 'past_due' && (
                          <Button
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700"
                            onClick={() => handleRetryPayment(subscription.id)}
                          >
                            Retry Payment
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Revenue Chart Placeholder */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Revenue Trends
          </CardTitle>
          <CardDescription>Monthly recurring revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Revenue Visualization Coming Soon</p>
              <p className="text-sm">Integration with charting library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SubscriptionsContent;
