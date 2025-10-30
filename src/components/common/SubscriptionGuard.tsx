import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowLeft } from "lucide-react";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: "starter" | "professional" | "enterprise";
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: any;
  currentPlan?: string;
  verifiedWithStripe?: boolean;
}

/**
 * SubscriptionGuard - Plan-Based Features with Custom Pricing
 * 
 * Plans determine feature access (Starter/Professional/Enterprise)
 * Pricing is custom per company (set by owner)
 */
export function SubscriptionGuard({
  children,
  requiredPlan = "starter",
  fallback,
  showUpgradePrompt = true,
}: SubscriptionGuardProps) {
  const { subscription, subscriptionLoading } = useAuthSessionContext();

  const getPlanLevel = (plan: string): number => {
    const levels: Record<string, number> = { starter: 1, professional: 2, enterprise: 3 };
    return levels[plan] || 0;
  };

  const hasAccess = () => {
    if (!subscription) return false;
    const userPlanLevel = getPlanLevel(subscription.planId || '');
    const requiredLevel = getPlanLevel(requiredPlan);
    return userPlanLevel >= requiredLevel;
  };

  if (subscriptionLoading) {
    return <div className="flex items-center justify-center p-8"><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>;
  }

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const currentPlan = subscription?.planId || 'none';

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="border-2 border-yellow-200">
        <CardContent className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-yellow-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
          </h3>
          
          <p className="text-gray-600 mb-4">
            This feature requires a {requiredPlan} plan or higher.
            {currentPlan !== 'none' && (
              <span className="block mt-1">You're currently on the <strong>{currentPlan}</strong> plan.</span>
            )}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 font-semibold mb-2">Want to upgrade?</p>
            <p className="text-xs text-blue-800">
              Contact your organization administrator or reach out to us:
            </p>
            <a 
              href="mailto:support@hireplan.co" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
            >
              support@hireplan.co
            </a>
          </div>

          <Button 
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to check verified subscription status
export function useSubscriptionStatus() {
  const { subscription, subscriptionLoading } = useAuthSessionContext();

  // Convert new subscription format to expected format
  const subscriptionStatus: SubscriptionStatus | null = subscription
    ? {
        hasActiveSubscription: subscription.hasActiveSubscription || false,
        subscription: subscription,
        currentPlan: subscription.planId || "none",
        verifiedWithStripe: true,
      }
    : null;

  return { subscriptionStatus, loading: subscriptionLoading };
}
