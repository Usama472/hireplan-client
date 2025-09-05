"use client";

import { FORM_STEPS } from "@/constants/form-constants";
import { useEffect, useState } from "react";

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const [mounted, setMounted] = useState(false);
  const currentStepData = FORM_STEPS.find((step) => step.id === currentStep);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="mb-8">
      {/* Step indicator */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
          Step {currentStep} of {FORM_STEPS.length}
        </span>
      </div>

      {/* Main heading */}
      <h2 className="text-2xl font-bold text-foreground mb-3">
        {currentStepData?.title}
      </h2>

      {/* Description */}
      <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
        {currentStepData?.description}
      </p>
    </div>
  );
}
