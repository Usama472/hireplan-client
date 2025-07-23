'use client'

import { PLANS } from '@/constants/form-constants'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { PlanCard } from './plan-card'

export function PlanSelection() {
  const { watch, setValue, formState } = useFormContext()
  const selectedPlan = watch('paymentPlan')
  const { defaultValues } = formState

  // Ensure we have a default plan selected
  useEffect(() => {
    if (!selectedPlan) {
      // Set the default plan or starter if no default exists
      setValue('paymentPlan', defaultValues?.paymentPlan || 'starter', {
        shouldDirty: false,
      })
    }
  }, [selectedPlan, setValue, defaultValues])

  const handlePlanSelect = (planId: string) => {
    if (planId === selectedPlan) return // No change if same plan selected

    // Mark the field as dirty when changing plans
    setValue('paymentPlan', planId, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
  }

  // Get the current selected plan details
  const currentPlan = PLANS.find((p) => p.id === selectedPlan) || PLANS[0]

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            onSelect={handlePlanSelect}
          />
        ))}
      </div>

      {/* Current Plan Info */}
      <div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
        <div className='flex items-start justify-between'>
          <div>
            <h4 className='font-medium text-blue-900 mb-1'>
              Current Plan Benefits
            </h4>
            <p className='text-sm text-blue-700 mb-3'>
              You're currently on the {currentPlan.name} plan
            </p>
            <ul className='space-y-1'>
              {currentPlan.features.slice(0, 3).map((feature, index) => (
                <li
                  key={index}
                  className='text-sm text-blue-700 flex items-center gap-2'
                >
                  <div className='w-1.5 h-1.5 bg-blue-500 rounded-full' />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-bold text-blue-900'>
              {currentPlan.price}
            </div>
            <div className='text-sm text-blue-600'>{currentPlan.period}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
