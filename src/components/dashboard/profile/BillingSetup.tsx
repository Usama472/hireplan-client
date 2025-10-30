import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import useAuthSessionContext from '@/lib/context/AuthSessionContext';
import { Label } from '@/components/ui/label';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface BillingSetupProps {
  customPrice: number;
  onSuccess?: () => void;
}

function PaymentForm({ customPrice, onSuccess }: BillingSetupProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Confirm the setup
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/profile?tab=settings&payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment setup failed');
      } else if (setupIntent && setupIntent.status === 'succeeded' && setupIntent.payment_method) {
        // Payment method successfully added, now create subscription
        try {
          const { simpleSubscriptionAPI } = await import('@/http/subscription/simple-api');
          await simpleSubscriptionAPI.createCustomSubscription(setupIntent.payment_method as string);
          toast.success('Billing activated! You will be charged $' + customPrice + '/month');
          onSuccess?.();
        } catch (subError: any) {
          toast.error('Payment method added but subscription creation failed');
        }
      }
    } catch (error: any) {
      toast.error('Failed to set up payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Payment Setup Required</p>
            <p>
              Your organization has set your monthly rate at <strong>${customPrice}/month</strong>.
              Add a payment method below to activate automatic billing.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Payment Information</Label>
        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </>
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        Your card will be charged ${customPrice} monthly. Secure payment powered by Stripe.
      </p>
    </form>
  );
}

export function BillingSetup() {
  const { subscription, data: authSession, refreshSubscription } = useAuthSessionContext();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const customPrice = subscription?.customMonthlyPrice;
  const hasPrice = customPrice && customPrice > 0;
  const hasActiveSubscription = subscription?.hasActiveSubscription || false;
  const nextBillingDate = subscription?.currentPeriodEnd;
  const willCancelAtPeriodEnd = subscription?.cancelAtPeriodEnd || false;

  const handleInitiateSetup = async () => {
    setIsLoading(true);
    try {
      console.log('🔵 Initiating payment setup...');
      const { simpleSubscriptionAPI } = await import('@/http/subscription/simple-api');
      const response = await simpleSubscriptionAPI.createCustomSetupIntent();
      console.log('✅ Setup intent created:', response);
      console.log('🔑 Setting clientSecret:', response.clientSecret);
      setClientSecret(response.clientSecret);
      console.log('✅ Client secret set in state');
    } catch (error) {
      console.error('❌ Failed to initialize payment setup:', error);
      toast.error('Failed to initialize payment setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async () => {
    setClientSecret(null);
    toast.success('Refreshing subscription status...');
    // Refresh subscription to get updated payment status
    if (refreshSubscription) {
      await refreshSubscription();
    }
    window.location.reload(); // Reload to show updated status
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }

    setIsCancelling(true);
    try {
      const { simpleSubscriptionAPI } = await import('@/http/subscription/simple-api');
      await simpleSubscriptionAPI.cancel(true); // Cancel at period end
      toast.success('Subscription will cancel at the end of your billing period');
      if (refreshSubscription) {
        await refreshSubscription();
      }
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenPortal = async () => {
    try {
      const { simpleSubscriptionAPI } = await import('@/http/subscription/simple-api');
      const result = await simpleSubscriptionAPI.createPortal(window.location.href);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error('Failed to open billing portal');
    }
  };

  if (!hasPrice) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Billing
          </CardTitle>
          <CardDescription>No billing configured</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Your organization has not set up billing for your account yet.
            Contact your administrator for more information.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show active subscription management if they have a subscription
  if (hasActiveSubscription) {
    return (
      <Card className="border border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Billing Active
          </CardTitle>
          <CardDescription>
            {willCancelAtPeriodEnd ? 'Cancels at period end' : 'Subscription active'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Monthly Rate */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
            <div>
              <p className="font-semibold text-gray-900">Monthly Rate</p>
              <p className="text-sm text-gray-600">Automatically charged</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">${customPrice}</p>
              <p className="text-xs text-gray-500">/month</p>
            </div>
          </div>

          {/* Next Billing Date */}
          {nextBillingDate && !willCancelAtPeriodEnd && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm font-medium text-blue-900">Next Billing Date</p>
                <p className="text-xs text-blue-600">Your card will be charged</p>
              </div>
              <p className="text-sm font-semibold text-blue-900">
                {new Date(nextBillingDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          )}

          {/* Cancellation Notice */}
          {willCancelAtPeriodEnd && nextBillingDate && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-900">Subscription Ending</p>
              <p className="text-xs text-yellow-700 mt-1">
                Your subscription will end on {new Date(nextBillingDate).toLocaleDateString()}. 
                You'll have access until then.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={handleOpenPortal}
              className="flex-1"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Payment
            </Button>
            
            {!willCancelAtPeriodEnd && (
              <Button 
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-gray-500">
            Billing managed by Stripe • Secure & encrypted
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log('🔍 BillingSetup - customPrice:', customPrice);
  console.log('🔍 BillingSetup - hasPrice:', hasPrice);
  console.log('🔍 BillingSetup - clientSecret:', clientSecret);
  console.log('🔍 BillingSetup - hasPaymentMethod:', hasPaymentMethod);

  return (
    <Card className="border border-yellow-200 bg-yellow-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          Payment Method Required
        </CardTitle>
        <CardDescription>
          Monthly rate: ${customPrice}/month
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clientSecret ? (
          <div>
            <p className="text-sm text-green-600 mb-4">✅ Payment form loaded successfully!</p>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm customPrice={customPrice} onSuccess={handleSuccess} />
            </Elements>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Your organization has set a monthly rate of <strong>${customPrice}</strong> for your account.
              Add a payment method to enable automatic billing.
            </p>
            
            <Button 
              onClick={handleInitiateSetup}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Add Payment Method
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

