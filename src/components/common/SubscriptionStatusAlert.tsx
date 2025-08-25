import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CreditCard, 
  Clock, 
  XCircle, 
  RefreshCw,
  ExternalLink 
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import subscriptionAPI from '@/http/subscription/api';
import { toast } from 'sonner';
import useAuthSessionContext from '@/lib/context/AuthSessionContext';

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

const SubscriptionStatusAlert: React.FC<SubscriptionStatusAlertProps> = ({
  subscription,
  onRefresh
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  // Don't show alert for active subscriptions
  if (subscription.hasActiveSubscription && subscription.subscriptionStatus === 'active') {
    return null;
  }

  const handleManageBilling = async () => {
    try {
      setIsLoading(true);
      const { url } = await subscriptionAPI.createCustomerPortalSession({
        returnUrl: window.location.href
      });
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to open billing portal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setIsLoading(true);
      await subscriptionAPI.reactivateMySubscription();
      toast.success('Subscription reactivated successfully');
      onRefresh();
    } catch (error) {
      toast.error('Failed to reactivate subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertContent = () => {
    const { subscriptionStatus, currentPeriodEnd, cancelAtPeriodEnd, planName } = subscription;

    switch (subscriptionStatus) {
      case 'past_due':
        return {
          variant: 'destructive' as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Payment Past Due',
          message: 'Your payment is past due. Please update your payment method to avoid service interruption.',
          actions: (
            <Button 
              onClick={handleManageBilling} 
              size="sm" 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Update Payment
            </Button>
          )
        };

      case 'unpaid':
        return {
          variant: 'destructive' as const,
          icon: <XCircle className="h-4 w-4" />,
          title: 'Payment Failed',
          message: 'Your payment could not be processed. Please update your payment method immediately.',
          actions: (
            <Button 
              onClick={handleManageBilling} 
              size="sm" 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Fix Payment
            </Button>
          )
        };

      case 'canceled':
        const isExpired = currentPeriodEnd && new Date() > new Date(currentPeriodEnd);
        return {
          variant: 'destructive' as const,
          icon: <XCircle className="h-4 w-4" />,
          title: isExpired ? 'Subscription Expired' : 'Subscription Canceled',
          message: isExpired 
            ? 'Your subscription has expired. Reactivate to continue using all features.'
            : `Your subscription is canceled and will end on ${currentPeriodEnd ? format(new Date(currentPeriodEnd), 'MMM dd, yyyy') : 'the billing period end'}.`,
          actions: (
            <div className="flex gap-2">
              <Button 
                onClick={handleReactivate} 
                size="sm" 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reactivate
              </Button>
              <Button 
                onClick={handleManageBilling} 
                variant="outline" 
                size="sm" 
                disabled={isLoading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Billing Portal
              </Button>
            </div>
          )
        };

      case 'trialing':
        if (cancelAtPeriodEnd) {
          return {
            variant: 'default' as const,
            icon: <Clock className="h-4 w-4" />,
            title: 'Trial Ending Soon',
            message: `Your ${planName} trial will end on ${currentPeriodEnd ? format(new Date(currentPeriodEnd), 'MMM dd, yyyy') : 'soon'}. Add a payment method to continue.`,
            actions: (
              <Button 
                onClick={handleManageBilling} 
                size="sm" 
                disabled={isLoading}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            )
          };
        }
        
        const daysLeft = currentPeriodEnd 
          ? differenceInDays(new Date(currentPeriodEnd), new Date())
          : 0;
        
        if (daysLeft <= 7) {
          return {
            variant: 'default' as const,
            icon: <Clock className="h-4 w-4" />,
            title: 'Trial Ending Soon',
            message: `Your ${planName} trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Add a payment method to continue.`,
            actions: (
              <Button 
                onClick={handleManageBilling} 
                size="sm" 
                disabled={isLoading}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            )
          };
        }
        return null;

      case 'incomplete':
      case 'incomplete_expired':
        return {
          variant: 'destructive' as const,
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Subscription Incomplete',
          message: 'Your subscription setup is incomplete. Please complete the payment process.',
          actions: (
            <Button 
              onClick={handleManageBilling} 
              size="sm" 
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Complete Setup
            </Button>
          )
        };

      case 'none':
        return {
          variant: 'default' as const,
          icon: <CreditCard className="h-4 w-4" />,
          title: 'No Active Subscription',
          message: 'Subscribe to unlock all features and get full access to HirePlan.',
          actions: (
            <Button 
              onClick={() => window.location.href = '/dashboard/profile?tab=settings'} 
              size="sm" 
              disabled={isLoading}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              View Plans
            </Button>
          )
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
    <Alert variant={alertContent.variant} className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {alertContent.icon}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{alertContent.title}</span>
              <Badge variant="outline" className="text-xs">
                {subscription.subscriptionStatus}
              </Badge>
            </div>
            <AlertDescription className="text-sm">
              {alertContent.message}
            </AlertDescription>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {alertContent.actions}
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
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