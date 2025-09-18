import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

interface EnhancedProgressStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  variant?: "horizontal" | "vertical" | "compact";
  size?: "sm" | "md" | "lg";
  className?: string;
  showProgress?: boolean;
  clickable?: boolean;
  onStepClick?: (stepIndex: number) => void;
}

export function EnhancedProgressStepper({
  steps,
  currentStep,
  completedSteps = [],
  variant = "horizontal",
  size = "md",
  className,
  showProgress = true,
  clickable = false,
  onStepClick,
}: EnhancedProgressStepperProps) {
  const isCompleted = (stepIndex: number) =>
    completedSteps.includes(stepIndex + 1);
  const isCurrent = (stepIndex: number) => currentStep === stepIndex + 1;
  const isPast = (stepIndex: number) => currentStep > stepIndex + 1;
  const isFuture = (stepIndex: number) => currentStep < stepIndex + 1;

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const stepSizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const connectorClasses = {
    sm: variant === "horizontal" ? "h-0.5" : "w-0.5",
    md: variant === "horizontal" ? "h-1" : "w-1",
    lg: variant === "horizontal" ? "h-1.5" : "w-1.5",
  };

  const handleStepClick = (stepIndex: number) => {
    if (
      clickable &&
      onStepClick &&
      (isPast(stepIndex) || isCurrent(stepIndex))
    ) {
      onStepClick(stepIndex);
    }
  };

  // Compact variant - just shows progress bar with current step info
  if (variant === "compact") {
    const currentStepData = steps[currentStep - 1];
    return (
      <div className={cn("w-full space-y-3", className)}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              Step {currentStep} of {steps.length}
            </span>
            {currentStepData && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{currentStepData.title}</span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-500 ease-out",
                "bg-blue-600"
              )}
              style={{ width: `${Math.max(progressPercentage, 8)}%` }}
            />
          </div>
          {/* Step markers */}
          <div className="absolute top-0 left-0 w-full h-2 flex justify-between">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full border-2 bg-white -mt-0.5 transition-all duration-300",
                  {
                    "border-blue-500 bg-blue-500":
                      isCompleted(index) || isCurrent(index),
                    "border-gray-300": isFuture(index),
                  }
                )}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vertical variant
  if (variant === "vertical") {
    return (
      <div className={cn("flex flex-col space-y-6", className)}>
        {steps.map((step, index) => {
          const completed = isCompleted(index);
          const current = isCurrent(index);
          const past = isPast(index);
          const future = isFuture(index);

          return (
            <div key={step.id} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <button
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 relative overflow-hidden group",
                    stepSizeClasses[size],
                    {
                      "bg-blue-600 border-blue-600 text-white shadow-lg":
                        current,
                      "bg-green-500 border-green-500 text-white": completed,
                      "bg-white border-gray-300 text-gray-500 hover:border-gray-400":
                        future,
                      "bg-gray-100 border-gray-400 text-gray-600":
                        past && !completed,
                      "cursor-pointer": clickable && (past || current),
                      "cursor-default": !clickable,
                    }
                  )}
                  onClick={() => handleStepClick(index)}
                  disabled={!clickable}
                >
                  {completed ? (
                    <Check
                      className={cn(
                        "w-4 h-4",
                        size === "sm" && "w-3 h-3",
                        size === "lg" && "w-5 h-5"
                      )}
                    />
                  ) : step.icon ? (
                    <step.icon
                      className={cn(
                        "w-4 h-4",
                        size === "sm" && "w-3 h-3",
                        size === "lg" && "w-5 h-5"
                      )}
                    />
                  ) : (
                    index + 1
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mt-3 transition-all duration-500",
                      connectorClasses[size],
                      {
                        "bg-blue-600": past || completed,
                        "bg-gray-300": future,
                        "h-12": size === "sm",
                        "h-16": size === "md",
                        "h-20": size === "lg",
                      }
                    )}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-6">
                <button
                  className={cn(
                    "text-left w-full group",
                    clickable && (past || current) && "cursor-pointer",
                    !clickable && "cursor-default"
                  )}
                  onClick={() => handleStepClick(index)}
                  disabled={!clickable}
                >
                  <h3
                    className={cn(
                      "font-semibold transition-all duration-200",
                      {
                        "text-blue-600": current,
                        "text-green-600": completed,
                        "text-gray-900": past && !completed,
                        "text-gray-500": future,
                      },
                      size === "sm" && "text-sm",
                      size === "md" && "text-base",
                      size === "lg" && "text-lg"
                    )}
                  >
                    {step.title}
                    {step.optional && (
                      <span className="ml-2 text-xs text-gray-400 font-normal bg-gray-100 px-2 py-0.5 rounded-full">
                        optional
                      </span>
                    )}
                  </h3>
                  {step.description && (
                    <p
                      className={cn(
                        "mt-2 transition-all duration-200 leading-relaxed",
                        {
                          "text-blue-600/70": current,
                          "text-gray-600": past || completed,
                          "text-gray-400": future,
                        },
                        size === "sm" && "text-xs",
                        size === "md" && "text-sm",
                        size === "lg" && "text-base"
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal variant (enhanced)
  return (
    <div className={cn("w-full", className)}>
      {showProgress && (
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700 text-xs sm:text-sm">
              Progress: {currentStep} of {steps.length} steps
            </span>
            <span className="text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-700 ease-out",
                  "bg-blue-600"
                )}
                style={{ width: `${Math.max(progressPercentage, 4)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Compact view on small screens */}
      <div className="block sm:hidden">
        <div className="flex items-center justify-between w-full px-2">
          {steps.map((step, index) => {
            const completed = isCompleted(index);
            const current = isCurrent(index);
            const past = isPast(index);
            const future = isFuture(index);

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <button
                    className={cn(
                      "flex items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 w-7 h-7 text-xs",
                      {
                        "bg-primary border-primary text-white shadow-sm":
                          current,
                        "bg-green-500 border-green-500 text-white": completed,
                        "bg-white border-gray-300 text-gray-500": future,
                        "bg-gray-100 border-gray-400 text-gray-600":
                          past && !completed,
                        "cursor-pointer": clickable && (past || current),
                        "cursor-default": !clickable,
                      }
                    )}
                    onClick={() => handleStepClick(index)}
                    disabled={!clickable}
                  >
                    {completed ? <Check className="w-3 h-3" /> : index + 1}
                  </button>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex items-center justify-center flex-1 px-1.5">
                    <div
                      className={cn(
                        "w-full transition-all duration-500 rounded-full h-0.5",
                        {
                          "bg-primary": past || completed,
                          "bg-gray-300": future,
                        }
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current step info below on mobile */}
        {steps[currentStep - 1] && (
          <div className="mt-4 text-center px-2">
            <h3 className="font-semibold text-sm text-primary mb-1">
              {steps[currentStep - 1].title}
              {steps[currentStep - 1].optional && (
                <span className="ml-2 text-xs text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-full">
                  optional
                </span>
              )}
            </h3>
            {steps[currentStep - 1].description && (
              <p className="text-xs text-gray-600">
                {steps[currentStep - 1].description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Desktop: Full stepper view on larger screens */}
      <div className="hidden sm:flex items-start justify-between w-full">
        {steps.map((step, index) => {
          const completed = isCompleted(index);
          const current = isCurrent(index);
          const past = isPast(index);
          const future = isFuture(index);

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center space-y-3 flex-1 min-w-0">
                <button
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 font-semibold transition-all duration-300 relative overflow-hidden group",
                    stepSizeClasses[size],
                    {
                      "bg-blue-600 border-blue-600 text-white shadow-lg":
                        current,
                      "bg-green-500 border-green-500 text-white": completed,
                      "bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:shadow-md":
                        future,
                      "bg-gray-100 border-gray-400 text-gray-600":
                        past && !completed,
                      "cursor-pointer": clickable && (past || current),
                      "cursor-default": !clickable,
                    }
                  )}
                  onClick={() => handleStepClick(index)}
                  disabled={!clickable}
                >
                  {completed ? (
                    <Check
                      className={cn(
                        "w-4 h-4",
                        size === "sm" && "w-3 h-3",
                        size === "lg" && "w-5 h-5"
                      )}
                    />
                  ) : step.icon ? (
                    <step.icon
                      className={cn(
                        "w-4 h-4",
                        size === "sm" && "w-3 h-3",
                        size === "lg" && "w-5 h-5"
                      )}
                    />
                  ) : (
                    index + 1
                  )}
                </button>

                <div className="text-center max-w-28 px-1">
                  <button
                    className={cn(
                      "text-center w-full group transition-all duration-200",
                      clickable && (past || current) && "cursor-pointer",
                      !clickable && "cursor-default"
                    )}
                    onClick={() => handleStepClick(index)}
                    disabled={!clickable}
                  >
                    <h3
                      className={cn(
                        "font-semibold transition-all duration-200 leading-tight",
                        {
                          "text-blue-600": current,
                          "text-green-600": completed,
                          "text-gray-900": past && !completed,
                          "text-gray-500": future,
                        },
                        size === "sm" && "text-xs",
                        size === "md" && "text-sm",
                        size === "lg" && "text-base"
                      )}
                    >
                      {step.title}
                      {step.optional && (
                        <span className="block text-xs text-gray-400 font-normal mt-1 bg-gray-100 px-2 py-0.5 rounded-full">
                          optional
                        </span>
                      )}
                    </h3>
                    {step.description && (
                      <p
                        className={cn(
                          "mt-2 transition-all duration-200 leading-tight",
                          {
                            "text-blue-600/70": current,
                            "text-gray-600": past || completed,
                            "text-gray-400": future,
                          },
                          size === "sm" && "text-xs",
                          size === "md" && "text-xs",
                          size === "lg" && "text-sm"
                        )}
                      >
                        {step.description}
                      </p>
                    )}
                  </button>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center flex-1 px-2 mt-5">
                  <div
                    className={cn(
                      "w-full transition-all duration-500 rounded-full",
                      connectorClasses[size],
                      {
                        "bg-blue-600": past || completed,
                        "bg-gray-300": future,
                      }
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default EnhancedProgressStepper;
