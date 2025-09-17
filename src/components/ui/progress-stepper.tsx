import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressStepper({
  steps,
  currentStep,
  completedSteps = [],
  variant = 'horizontal',
  size = 'md',
  className,
}: ProgressStepperProps) {
  const isCompleted = (stepIndex: number) => completedSteps.includes(stepIndex + 1);
  const isCurrent = (stepIndex: number) => currentStep === stepIndex + 1;
  const isPast = (stepIndex: number) => currentStep > stepIndex + 1;

  const stepSizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const connectorClasses = {
    sm: variant === 'horizontal' ? 'h-0.5' : 'w-0.5',
    md: variant === 'horizontal' ? 'h-1' : 'w-1',
    lg: variant === 'horizontal' ? 'h-1.5' : 'w-1.5',
  };

  if (variant === 'vertical') {
    return (
      <div className={cn('flex flex-col space-y-4', className)}>
        {steps.map((step, index) => {
          const completed = isCompleted(index);
          const current = isCurrent(index);
          const past = isPast(index);

          return (
            <div key={step.id} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full border-2 font-medium transition-all duration-200',
                    stepSizeClasses[size],
                    {
                      'bg-primary border-primary text-white': completed || current,
                      'bg-gray-100 border-gray-300 text-gray-500': !completed && !current && !past,
                      'bg-gray-200 border-gray-400 text-gray-600': past && !completed,
                    }
                  )}
                >
                  {completed ? (
                    <Check className={cn('w-3 h-3', size === 'sm' && 'w-2 h-2', size === 'lg' && 'w-4 h-4')} />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'mt-2 bg-gray-300 transition-colors duration-200',
                      connectorClasses[size],
                      {
                        'bg-primary': past || completed,
                        'h-8': size === 'sm',
                        'h-10': size === 'md',
                        'h-12': size === 'lg',
                      }
                    )}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    'font-medium transition-colors duration-200',
                    {
                      'text-primary': current || completed,
                      'text-gray-900': past && !completed,
                      'text-gray-500': !current && !past && !completed,
                    },
                    size === 'sm' && 'text-sm',
                    size === 'lg' && 'text-lg'
                  )}
                >
                  {step.title}
                  {step.optional && (
                    <span className="ml-2 text-xs text-gray-400 font-normal">(optional)</span>
                  )}
                </h3>
                {step.description && (
                  <p
                    className={cn(
                      'mt-1 transition-colors duration-200',
                      {
                        'text-primary/70': current,
                        'text-gray-600': past || completed,
                        'text-gray-400': !current && !past && !completed,
                      },
                      size === 'sm' && 'text-xs',
                      size === 'md' && 'text-sm',
                      size === 'lg' && 'text-base'
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {steps.map((step, index) => {
        const completed = isCompleted(index);
        const current = isCurrent(index);
        const past = isPast(index);

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center space-y-2 flex-1">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full border-2 font-medium transition-all duration-200',
                  stepSizeClasses[size],
                  {
                    'bg-primary border-primary text-white': completed || current,
                    'bg-gray-100 border-gray-300 text-gray-500': !completed && !current && !past,
                    'bg-gray-200 border-gray-400 text-gray-600': past && !completed,
                  }
                )}
              >
                {completed ? (
                  <Check className={cn('w-3 h-3', size === 'sm' && 'w-2 h-2', size === 'lg' && 'w-4 h-4')} />
                ) : (
                  index + 1
                )}
              </div>
              <div className="text-center max-w-24">
                <h3
                  className={cn(
                    'font-medium transition-colors duration-200 leading-tight',
                    {
                      'text-primary': current || completed,
                      'text-gray-900': past && !completed,
                      'text-gray-500': !current && !past && !completed,
                    },
                    size === 'sm' && 'text-xs',
                    size === 'md' && 'text-sm',
                    size === 'lg' && 'text-base'
                  )}
                >
                  {step.title}
                  {step.optional && (
                    <span className="block text-xs text-gray-400 font-normal">(optional)</span>
                  )}
                </h3>
                {step.description && (
                  <p
                    className={cn(
                      'mt-1 transition-colors duration-200 leading-tight',
                      {
                        'text-primary/70': current,
                        'text-gray-600': past || completed,
                        'text-gray-400': !current && !past && !completed,
                      },
                      size === 'sm' && 'text-xs',
                      size === 'md' && 'text-xs',
                      size === 'lg' && 'text-sm'
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 mx-2 bg-gray-300 transition-colors duration-200',
                  connectorClasses[size],
                  {
                    'bg-primary': past || completed,
                  }
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default ProgressStepper;
