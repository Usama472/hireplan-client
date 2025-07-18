'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PLANS } from '@/constants/form-constants'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

export function PlanSelectionStep() {
  const { watch, setValue } = useFormContext()
  const selectedPlan = watch('plan')

  const handlePlanSelect = (planId: string) => {
    setValue('plan', planId)
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'relative cursor-pointer transition-all duration-200 hover:shadow-lg',
              selectedPlan === plan.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-md',
              plan.popular && 'border-blue-500'
            )}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                <span className='bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium'>
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className='text-center pb-4'>
              <CardTitle className='text-xl font-bold'>{plan.name}</CardTitle>
              <div className='flex items-baseline justify-center'>
                <span className='text-3xl font-bold text-gray-900'>
                  {plan.price}
                </span>
                <span className='text-gray-500 ml-1'>{plan.period}</span>
              </div>
              <CardDescription className='mt-2'>
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <ul className='space-y-3'>
                {plan.features.map((feature, index) => (
                  <li key={index} className='flex items-start'>
                    <Check className='h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0' />
                    <span className='text-sm text-gray-700'>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                type='button'
                className={cn(
                  'w-full mt-6',
                  selectedPlan === plan.id
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
