  import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Building2, DollarSign, Calendar, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { ownerSubscriptionService, type OwnerSubscription, type SubscriptionAnalytics } from '@/http/owner';

const SubscriptionsContentNew: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<OwnerSubscription[]>([]);
  const [analytics, setAnalytics] = useState<SubscriptionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching subscriptions data...');
      const subsData = await ownerSubscriptionService.getAllSubscriptions();
      console.log('Subscriptions received:', subsData);
      setSubscriptions(subsData || []);
      
      // Calculate analytics from subscription data
      const totalRevenue = subsData.reduce((sum, s) => {
        const price = s.metadata?.price || s.metadata?.customMonthlyPrice || (s as any).amount || 0;
        const amount = price > 1000 ? price / 100 : price; // Handle cents vs dollars
        return sum + (amount * s.quantity);
      }, 0);
      
      const analyticsData: SubscriptionAnalytics = {
        totalSubscriptions: subsData.length,
        activeSubscriptions: subsData.filter(s => s.status === 'active').length,
        canceledSubscriptions: subsData.filter(s => s.status === 'canceled').length,
        pastDueSubscriptions: subsData.filter(s => s.status === 'past_due').length,
        monthlyRecurringRevenue: totalRevenue,
        churnRate: 0,
        growthRate: 0,
      };
      console.log('Analytics calculated:', analyticsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setSubscriptions([]);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  console.log('Rendering with subscriptions:', subscriptions.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Subscriptions
          </h1>
          <p className="text-slate-600 mt-1">Manage platform subscriptions and billing</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
          {subscriptions.length} Total
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Monthly Revenue</p>
                <p className="text-3xl font-bold mt-2">${(analytics?.monthlyRecurringRevenue || 0).toFixed(2)}</p>
                <p className="text-white/70 text-xs mt-1">Recurring</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Active</p>
                <p className="text-3xl font-bold mt-2">{analytics?.activeSubscriptions || 0}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total</p>
                <p className="text-3xl font-bold mt-2">{subscriptions.length}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {subscriptions.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="py-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No subscriptions found</p>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((sub) => (
            <Card key={sub.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {sub.company?.companyName || 'Unknown Company'}
                        </h3>
                        <Badge className={`${
                          sub.status === 'active' ? 'bg-green-100 text-green-800' : 
                          sub.status === 'trialing' ? 'bg-blue-100 text-blue-800' :
                          sub.status === 'canceled' ? 'bg-red-100 text-red-800' :
                          sub.status === 'past_due' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        } border-0 text-xs`}>
                          {sub.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {sub.userId?.firstName} {sub.userId?.lastName} • {sub.userId?.email}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-purple-50 rounded-lg p-3">
                          <p className="text-xs text-purple-700 font-medium mb-1">Plan</p>
                          <p className="font-semibold text-purple-900 capitalize">
                            {sub.planName || sub.planId}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-green-700 font-medium mb-1">Amount</p>
                          <p className="font-semibold text-green-900">
                            {(() => {
                              // Try multiple sources for price
                              const price = sub.metadata?.price || sub.metadata?.customMonthlyPrice || (sub as any).amount;
                              if (price) {
                                // If price is in cents (> 1000), divide by 100
                                const amount = price > 1000 ? price / 100 : price;
                                return `$${amount.toFixed(2)}/mo`;
                              }
                              return 'N/A';
                            })()}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs text-blue-700 font-medium mb-1">Quantity</p>
                          <p className="font-semibold text-blue-900">
                            {sub.quantity || 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-left">
                      <p className="text-xs text-gray-500 mb-1">Next Billing</p>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" /> 
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    {sub.cancelAtPeriodEnd && (
                      <Badge className="bg-amber-100 text-amber-800 border-0 text-xs">
                        Cancels at period end
                      </Badge>
                    )}
                    {sub.trialEnd && new Date(sub.trialEnd) > new Date() && (
                      <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">
                        Trial until {new Date(sub.trialEnd).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SubscriptionsContentNew;

