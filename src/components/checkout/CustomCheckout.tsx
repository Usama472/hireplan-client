import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  Check, 
  ArrowLeft, 
  Lock,
  AlertCircle 
} from 'lucide-react';
import { PLANS } from '@/constants/form-constants';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { simpleSubscriptionAPI } from '@/http/subscription/simple-api';
import { PromoCodeInput } from './PromoCodeInput';

// Initialize Stripe dynamically from backend config
let stripePromise: Promise<any> | null = null;

const initializeStripe = async () => {
  if (stripePromise) return stripePromise;
  
  try {
    console.log('🔍 Fetching Stripe config from backend...');
    const config = await simpleSubscriptionAPI.getConfig();
    
    console.log('🔍 Backend config response structure:', config);
    
    if (!config.publishableKey) {
      console.error('❌ No Stripe publishable key received from backend');
      console.error('   Expected: config.publishableKey');
      console.error('   Received:', config);
      return null;
    }
    
    console.log('✅ Stripe config received, initializing Stripe...');
    stripePromise = loadStripe(config.publishableKey);
    return stripePromise;
  } catch (error) {
    console.error('❌ Failed to fetch Stripe config:', error);
    return null;
  }
};

interface CheckoutFormProps {
  selectedPlan: any;
  onBack: () => void;
}

function CheckoutForm({ selectedPlan, onBack }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  });
  const [appliedPromoCode, setAppliedPromoCode] = useState<any>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
        setLoading(false);
        return;
      }

      // Create subscription on your backend
      const response = await simpleSubscriptionAPI.createSubscription({
        planId: selectedPlan.id,
        paymentMethodId: paymentMethod.id,
        billingDetails,
        promotionCode: appliedPromoCode?.promotionCode?.code
      });

      if (response.data?.requiresAction && response.data?.clientSecret) {
        // Handle 3D Secure authentication
        const { error: confirmError } = await stripe.confirmCardPayment(
          response.data.clientSecret
        );

        if (confirmError) {
          setError(confirmError.message || 'Payment confirmation failed');
          setLoading(false);
          return;
        }
      }

      toast.success('Subscription created successfully!');
      window.location.href = '/dashboard/profile?tab=settings&success=true';

    } catch (err: any) {
      console.error('Checkout error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600">Secure checkout for {selectedPlan.name} plan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">{error}</div>
                  </div>
                )}

                {/* Billing Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Billing Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={billingDetails.name}
                        onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={billingDetails.email}
                        onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={billingDetails.address.line1}
                      onChange={(e) => setBillingDetails({ 
                        ...billingDetails, 
                        address: { ...billingDetails.address, line1: e.target.value }
                      })}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={billingDetails.address.city}
                        onChange={(e) => setBillingDetails({ 
                          ...billingDetails, 
                          address: { ...billingDetails.address, city: e.target.value }
                        })}
                        placeholder="New York"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={billingDetails.address.state}
                        onChange={(e) => setBillingDetails({ 
                          ...billingDetails, 
                          address: { ...billingDetails.address, state: e.target.value }
                        })}
                        placeholder="NY"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={billingDetails.address.postal_code}
                        onChange={(e) => setBillingDetails({ 
                          ...billingDetails, 
                          address: { ...billingDetails.address, postal_code: e.target.value }
                        })}
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Promo Code */}
                <div className="space-y-4">
                  <PromoCodeInput
                    onPromoCodeApplied={setAppliedPromoCode}
                    onPromoCodeRemoved={() => setAppliedPromoCode(null)}
                    appliedPromoCode={appliedPromoCode}
                  />
                </div>

                <Separator />

                {/* Card Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Your payment is secure</p>
                      <p>All transactions are encrypted and processed securely through Stripe.</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>Complete Purchase - {selectedPlan.price}</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedPlan.name}</h4>
                  <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {selectedPlan.popular && 'Popular'}
                </Badge>
              </div>

              <Separator />

              {/* Features */}
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900">Includes:</h5>
                <ul className="space-y-1">
                  {selectedPlan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{selectedPlan.price}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Billing cycle</span>
                  <span>Monthly</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{selectedPlan.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface CustomCheckoutProps {
  planId?: string;
}

export function CustomCheckout({ planId }: CustomCheckoutProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stripe, setStripe] = useState<any>(null);
  const [stripeLoading, setStripeLoading] = useState(true);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const selectedPlanId = planId || searchParams.get('plan');
  
  const selectedPlan = PLANS.find(plan => plan.id === selectedPlanId);

  useEffect(() => {
    const loadStripeConfig = async () => {
      try {
        const stripeInstance = await initializeStripe();
        setStripe(stripeInstance);
        setStripeLoading(false);
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        setStripeError('Failed to load payment system');
        setStripeLoading(false);
      }
    };

    loadStripeConfig();
  }, []);

  // Show loading state while Stripe is initializing
  if (stripeLoading) {
    return (
      <div className="min-h-screen bg-blue-50/30 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Payment System</h2>
            <p className="text-gray-600">Initializing secure checkout...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if Stripe initialization failed
  if (stripeError || !stripe) {
    return (
      <div className="min-h-screen bg-blue-50/30 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment System Unavailable</h2>
            <p className="text-gray-600 mb-6">{stripeError || 'Unable to load payment system. Please try again later.'}</p>
            <Button onClick={() => navigate('/dashboard/profile?tab=settings')}>
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-blue-50/30 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Plan Not Found</h2>
            <p className="text-gray-600 mb-6">The selected plan could not be found.</p>
            <Button onClick={() => navigate('/dashboard/profile?tab=settings')}>
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50/30">
      <Elements stripe={stripe}>
        <CheckoutForm 
          selectedPlan={selectedPlan}
          onBack={() => navigate('/dashboard/profile?tab=settings')}
        />
      </Elements>
    </div>
  );
}

export default CustomCheckout;
