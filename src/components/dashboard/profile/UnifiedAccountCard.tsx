import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Brain,
  XCircle,
  Mail,
  Calendar,
  DollarSign,
  Building2,
  Shield,
  Zap
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import useAuthSessionContext from '@/lib/context/AuthSessionContext';

// Stripe promise will be loaded dynamically from backend
let stripePromise: Promise<any> | null = null;

const initializeStripe = async () => {
  if (stripePromise) return stripePromise;
  
  try {
    console.log('🔍 Fetching Stripe config from backend...');
    const { simpleSubscriptionAPI } = await import('@/http/subscription/simple-api');
    const config = await simpleSubscriptionAPI.getConfig();
    
    if (!config.publishableKey) {
      console.error('❌ No Stripe publishable key from backend');
      return null;
    }
    
    console.log('✅ Stripe config received, loading Stripe...');
    stripePromise = loadStripe(config.publishableKey);
    return stripePromise;
  } catch (error) {
    console.error('❌ Failed to fetch Stripe config:', error);
    return null;
  }
};

function PaymentForm({ customPrice, onSuccess, updateOnly = false }: { customPrice: number; onSuccess: () => void; updateOnly?: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  console.log('🎨 PaymentForm rendered:', { stripe: !!stripe, elements: !!elements, customPrice, updateOnly });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: `${window.location.origin}/dashboard/profile?tab=settings&payment=success` },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment setup failed');
      } else if (setupIntent && setupIntent.status === 'succeeded' && setupIntent.payment_method) {
        const { simpleSubscriptionAPI } = await import('@/http/subscription/simple-api');
        await simpleSubscriptionAPI.createCustomSubscription(setupIntent.payment_method as string, updateOnly);
        
        if (updateOnly) {
          toast.success('Payment method updated successfully!');
        } else {
          toast.success('Billing activated! You will be charged $' + customPrice + '/month');
        }
        onSuccess();
      }
    } catch (error: any) {
      toast.error(updateOnly ? 'Failed to update payment method' : 'Failed to set up payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ Stripe is loading... Please wait.
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          stripe: {stripe ? '✅' : '❌'} | elements: {elements ? '✅' : '❌'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element with Checkout-style design */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-gray-900">Payment Method</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {updateOnly ? 'Enter new card details' : 'Enter your payment information'}
          </p>
        </div>
        
        <div className="p-6">
          <PaymentElement 
            options={{
              layout: {
                type: 'tabs',
                defaultCollapsed: false,
              },
              fields: {
                billingDetails: 'auto',
              },
              terms: {
                card: 'auto',
              }
            }}
          />
        </div>
      </div>
      
      {/* Submit Button - Checkout style */}
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
      >
        {isProcessing ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Processing...</span>
          </div>
        ) : updateOnly ? (
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span>Save New Payment Method</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6" />
            <span>Start Billing - ${customPrice}/month</span>
          </div>
        )}
      </Button>
      
      {/* Security Info */}
      <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <Shield className="w-5 h-5 text-green-600" />
        <div className="text-sm">
          <p className="font-semibold text-gray-900">256-bit Encryption</p>
          <p className="text-xs text-gray-600">Secure payment powered by Stripe</p>
        </div>
      </div>

      {!updateOnly && (
        <p className="text-center text-xs text-gray-500">
          Your card will be charged <strong>${customPrice}</strong> today and <strong>${customPrice}/month</strong> thereafter. Cancel anytime.
        </p>
      )}
    </form>
  );
}

