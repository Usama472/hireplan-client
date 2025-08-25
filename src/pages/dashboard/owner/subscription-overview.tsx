import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  createdAt: string;
}

export function SubscriptionOverview() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockSubscriptions: Subscription[] = [
        {
          id: '1',
          userId: 'user1',
          userName: 'John Doe',
          userEmail: 'john.doe@example.com',
          planId: 'professional',
          planName: 'Professional',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          amount: 79,
          currency: 'USD',
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_123',
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          userId: 'user2',
          userName: 'Jane Smith',
          userEmail: 'jane.smith@example.com',
          planId: 'starter',
          planName: 'Starter',
          status: 'active',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          amount: 29,
          currency: 'USD',
          stripeCustomerId: 'cus_456',
          stripeSubscriptionId: 'sub_456',
          createdAt: '2024-01-02',
        },
        {
          id: '3',
          userId: 'user3',
          userName: 'Bob Johnson',
          userEmail: 'bob.johnson@example.com',
          planId: 'professional',
          planName: 'Professional',
          status: 'past_due',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: false,
          amount: 79,
          currency: 'USD',
          stripeCustomerId: 'cus_789',
          stripeSubscriptionId: 'sub_789',
          createdAt: '2024-01-03',
        },
        {
          id: '4',
          userId: 'user4',
          userName: 'Alice Brown',
          userEmail: 'alice.brown@example.com',
          planId: 'professional',
          planName: 'Professional',
          status: 'canceled',
          currentPeriodStart: '2024-01-01',
          currentPeriodEnd: '2024-02-01',
          cancelAtPeriodEnd: true,
          amount: 79,
          currency: 'USD',
          stripeCustomerId: 'cus_101',
          stripeSubscriptionId: 'sub_101',
          createdAt: '2024-01-04',
        },
      ];
      setSubscriptions(mockSubscriptions);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesPlan = planFilter === 'all' || subscription.planId === planFilter;
    return matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="secondary">Canceled</Badge>;
      case 'incomplete':
        return <Badge variant="outline">Incomplete</Badge>;
      case 'trialing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Trialing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (planId: string) => {
    switch (planId) {
      case 'professional':
        return <Badge variant="default">Professional</Badge>;
      case 'starter':
        return <Badge variant="secondary">Starter</Badge>;
      case 'enterprise':
        return <Badge variant="outline">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{planId}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleSubscriptionAction = (action: string, subscriptionId: string) => {
    console.log(`${action} subscription ${subscriptionId}`);
    // Implement actual subscription actions
  };

  const exportSubscriptions = () => {
    // Implement CSV export
    console.log('Exporting subscriptions...');
  };

  const getTotalRevenue = () => {
    return subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((total, sub) => total + sub.amount, 0);
  };

  const getActiveSubscriptions = () => {
    return subscriptions.filter(sub => sub.status === 'active').length;
  };

  const getPastDueSubscriptions = () => {
    return subscriptions.filter(sub => sub.status === 'past_due').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Overview</h2>
          <p className="text-gray-600 mt-1">
            Monitor and manage all subscription plans and billing
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={exportSubscriptions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveSubscriptions()}</div>
            <p className="text-xs text-muted-foreground">
              Currently active plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalRevenue()}</div>
            <p className="text-xs text-muted-foreground">
              From active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPastDueSubscriptions()}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter subscriptions by status and plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Results</label>
              <div className="text-sm text-gray-600 pt-2">
                {filteredSubscriptions.length} of {subscriptions.length} subscriptions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>
            A list of all subscriptions in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading subscriptions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                <div>User</div>
                <div>Plan</div>
                <div>Status</div>
                <div>Amount</div>
                <div>Period</div>
                <div>Created</div>
                <div className="text-right">Actions</div>
              </div>
              
              {/* Rows */}
              {filteredSubscriptions.map((subscription) => (
                <div key={subscription.id} className="grid grid-cols-7 gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{subscription.userName}</div>
                    <div className="text-sm text-gray-500">{subscription.userEmail}</div>
                  </div>
                  <div className="flex items-center">{getPlanBadge(subscription.planId)}</div>
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(subscription.status)}
                      {getStatusBadge(subscription.status)}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="font-medium">
                      ${subscription.amount}/{subscription.currency}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm">
                      <div>{subscription.currentPeriodStart}</div>
                      <div className="text-gray-500">to {subscription.currentPeriodEnd}</div>
                    </div>
                  </div>
                  <div className="flex items-center">{subscription.createdAt}</div>
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleSubscriptionAction('view', subscription.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSubscriptionAction('edit', subscription.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Subscription
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {subscription.status === 'active' && (
                          <DropdownMenuItem 
                            onClick={() => handleSubscriptionAction('cancel', subscription.id)}
                            className="text-orange-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Subscription
                          </DropdownMenuItem>
                        )}
                        {subscription.status === 'canceled' && (
                          <DropdownMenuItem 
                            onClick={() => handleSubscriptionAction('reactivate', subscription.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleSubscriptionAction('delete', subscription.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
