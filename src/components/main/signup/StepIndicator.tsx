'use client'

import { FORM_STEPS } from '@/constants/form-constants'
import { useEffect, useState } from 'react'

interface StepIndicatorProps {
  currentStep: number
  completedSteps: number[]
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const [mounted, setMounted] = useState(false)
  const currentStepData = FORM_STEPS.find((step) => step.id === currentStep)
  const progressPercentage = (currentStep / FORM_STEPS.length) * 100

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className='relative mb-8'>
      {/* Subtle Background Pattern */}
      <div className='absolute inset-0 -z-10 bg-gradient-to-b from-gray-50/50 to-transparent rounded-2xl -m-6' />

      {/* Progress Bar */}
      <div className='relative mb-8'>
        <div className='h-1 bg-gray-200 rounded-full overflow-hidden'>
          <div
            className='bg-blue-600 h-1 rounded-full transition-all duration-700 ease-out'
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Step Counter */}
        <div
          className='absolute -top-1 transition-all duration-700 ease-out'
          style={{ left: `${progressPercentage}%` }}
        >
          <div className='relative -translate-x-1/2'>
            <div className='w-3 h-3 bg-blue-600 rounded-full shadow-lg shadow-blue-200' />
            <div className='absolute inset-0 w-3 h-3 bg-blue-600 rounded-full animate-ping opacity-20' />
          </div>
        </div>
      </div>

      {/* Step info */}
      <div className='flex items-center justify-between text-sm'>
        <div>
          <span className='text-gray-500'>
            Step {currentStep} of {FORM_STEPS.length}
          </span>
        </div>
        <div>
          <span className='text-blue-600 font-medium'>
            {Math.round(progressPercentage)}% complete
          </span>
        </div>
      </div>

      {/* Current step title */}
      <div className='mt-4'>
        <h2 className='text-xl font-semibold text-gray-900'>
          {currentStepData?.title}
        </h2>
        <p className='text-gray-600 text-sm mt-1'>
          {currentStepData?.description}
        </p>
      </div>
    </div>
  )
}
