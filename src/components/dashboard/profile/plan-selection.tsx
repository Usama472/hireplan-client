'use client'

import { PLANS } from '@/constants/form-constants'
import { useState } from 'react'
import { PlanCard } from './plan-card'
import subscriptionAPI from '@/http/subscription/api'
import { toast } from 'sonner'

export function PlanSelection() {
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handlePlanSelect = async (planId: string) => {
    const plan = PLANS.find(p => p.id === planId)
    if (!plan) {
      toast.error('Plan not found')
      return
    }

    try {
      setActionLoading(planId)
      const successUrl = `${window.location.origin}/dashboard/profile?tab=settings&success=true`
      const cancelUrl = `${window.location.origin}/dashboard/jobs`
      
      const response = await subscriptionAPI.createCheckoutSession({
        planId,
        successUrl,
        cancelUrl,
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

function getPriceId(planId: string): string | null {
  const priceMap: Record<string, string> = {
    starter: 'price_1234567890abcdef',
    professional: 'price_0987654321fedcba',
    enterprise: 'price_abcdef1234567890',
  }
  
  return priceMap[planId] || null
}

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={false} // No current selection for new users
            onSelect={handlePlanSelect}
            disabled={actionLoading === plan.id}
            showUpgrade={true}
          />
        ))}
      </div>

      {/* Plan Selection Info */}
      <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
        <div className='text-center'>
          <h4 className='font-medium text-blue-900 mb-1'>
            Choose Your Plan
          </h4>
          <p className='text-sm text-blue-700'>
            Select a plan to get started with full access to HirePlan features
          </p>
        </div>
      </div>
    </div>
  )
}
