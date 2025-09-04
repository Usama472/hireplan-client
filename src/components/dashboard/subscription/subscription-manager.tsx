"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { CreditCard, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PLANS } from "@/constants/form-constants";
import { PlanCard } from "../profile/plan-card";
import simpleSubscriptionAPI from "@/http/subscription/simple-api";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

interface SubscriptionManagerProps {
  userId: string;
}

export function SubscriptionManager({}: SubscriptionManagerProps) {
  const {
    subscription: contextSubscription,
    subscriptionLoading,
    refreshSubscription,
  } = useAuthSessionContext();
  const [error] = useState<string | null>(null);

  // Use subscription from context
  const subscription = contextSubscription;
  const isLoading = subscriptionLoading;

  const fetchSubscription = async () => {
    if (refreshSubscription) {
      await refreshSubscription();
    }
  };

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!subscription) return;

    if (
      window.confirm(
        "Are you sure you want to cancel your subscription? It will remain active until the end of your billing period."
      )
    ) {
      try {
        setActionLoading("cancel");
        await simpleSubscriptionAPI.cancel(true);
        toast.success(
          "Subscription will be canceled at the end of your billing period"
        );
        await fetchSubscription();
      } catch (error) {
        toast.error("Failed to cancel subscription");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;

    try {
      setActionLoading("reactivate");
      await simpleSubscriptionAPI.reactivate();
      toast.success("Subscription reactivated successfully");
      await fetchSubscription();
    } catch (error) {
      toast.error("Failed to reactivate subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgrade = async (planId: string) => {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      toast.error("Plan not found");
      return;
    }

    try {
      setActionLoading("checkout");
      
      // Navigate to custom checkout page
      window.location.href = `/checkout?plan=${planId}`;
    } catch (error: any) {
      toast.error(
        `Failed to navigate to checkout: ${error.message || "Unknown error"}`
      );
      setActionLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading("portal");
      const returnUrl = `${window.location.origin}/dashboard/profile?tab=settings`;

      const { url } = await simpleSubscriptionAPI.createPortal(returnUrl);

      window.open(url, "_blank");
    } catch (error: any) {
      console.error("Billing portal error:", error);
      if (error.message?.includes("configuration")) {
        toast.error(
          "Billing portal is being set up. Please contact support for billing changes."
        );
      } else {
        toast.error("Failed to open billing portal");
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load subscription information</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("🔍 Subscription Manager - subscription object:", subscription);
  console.log("🔍 Subscription Manager - isLoading:", isLoading);
  console.log("🔍 Subscription Manager - condition check:", {
    hasSubscription: !!subscription,
    hasPlanId: !!subscription?.planId,
    fullCondition: !!(subscription && subscription.planId),
  });

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscription &&
      (subscription.planId ||
        subscription.hasActiveSubscription ||
        subscription.subscriptionStatus === "canceled") ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {subscription.planName} Plan
                </h3>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <Badge
                    variant={getStatusVariant(subscription.subscriptionStatus)}
                  >
                    {subscription.subscriptionStatus}
                  </Badge>
                </p>
              </div>
              {subscription.currentPeriodEnd && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current period ends</p>
                  <p className="font-medium">
                    {format(
                      new Date(subscription.currentPeriodEnd),
                      "MMM dd, yyyy"
                    )}
                  </p>
                </div>
              )}
            </div>

            {subscription.cancelAtPeriodEnd &&
              subscription.currentPeriodEnd && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Subscription Canceling</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your subscription will end on{" "}
                    {format(
                      new Date(subscription.currentPeriodEnd),
                      "MMM dd, yyyy"
                    )}
                  </p>
                </div>
              )}

            <div className="flex gap-3">
              <Button
                onClick={handleManageBilling}
                variant="outline"
                className="flex items-center gap-2 rounded-xl h-11 px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200 bg-white border-gray-200 hover:bg-gray-50"
                disabled={actionLoading === "portal"}
              >
                <ExternalLink className="h-4 w-4" />
                {actionLoading === "portal" ? "Opening..." : "Manage Billing"}
              </Button>

              {subscription.cancelAtPeriodEnd ? (
                <Button
                  onClick={handleReactivate}
                  disabled={actionLoading === "reactivate"}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {actionLoading === "reactivate"
                    ? "Reactivating..."
                    : "Reactivate Subscription"}
                </Button>
              ) : (
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={actionLoading === "cancel"}
                  className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl h-11 px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {actionLoading === "cancel"
                    ? "Canceling..."
                    : "Cancel Subscription"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">
                No Active Subscription
              </h3>
              <p className="text-gray-600 mb-4">
                Subscribe to unlock all features and get full access to HirePlan
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Options */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLANS.map((plan) => {
              const planOrder = { starter: 1, professional: 2, enterprise: 3 };
              const currentPlanLevel =
                planOrder[subscription?.planId as keyof typeof planOrder] || 0;
              const planLevel =
                planOrder[plan.id as keyof typeof planOrder] || 0;
              const isCurrentPlan = subscription?.planId === plan.id;
              const isDowngrade = planLevel < currentPlanLevel;

              return (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSelected={isCurrentPlan}
                  onSelect={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || isDowngrade}
                  showUpgrade={!isCurrentPlan && !isDowngrade}
                  onCancel={
                    isCurrentPlan
                      ? subscription?.cancelAtPeriodEnd ||
                        subscription?.subscriptionStatus === "canceled"
                        ? handleReactivate
                        : handleCancel
                      : undefined
                  }
                  cancelLoading={
                    actionLoading === "cancel" || actionLoading === "reactivate"
                  }
                  cancelAtPeriodEnd={subscription?.cancelAtPeriodEnd || false}
                  subscriptionStatus={subscription?.subscriptionStatus}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "trialing":
      return "secondary";
    case "canceled":
    case "past_due":
      return "destructive";
    default:
      return "outline";
  }
}
