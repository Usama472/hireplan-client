'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { CreditCard, ExternalLink, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { PLANS } from '@/constants/form-constants'
import { PlanCard } from '../profile/plan-card'
import subscriptionAPI from '@/http/subscription/api'
import type { Subscription } from '@/http/subscription/api'

interface SubscriptionManagerProps {
  userId: string
}

export function SubscriptionManager({ userId }: SubscriptionManagerProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Use the new verified subscription status API for accurate data
      const verifiedStatus = await subscriptionAPI.getVerifiedSubscriptionStatus()
      
      if (verifiedStatus.hasActiveSubscription) {
        // If we have an active subscription, get the full subscription details
        const data = await subscriptionAPI.getSubscription(userId)
        setSubscription(data)
      } else {
        // No active subscription
        setSubscription(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchSubscription()
    }
  }, [userId])

  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleCancel = async () => {
    if (!subscription) return
    
    if (window.confirm('Are you sure you want to cancel your subscription? It will remain active until the end of your billing period.')) {
      try {
        setActionLoading('cancel')
        await subscriptionAPI.cancelSubscription(subscription._id)
        toast.success('Subscription updated successfully')
        await fetchSubscription() // Refresh data
      } catch (error) {
        toast.error('Failed to cancel subscription')
      } finally {
        setActionLoading(null)
      }
    }
  }

  const handleReactivate = async () => {
    if (!subscription) return
    
    try {
      setActionLoading('reactivate')
      await subscriptionAPI.reactivateSubscription(subscription._id)
      toast.success('Subscription reactivated successfully')
      await fetchSubscription() // Refresh data
    } catch (error) {
      toast.error('Failed to reactivate subscription')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpgrade = async (planId: string) => {
    const plan = PLANS.find(p => p.id === planId)
    if (!plan) {
      toast.error('Plan not found')
      return
    }

    try {
      setActionLoading('checkout')
      const successUrl = `${window.location.origin}/dashboard/profile?tab=settings&success=true`
      const cancelUrl = `${window.location.origin}/dashboard/jobs`
      
      const response = await subscriptionAPI.createCheckoutSession({
        planId, // Send planId instead of priceId - backend will resolve the priceId
        successUrl,
        cancelUrl,
        customerId: subscription?.stripeCustomerId
      })
      
      if (response.url) {
        window.location.href = response.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      toast.error(`Failed to create checkout session: ${error.message || 'Unknown error'}`)
      setActionLoading(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      setActionLoading('portal')
      const returnUrl = `${window.location.origin}/dashboard/profile?tab=settings`
      
      const { url } = await subscriptionAPI.createCustomerPortalSession({
        returnUrl,
        customerId: subscription?.stripeCustomerId
      })
      
      window.open(url, '_blank')
    } catch (error) {
      toast.error('Failed to open billing portal')
    } finally {
      setActionLoading(null)
    }
  }



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
      </div>
    )
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
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscription ? (
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
                <h3 className="font-semibold text-lg">{subscription.planName} Plan</h3>
                <p className="text-sm text-gray-600">
                  Status: <Badge variant={getStatusVariant(subscription.status)}>
                    {subscription.status}
                  </Badge>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Current period ends</p>
                <p className="font-medium">
                  {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Subscription Canceling</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Your subscription will end on {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleManageBilling}
                variant="outline"
                className="flex items-center gap-2"
                disabled={actionLoading === 'portal'}
              >
                <ExternalLink className="h-4 w-4" />
                {actionLoading === 'portal' ? 'Opening...' : 'Manage Billing'}
              </Button>

              {subscription.cancelAtPeriodEnd ? (
                <Button
                  onClick={handleReactivate}
                  disabled={actionLoading === 'reactivate'}
                >
                  {actionLoading === 'reactivate' ? 'Reactivating...' : 'Reactivate Subscription'}
                </Button>
              ) : (
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={actionLoading === 'cancel'}
                >
                  {actionLoading === 'cancel' ? 'Canceling...' : 'Cancel Subscription'}
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
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
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
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={subscription?.planId === plan.id}
                onSelect={() => handleUpgrade(plan.id)}
                disabled={subscription?.planId === plan.id}
                showUpgrade={!subscription || subscription.planId !== plan.id}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default'
    case 'trialing':
      return 'secondary'
    case 'canceled':
    case 'past_due':
      return 'destructive'
    default:
      return 'outline'
  }
}


