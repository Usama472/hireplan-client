import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface StepControlsProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isValid: boolean;
  isSubmitting?: boolean;
  currentStep?: number;
  totalSteps?: number;
  finalStepText?: string;
}

export function StepControls({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  isValid,
  isSubmitting = false,
  finalStepText = "Create Account",
}: StepControlsProps) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNext = (event: React.MouseEvent) => {
    if (!isLastStep) {
      event.preventDefault();
      onNext();
      scrollToTop();
    } else {
      // On last step, manually trigger form submission
      event.preventDefault();
      const form = event.currentTarget.closest("form");
      if (form) {
        console.log("Manually triggering form submission");
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
      }
    }
  };

  const handlePrevious = () => {
    onPrevious();
    scrollToTop();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center pt-6 border-t border-gray-100">
      <Button
        type="button"
        variant="ghost"
        onClick={handlePrevious}
        disabled={isFirstStep || isSubmitting}
        className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-6 py-3 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm h-12 order-2 sm:order-1 shadow-none"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={handleNext}
        disabled={!isValid || isSubmitting}
        className="order-1"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>{isLastStep ? finalStepText : "Continue"}</span>
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </>
        )}
      </Button>
    </div>
  );
}

// Export with original name for backward compatibility
export const StepNavigation = StepControls;
