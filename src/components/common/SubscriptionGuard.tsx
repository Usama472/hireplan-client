import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Crown,
  Lock,
  Sparkles,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

export function SubscriptionGuard({
  children,
  requiredPlan = "starter",
  fallback,
  showUpgradePrompt = true,
}: SubscriptionGuardProps) {
  const { subscription, subscriptionLoading } = useAuthSessionContext();
  const navigate = useNavigate();

  // Convert new subscription format to expected format
  const subscriptionStatus: SubscriptionStatus | null = subscription
    ? {
        hasActiveSubscription: subscription.hasActiveSubscription || false,
        subscription: subscription,
        currentPlan: subscription.planId || "none",
        verifiedWithStripe: true, // Assuming verified since it comes from our API
      }
    : null;

  const getPlanHierarchy = (plan: string): number => {
    switch (plan) {
      case "starter":
        return 1;
      case "professional":
        return 2;
      case "enterprise":
        return 3;
      default:
        return 0;
    }
  };

  const hasRequiredAccess = (): boolean => {
    if (!subscriptionStatus) return false;

    // Allow access if user has active subscription OR if subscription is just canceled but still in period
    const hasAccess =
      subscriptionStatus.hasActiveSubscription ||
      subscription?.subscriptionStatus === "active" ||
      (subscription?.cancelAtPeriodEnd &&
        subscription?.subscriptionStatus !== "canceled");

    if (!hasAccess) return false;

    const currentPlanLevel = getPlanHierarchy(
      subscriptionStatus.currentPlan || "none"
    );
    const requiredPlanLevel = getPlanHierarchy(requiredPlan);

    return currentPlanLevel >= requiredPlanLevel;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "starter":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "professional":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "enterprise":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case "professional":
        return <Crown className="h-4 w-4" />;
      case "enterprise":
        return <Sparkles className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleUpgrade = () => {
    navigate("/dashboard/profile?tab=settings");
  };

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-primary mx-auto"></div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-gray-700">
              Loading subscription...
            </p>
            <p className="text-sm text-gray-500">
              Please wait while we verify your access
            </p>
          </div>
        </div>
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

  const currentPlan = subscriptionStatus?.currentPlan || "none";
  const isUpgrade =
    subscriptionStatus?.hasActiveSubscription && currentPlan !== requiredPlan;

  return (
    <div className="min-h-screen bg-[#ececec] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border border-gray-200 bg-white shadow-none">
        <CardHeader className="text-center space-y-4 pb-6">
          {/* Enhanced Icon Container */}
          <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-none">
            <Lock className="h-8 w-8 text-white" />
          </div>

          <div className="space-y-2">
            <CardTitle className="text-xl font-bold text-gray-900">
              {isUpgrade ? "Upgrade Required" : "Subscription Required"}
            </CardTitle>

            <CardDescription className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              {isUpgrade
                ? `This feature requires a ${requiredPlan} plan or higher to access premium capabilities.`
                : "Please activate a subscription to unlock all features and start building your success."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Enhanced Current Plan Status */}
          {subscriptionStatus?.hasActiveSubscription ? (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-none">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-700">
                    Current plan
                  </span>
                  <p className="text-xs text-gray-500">
                    Your current subscription level
                  </p>
                </div>
                <Badge
                  className={`${getPlanColor(
                    currentPlan
                  )} border capitalize text-sm px-3 py-1.5 font-medium shadow-none`}
                >
                  {getPlanIcon(currentPlan)}
                  {currentPlan}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200 shadow-none">
              <div className="flex items-center gap-3 text-red-700">
                <div className="h-8 w-8 rounded-lg bg-red-200 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-semibold">
                    No active subscription
                  </span>
                  <p className="text-xs text-red-600">
                    Please choose a plan to continue
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Action Description */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-700 leading-relaxed">
              {isUpgrade
                ? `Upgrade to ${requiredPlan} plan to unlock this feature and access premium capabilities.`
                : "Choose a plan that fits your needs and start using all features immediately."}
            </p>

            {/* Enhanced Verification Status */}
            {subscriptionStatus?.verifiedWithStripe && (
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-none">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span className="text-sm font-medium">
                  Verified with Stripe
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/jobs")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>

            <Button
              variant="secondary"
              onClick={handleUpgrade}
              className="flex-1 h-10 font-medium rounded-lg transition-colors shadow-none"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isUpgrade ? "Upgrade Plan" : "Choose Plan"}
            </Button>
          </div>
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
        verifiedWithStripe: true, // Assuming verified since it comes from our API
      }
    : null;

  return { subscriptionStatus, loading: subscriptionLoading };
}
