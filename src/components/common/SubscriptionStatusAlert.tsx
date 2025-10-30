import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CreditCard,
  Clock,
  XCircle,
  RefreshCw,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import subscriptionAPI from "@/http/subscription/api";
import { toast } from "sonner";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

interface SubscriptionStatusAlertProps {
  subscription: {
    hasActiveSubscription: boolean;
    planId: string | null;
    planName: string | null;
    subscriptionStatus: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  };
  onRefresh: () => void;
}

// COMMENTED OUT - Custom pricing model (no plan-based upsells)
// Users see AI features based on company.aiEnabled toggle in admin portal
const SubscriptionStatusAlert: React.FC<SubscriptionStatusAlertProps> = ({
  subscription,
  onRefresh,
}) => {
  // Hide subscription alerts with custom pricing model
  return null;
  
  /* ORIGINAL CODE - Plan-based subscription alerts
  */
  const [isLoading, setIsLoading] = React.useState(false);

  // Don't show alert for active subscriptions
  if (
    subscription.hasActiveSubscription &&
    subscription.subscriptionStatus === "active"
  ) {
    return null;
  }

  const handleManageBilling = async () => {
    try {
      setIsLoading(true);
      const { url } = await subscriptionAPI.createCustomerPortalSession({
        returnUrl: window.location.href,
      });
      window.open(url, "_blank");
    } catch {
      toast.error("Failed to open billing portal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setIsLoading(true);
      await subscriptionAPI.reactivateMySubscription();
      toast.success("Subscription reactivated successfully");
      onRefresh();
    } catch {
      toast.error("Failed to reactivate subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertContent = () => {
    const {
      subscriptionStatus,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      planName,
    } = subscription;

    switch (subscriptionStatus) {
      case "past_due":
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          title: "Payment Past Due",
          message:
            "Your payment is past due. Please update your payment method to avoid service interruption.",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          borderColor: "border-red-200",
          bgColor: "bg-red-50",
          buttonVariant: "destructive" as const,
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
        };

      case "unpaid":
        return {
          icon: <XCircle className="h-5 w-5" />,
          title: "Payment Failed",
          message:
            "Your payment could not be processed. Please update your payment method immediately.",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          borderColor: "border-red-200",
          bgColor: "bg-red-50",
          buttonVariant: "destructive" as const,
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
        };

      case "canceled": {
        const isExpired =
          currentPeriodEnd && new Date() > new Date(currentPeriodEnd);
        return {
          icon: <XCircle className="h-5 w-5" />,
          title: isExpired ? "Subscription Expired" : "Subscription Canceled",
          message: isExpired
            ? "Your subscription has expired. Reactivate to continue using all features."
            : `Your subscription is canceled and will end on ${
                currentPeriodEnd
                  ? format(new Date(currentPeriodEnd), "MMM dd, yyyy")
                  : "the billing period end"
              }.`,
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          borderColor: "border-amber-200",
          bgColor: "bg-amber-50",
          buttonVariant: "default" as const,
          buttonClass: "bg-green-600 hover:bg-green-700 text-white",
          secondaryButtonClass:
            "border-amber-300 text-amber-700 hover:bg-amber-50",
        };
      }

      case "trialing": {
        if (cancelAtPeriodEnd) {
          return {
            icon: <Clock className="h-5 w-5" />,
            title: "Trial Ending Soon",
            message: `Your ${planName} trial will end on ${
              currentPeriodEnd
                ? format(new Date(currentPeriodEnd), "MMM dd, yyyy")
                : "soon"
            }. Add a payment method to continue.`,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            borderColor: "border-blue-200",
            bgColor: "bg-blue-50",
            buttonVariant: "default" as const,
            buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
          };
        }

        const daysLeft = currentPeriodEnd
          ? differenceInDays(new Date(currentPeriodEnd), new Date())
          : 0;

        if (daysLeft <= 7) {
          return {
            icon: <Clock className="h-5 w-5" />,
            title: "Trial Ending Soon",
            message: `Your ${planName} trial ends in ${daysLeft} day${
              daysLeft !== 1 ? "s" : ""
            }. Add a payment method to continue.`,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            borderColor: "border-blue-200",
            bgColor: "bg-blue-50",
            buttonVariant: "default" as const,
            buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
          };
        }
        return null;
      }

      case "incomplete":
      case "incomplete_expired":
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          title: "Subscription Incomplete",
          message:
            "Your subscription setup is incomplete. Please complete the payment process.",
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          borderColor: "border-red-200",
          bgColor: "bg-red-50",
          buttonVariant: "destructive" as const,
          buttonClass: "bg-red-600 hover:bg-red-700 text-white",
        };

      case "none":
        return {
          icon: <Sparkles className="h-5 w-5" />,
          title: "Upgrade to Pro",
          message:
            "Unlock unlimited job postings, advanced analytics, and priority support.",
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
          borderColor: "border-primary/200",
          bgColor: "bg-primary/5",
          buttonVariant: "default" as const,
          buttonClass: "bg-primary hover:bg-primary/90 text-white",
        };

      default:
        return null;
    }
  };

  const alertContent = getAlertContent();

  if (!alertContent) {
    return null;
  }

  return (
    <div className="mb-6">
      <div
        className={`${alertContent.bgColor} border ${alertContent.borderColor} rounded-lg p-6`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`${alertContent.iconBg} ${alertContent.iconColor} p-2.5 rounded-lg flex-shrink-0`}
          >
            {alertContent.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-semibold text-gray-900">
                {alertContent.title}
              </h3>
              <Badge
                variant="secondary"
                className="text-xs font-medium px-2 py-1 rounded-md bg-white/80 border border-gray-200 text-gray-600"
              >
                {subscription.subscriptionStatus.replace("_", " ")}
              </Badge>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {alertContent.message}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {alertContent.buttonVariant === "destructive" ? (
                <Button
                  onClick={handleManageBilling}
                  size="sm"
                  disabled={isLoading}
                  className={`${alertContent.buttonClass} px-4 py-2 rounded-md font-medium transition-colors duration-200`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment
                </Button>
              ) : subscription.subscriptionStatus === "canceled" ? (
                <>
                  <Button
                    onClick={handleReactivate}
                    size="sm"
                    disabled={isLoading}
                    className={`${alertContent.buttonClass} px-4 py-2 rounded-md font-medium transition-colors duration-200`}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reactivate
                  </Button>
                  <Button
                    onClick={handleManageBilling}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className={`${alertContent.secondaryButtonClass} px-4 py-2 rounded-md font-medium transition-colors duration-200`}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Billing Portal
                  </Button>
                </>
              ) : subscription.subscriptionStatus === "none" ? (
                <Button
                  onClick={() =>
                    (window.location.href = "/dashboard/profile?tab=settings")
                  }
                  size="sm"
                  disabled={isLoading}
                  variant="secondary"
                  className=" py-5"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  View Plans
                </Button>
              ) : (
                <Button
                  onClick={handleManageBilling}
                  size="sm"
                  disabled={isLoading}
                  className={`${alertContent.buttonClass} px-4 py-2 rounded-md font-medium transition-colors duration-200`}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              )}

              {/* Refresh Button */}
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-md transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component that gets subscription from context
const SubscriptionStatusAlertWrapper: React.FC = () => {
  const { subscription, refreshSubscription } = useAuthSessionContext();

  if (!subscription) {
    return null;
  }

  return (
    <SubscriptionStatusAlert
      subscription={subscription}
      onRefresh={refreshSubscription || (() => {})}
    />
  );
};

export { SubscriptionStatusAlert };
export default SubscriptionStatusAlertWrapper;
