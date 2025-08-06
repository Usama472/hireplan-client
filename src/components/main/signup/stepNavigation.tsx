import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface StepNavigationProps {
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
  isValid: boolean
  isSubmitting?: boolean
}

export function StepNavigation({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  isValid,
  isSubmitting = false,
}: StepNavigationProps) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleNext = (event: React.MouseEvent) => {
    if (!isLastStep) {
      event.preventDefault()
      onNext()
      scrollToTop()
    } else {
      // On last step, manually trigger form submission
      event.preventDefault()
      const form = event.currentTarget.closest('form')
      if (form) {
        console.log('Manually triggering form submission')
        form.dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true })
        )
      }
    }
  }

  const handlePrevious = () => {
    onPrevious()
    scrollToTop()
  }

  return (
    <div className='flex justify-between items-center pt-6 border-t border-gray-100'>
      <Button
        type='button'
        variant='ghost'
        onClick={handlePrevious}
        disabled={isFirstStep || isSubmitting}
        className='flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
      >
        <ChevronLeft className='h-4 w-4' />
        <span>Previous</span>
      </Button>

      <Button
        type='button'
        onClick={handleNext}
        disabled={!isValid || isSubmitting}
        className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md'
      >
        {isSubmitting ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>{isLastStep ? 'Submit Job' : 'Continue'}</span>
            {!isLastStep && <ChevronRight className='h-4 w-4' />}
          </>
        )}
      </Button>
    </div>
  )
}
