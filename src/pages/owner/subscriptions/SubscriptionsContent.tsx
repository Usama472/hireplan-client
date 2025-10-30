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
  Settings,
  Plus,
  Building2
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ownerSubscriptionService, type OwnerSubscription, type SubscriptionAnalytics, type RevenueData } from '@/http/owner';
import { ownerManagementService } from '@/http/owner';
import { toast } from 'sonner';

const SubscriptionsContent: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<OwnerSubscription[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  
  // Create subscription dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [trialDays, setTrialDays] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  
  // Manage subscription dialog state
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<OwnerSubscription | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const companiesData = await ownerManagementService.getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const handleCreateSubscription = async () => {
    if (!selectedCompanyId || !selectedPlan) {
      toast.error('Please select a company and plan');
      return;
    }

    setIsCreating(true);
    try {
      await ownerSubscriptionService.createManualSubscription({
        companyId: selectedCompanyId,
        planId: selectedPlan,
        trialDays: trialDays || undefined,
      });

      toast.success('Subscription created successfully!');
      setShowCreateDialog(false);
      setSelectedCompanyId('');
      setSelectedPlan('professional');
      setTrialDays(0);
      
      // Reload subscriptions
      await fetchData();
    } catch (error: any) {
      console.error('Failed to create subscription:', error);
      toast.error(error.message || 'Failed to create subscription');
    } finally {
      setIsCreating(false);
    }
  };

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>
                {filteredSubscriptions.length} of {subscriptions.length} subscriptions
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Subscription
            </Button>
          </div>
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
                    <TableCell>
                      {subscription.planId === 'custom' ? (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          Custom Pricing
                        </Badge>
                      ) : (
                        getPlanBadge(subscription.planName)
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        ${subscription.metadata?.customPrice || subscription.metadata?.amount || (subscription.company as any)?.customMonthlyPrice || '0'}/month
                      </div>
                      {subscription.planId === 'custom' && (
                        <div className="text-xs text-gray-500">Custom rate</div>
                      )}
                    </TableCell>
                    <TableCell>{subscription.quantity || 1}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setShowViewDialog(true);
                          }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setShowManageDialog(true);
                          }}
                          title="Manage Subscription"
                        >
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

      {/* Create Subscription Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Create Subscription for Company
            </DialogTitle>
            <DialogDescription>
              Manually create a subscription for a company. Payment will be collected via Stripe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Select Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Select Company *</Label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span>{company.companyName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {companies.length === 0 && (
                <p className="text-xs text-gray-500">No companies available</p>
              )}
            </div>

            {/* Select Plan */}
            <div className="space-y-2">
              <Label htmlFor="plan">Subscription Plan *</Label>
              <Select value={selectedPlan} onValueChange={(value: any) => setSelectedPlan(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Starter - $49/month</span>
                      <span className="text-xs text-gray-500">Basic features</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="professional">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Professional - $149/month</span>
                      <span className="text-xs text-gray-500">Advanced AI features</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="enterprise">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Enterprise - $299/month</span>
                      <span className="text-xs text-gray-500">Full platform access</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trial Days */}
            <div className="space-y-2">
              <Label htmlFor="trial">Trial Period (Optional)</Label>
              <Input
                id="trial"
                type="number"
                min="0"
                max="90"
                value={trialDays}
                onChange={(e) => setTrialDays(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">
                Number of days for free trial (0 for no trial)
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Payment Info</p>
                  <ul className="space-y-1">
                    <li>• Subscription will be created in Stripe</li>
                    <li>• Company needs to add payment method to activate</li>
                    <li>• They'll receive an email with payment link if no card on file</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSubscription}
              disabled={isCreating || !selectedCompanyId}
            >
              {isCreating ? 'Creating...' : 'Create Subscription'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Subscription Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500 text-xs">Company</Label>
                  <p className="font-medium">
                    {selectedSubscription.company?.companyName || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Plan Type</Label>
                  {selectedSubscription.planId === 'custom' ? (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      Custom Pricing
                    </Badge>
                  ) : (
                    <p className="font-medium">{selectedSubscription.planName}</p>
                  )}
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Status</Label>
                  <div>{getStatusBadge(selectedSubscription.status)}</div>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Monthly Amount</Label>
                  <p className="font-medium text-lg">
                    ${selectedSubscription.metadata?.customPrice || selectedSubscription.metadata?.amount || '0'}
                    <span className="text-sm text-gray-500">/month</span>
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Current Period</Label>
                  <p className="text-sm">
                    {new Date(selectedSubscription.currentPeriodStart).toLocaleDateString()} 
                  </p>
                  <p className="text-xs text-gray-500">Started</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-xs">Next Billing</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedSubscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-500 text-xs">Stripe Subscription ID</Label>
                  <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded border">
                    {selectedSubscription.stripeSubscriptionId}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Subscription Dialog */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              {selectedSubscription?.company?.companyName} - {selectedSubscription?.planName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                {selectedSubscription.status === 'active' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={async () => {
                        try {
                          await ownerSubscriptionService.suspendSubscription(selectedSubscription.id);
                          toast.success('Subscription suspended');
                          setShowManageDialog(false);
                          fetchData();
                        } catch (error) {
                          toast.error('Failed to suspend subscription');
                        }
                      }}
                    >
                      Suspend Subscription
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={async () => {
                        if (confirm('Cancel this subscription?')) {
                          try {
                            await ownerSubscriptionService.cancelSubscription(selectedSubscription.id);
                            toast.success('Subscription canceled');
                            setShowManageDialog(false);
                            fetchData();
                          } catch (error) {
                            toast.error('Failed to cancel subscription');
                          }
                        }
                      }}
                    >
                      Cancel Subscription
                    </Button>
                  </>
                )}
                
                {selectedSubscription.status === 'canceled' && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={async () => {
                      try {
                        await ownerSubscriptionService.reactivateSubscription(selectedSubscription.id);
                        toast.success('Subscription reactivated');
                        setShowManageDialog(false);
                        fetchData();
                      } catch (error) {
                        toast.error('Failed to reactivate subscription');
                      }
                    }}
                  >
                    Reactivate Subscription
                  </Button>
                )}

                {selectedSubscription.status === 'past_due' && (
                  <Button 
                    className="w-full"
                    onClick={async () => {
                      try {
                        await ownerSubscriptionService.retryPayment(selectedSubscription.id);
                        toast.success('Payment retry initiated');
                        setShowManageDialog(false);
                        fetchData();
                      } catch (error) {
                        toast.error('Failed to retry payment');
                      }
                    }}
                  >
                    Retry Payment
                  </Button>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                <p><strong>Stripe Customer ID:</strong> {selectedSubscription.stripeCustomerId}</p>
                <p><strong>Subscription ID:</strong> {selectedSubscription.stripeSubscriptionId}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManageDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionsContent;
