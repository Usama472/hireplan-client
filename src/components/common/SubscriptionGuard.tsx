import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Crown, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import subscriptionAPI from '@/http/subscription/api';
import useAuthSessionContext from '@/lib/context/AuthSessionContext';
import { toast } from 'sonner';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: 'starter' | 'professional' | 'enterprise';
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: any;
  currentPlan?: string;
  verifiedWithStripe?: boolean;
}

export function SubscriptionGuard({ 
  children, 
  requiredPlan = 'starter',
  fallback,
  showUpgradePrompt = true 
}: SubscriptionGuardProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: authSession } = useAuthSessionContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!authSession?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await subscriptionAPI.getVerifiedSubscriptionStatus();
        setSubscriptionStatus({
          hasActiveSubscription: response.hasActiveSubscription,
          subscription: response,
          currentPlan: response.planId || 'none',
          verifiedWithStripe: response.verifiedWithStripe
        });
      } catch (error) {
        console.error('Error checking verified subscription:', error);
        setSubscriptionStatus({
          hasActiveSubscription: false,
          subscription: null,
          currentPlan: 'none',
          verifiedWithStripe: false
        });
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [authSession]);

  const getPlanHierarchy = (plan: string): number => {
    switch (plan) {
      case 'starter': return 1;
      case 'professional': return 2;
      case 'enterprise': return 3;
      default: return 0;
    }
  };

  const hasRequiredAccess = (): boolean => {
    if (!subscriptionStatus) return false;
    if (!subscriptionStatus.hasActiveSubscription) return false;
    
    const currentPlanLevel = getPlanHierarchy(subscriptionStatus.currentPlan || 'none');
    const requiredPlanLevel = getPlanHierarchy(requiredPlan);
    
    return currentPlanLevel >= requiredPlanLevel;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'professional': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'enterprise': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'professional': return <Crown className="h-4 w-4" />;
      case 'enterprise': return <Sparkles className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleUpgrade = () => {
    navigate('/dashboard/profile?tab=settings');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user has required access, show the protected content
  if (hasRequiredAccess()) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use that
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default subscription required prompt
  if (!showUpgradePrompt) {
    return null;
  }

  const currentPlan = subscriptionStatus?.currentPlan || 'none';
  const isUpgrade = subscriptionStatus?.hasActiveSubscription && currentPlan !== requiredPlan;

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full text-center shadow-lg border-orange-200">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isUpgrade ? 'Upgrade Required' : 'Subscription Required'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isUpgrade 
              ? `This feature requires a ${requiredPlan} plan or higher.`
              : 'Please activate a subscription to access this feature.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {subscriptionStatus?.hasActiveSubscription ? (
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Current plan:</span>
              <Badge className={`${getPlanColor(currentPlan)} border capitalize`}>
                {getPlanIcon(currentPlan)}
                {currentPlan}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mb-4 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">No active subscription</span>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {isUpgrade 
                ? `Upgrade to ${requiredPlan} plan to unlock this feature and more.`
                : 'Choose a plan that fits your needs and start using all features.'
              }
            </p>
            {subscriptionStatus?.verifiedWithStripe && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Verified with Stripe
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/jobs')}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button 
              onClick={handleUpgrade}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isUpgrade ? 'Upgrade Plan' : 'Choose Plan'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to check verified subscription status
export function useSubscriptionStatus() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: authSession } = useAuthSessionContext();

  useEffect(() => {
    const checkSubscription = async () => {
      if (!authSession?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await subscriptionAPI.getVerifiedSubscriptionStatus();
        setSubscriptionStatus({
          hasActiveSubscription: response.hasActiveSubscription,
          subscription: response,
          currentPlan: response.planId || 'none',
          verifiedWithStripe: response.verifiedWithStripe
        });
      } catch (error) {
        console.error('Error checking verified subscription:', error);
        setSubscriptionStatus({
          hasActiveSubscription: false,
          subscription: null,
          currentPlan: 'none',
          verifiedWithStripe: false
        });
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [authSession]);

  return { subscriptionStatus, loading };
}
