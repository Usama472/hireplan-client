import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
  isValid: boolean
  isSubmitting?: boolean
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
}: StepNavigationProps) {
  const handleClick = (event: React.MouseEvent) => {
    if (!isLastStep) {
      event.preventDefault()
      onNext()
    }
  }

  return (
    <div className='flex justify-between items-center pt-6 border-t'>
      <Button
        type='button'
        variant='outline'
        onClick={onPrevious}
        disabled={isFirstStep}
        className='flex items-center space-x-2 bg-transparent'
      >
        <ChevronLeft className='h-4 w-4' />
        <span>Previous</span>
      </Button>

      <div className='flex items-center space-x-2'>
        <span className='text-sm text-gray-500'>
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <Button
        type={isLastStep ? 'submit' : 'button'}
        onClick={handleClick}
        disabled={isSubmitting}
        className='flex items-center space-x-2'
      >
        <span>
          {isLastStep ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'}
        </span>
        {!isLastStep && <ChevronRight className='h-4 w-4' />}
      </Button>
    </div>
  )
}