export function UnifiedAccountCard() {
  const { subscription, refreshSubscription } = useAuthSessionContext();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showUpdateCardDialog, setShowUpdateCardDialog] = useState(false);
  const [updateCardSecret, setUpdateCardSecret] = useState<string | null>(null);
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [stripeLoading, setStripeLoading] = useState(true);

  const planId = subscription?.planId || 'starter';
  const planName = subscription?.planName || 'Starter';
  const hasAI = planId === 'professional' || planId === 'enterprise';
  const customPrice = (subscription as any)?.customMonthlyPrice;
  const hasPrice = customPrice && customPrice > 0;
  const hasActiveSubscription = subscription?.hasActiveSubscription || false;
  const nextBillingDate = subscription?.currentPeriodEnd;
  const willCancelAtPeriodEnd = subscription?.cancelAtPeriodEnd || false;
  const isPastDue = (subscription as any)?.isPastDue || false;
  const isIncomplete = (subscription as any)?.isIncomplete || false;

  // Load Stripe on mount
  React.useEffect(() => {
    const loadStripeConfig = async () => {
      try {
        const stripe = await initializeStripe();
        setStripeInstance(stripe);
        setStripeLoading(false);
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        setStripeLoading(false);
      }
    };
    loadStripeConfig();
  }, []);

  const handleInitiateSetup = () => {
    if (!customPrice) {
      toast.error('No pricing information available');
      return;
    }
    console.log('🚀 Redirecting to checkout with custom pricing:', customPrice);
    console.log('🔗 URL:', `/checkout?mode=custom&amount=${customPrice}`);
    window.location.href = `/checkout?mode=custom&amount=${customPrice}`;
  };

  const handleSuccess = async () => {
    setClientSecret(null);
    if (refreshSubscription) await refreshSubscription();
    window.location.reload();
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Cancel subscription? You will have access until the end of your billing period.')) return;
    setIsCancelling(true);
    try {
      const { simpleSubscriptionAPI } = await import('@/http/subscription/simple-api');
      await simpleSubscriptionAPI.cancel(true);
      toast.success('Subscription will cancel at period end');
      if (refreshSubscription) await refreshSubscription();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpdateCard = async () => {
    // Redirect to checkout page in update mode
    window.location.href = `/checkout?mode=update&amount=${customPrice}`;
  };

  const handleCardUpdateSuccess = async () => {
    setUpdateCardSecret(null);
    setShowUpdateCardDialog(false);
    toast.success('Payment method updated successfully!');
    if (refreshSubscription) await refreshSubscription();
    window.location.reload(); // Reload to show updated status
  };

  return (
    <div className="space-y-4">
      {/* Header matching other settings sections */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Account & Billing
        </h3>
        <p className="text-gray-600 text-sm">
          Manage your subscription plan and payment information
        </p>
      </div>

      <Card className="border border-gray-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2 font-bold">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              Account Overview
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              {planName} Plan {hasActiveSubscription && '• Billing Active'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge className={`border-0 px-3 py-1.5 text-sm shadow-sm ${
              planId === 'enterprise' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
              planId === 'professional' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {planName}
            </Badge>
            {hasActiveSubscription && (
              <Badge className="bg-green-600 text-white border-0 px-3 py-1.5 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Plan Summary */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <Badge className={`px-3 py-1 ${
            planId === 'enterprise' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
            planId === 'professional' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {planName}
          </Badge>
          <div className="text-sm text-gray-600">
            {hasAI ? '✓ AI Features' : 'Basic Features'}
          </div>
        </div>

        {/* Billing Section */}
        {hasPrice && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Billing & Subscription</h3>
              
              {/* Active Subscription - Compact */}
              {hasActiveSubscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">${customPrice}/month</p>
                        {nextBillingDate && !willCancelAtPeriodEnd && (
                          <p className="text-xs text-gray-600">
                            Next: {new Date(nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>

                  {/* Payment Status Alerts */}
                  {isPastDue && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-900 text-sm">Payment Failed</p>
                          <p className="text-xs text-red-700 mt-1">
                            Your last payment was declined. Please update your payment method to avoid service interruption.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isIncomplete && (
                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-yellow-900 text-sm">Payment Incomplete</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Your subscription payment needs to be completed. Please update your payment method.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {willCancelAtPeriodEnd && nextBillingDate && !isPastDue && !isIncomplete && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-900">Subscription Ending</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Ends {new Date(nextBillingDate).toLocaleDateString()} • Access until then
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions - Compact */}
                  <div className="flex gap-2 text-sm">
                    <Button variant="outline" onClick={handleUpdateCard} size="sm" className="flex-1">
                      Update Card
                    </Button>
                    {!willCancelAtPeriodEnd && (
                      <Button variant="outline" onClick={handleCancelSubscription} size="sm" className="text-red-600">
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Payment Setup Form */
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-bold text-yellow-900">Payment Method Required</p>
                          <p className="text-sm text-yellow-800 mt-1">
                            Monthly rate: <strong>${customPrice}/month</strong>
                          </p>
                          <p className="text-xs text-yellow-700 mt-2">
                            Click below to securely add your payment method and activate billing.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleInitiateSetup}
                      className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700"
                    >
                      <CreditCard className="w-6 h-6 mr-3" />
                      Continue to Secure Checkout
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Secure payment • Cancel anytime</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* No Billing Message */}
        {!hasPrice && !hasAI && (
          <>
            <Separator />
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600">
                  <p className="font-medium mb-1">Need More Features?</p>
                  <p>Contact your organization administrator or reach out to support@hireplan.co</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Update Card Dialog */}
      <Dialog open={showUpdateCardDialog} onOpenChange={setShowUpdateCardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Payment Method</DialogTitle>
            <DialogDescription>
              Update your card for the ${customPrice}/month subscription
            </DialogDescription>
          </DialogHeader>
          
          {updateCardSecret && stripeInstance && (
            <Elements stripe={stripeInstance} options={{ clientSecret: updateCardSecret }}>
              <PaymentForm customPrice={customPrice || 0} onSuccess={handleCardUpdateSuccess} updateOnly={true} />
            </Elements>
          )}
          {updateCardSecret && !stripeInstance && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Loading Stripe...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
    </div>
  );
}

