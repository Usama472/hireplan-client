"use client";

import { AIAnalysisStep } from "@/components/dashboard/jobs/common/ai-analysis-step";
import { BookingPageStep } from "@/components/dashboard/jobs/common/booking-page-step";
import { CustomAutomationStep } from "@/components/dashboard/jobs/common/custom-automation-step";
import { JobAdStep } from "@/components/dashboard/jobs/common/job-ad-step";
import { PositionDetailsStep } from "@/components/dashboard/jobs/common/position-details-step";
import { ReviewPublishStep } from "@/components/dashboard/jobs/common/review-publish-step";
import { SettingsNotificationsStep } from "@/components/dashboard/jobs/common/settings-notifications-step";
import { StepControls } from "@/components/main/signup/stepNavigation";
import {
  EnhancedProgressStepper,
  type Step,
} from "@/components/ui/enhanced-progress-stepper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants";
import { stepFields } from "@/constants/form-constants";
import { JOB_FORM_DEFAULT_VALUES } from "@/constants/job-form-defaults";
import API from "@/http";
import type { JobFormData } from "@/interfaces";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { errorResolver } from "@/lib/utils";
import {
  jobFormSchema,
  type JobFormSchema,
} from "@/lib/validations/forms/job-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CustomQuestionsBuilder } from "../common/custom-questions-builder";

interface JobDetailsResponse {
  job: JobFormData & {
    id: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isRetrying: boolean;
}

// Add default values helper function
const getJobDefaults = (
  job: JobDetailsResponse["job"] | null
): JobFormSchema => {
  if (!job) return JOB_FORM_DEFAULT_VALUES;

  // Start with the default values to ensure we have all required fields
  const defaults = { ...JOB_FORM_DEFAULT_VALUES };

  // Override with job data when available
  return {
    ...defaults,
    // Step 1: Job Ad
    jobTitle: job.jobTitle || defaults.jobTitle,
    jobBoardTitle: job.jobBoardTitle || defaults.jobBoardTitle,
    jobDescription: job.jobDescription || defaults.jobDescription,
    backgroundScreeningDisclaimer:
      job.backgroundScreeningDisclaimer ||
      defaults.backgroundScreeningDisclaimer,

    // Step 2: Position Details
    jobStatus: job.jobStatus || defaults.jobStatus,
    workplaceType: job.workplaceType || defaults.workplaceType,
    jobLocation: job.jobLocation || defaults.jobLocation,
    employmentType: job.employmentType || defaults.employmentType,
    educationRequirement:
      job.educationRequirement || defaults.educationRequirement,
    department: job.department || defaults.department,
    customDepartment: job.customDepartment || defaults.customDepartment,
    payType: job.payType || defaults.payType,
    payRate: job.payRate || defaults.payRate,
    positionsToHire: job.positionsToHire || defaults.positionsToHire,
    jobRequirements: job.jobRequirements || defaults.jobRequirements,
    exemptStatus: job.exemptStatus || defaults.exemptStatus,
    eeoJobCategory: job.eeoJobCategory || defaults.eeoJobCategory,

    // Step 3: Hours, Schedule & Benefits - adding missing required fields
    hoursPerWeek: job.hoursPerWeek || defaults.hoursPerWeek,
    schedule: job.schedule || defaults.schedule,
    benefits: job.benefits || defaults.benefits,
    country: job.country || defaults.country,
    language: job.language || defaults.language,
    jobLocationWorkType:
      job.jobLocationWorkType || defaults.jobLocationWorkType,
    remoteLocationRequirement:
      job.remoteLocationRequirement || defaults.remoteLocationRequirement,
    hasConsistentStartingLocation:
      job.hasConsistentStartingLocation ||
      defaults.hasConsistentStartingLocation,
    operatingArea: job.operatingArea || defaults.operatingArea,

    // Step 4: Qualifications
    requiredQualifications:
      job.requiredQualifications || defaults.requiredQualifications,
    preferredQualifications:
      job.preferredQualifications || defaults.preferredQualifications,
    customQuestions: job.customQuestions || defaults.customQuestions,

    // Step 5: Posting Schedule & Budget
    startDate: job.startDate || defaults.startDate,
    endDate: job.endDate || defaults.endDate,
    runIndefinitely: job.runIndefinitely || defaults.runIndefinitely,
    dailyBudget: job.dailyBudget || defaults.dailyBudget,
    monthlyBudget: job.monthlyBudget || defaults.monthlyBudget,
    indeedBudget: job.indeedBudget || defaults.indeedBudget,
    zipRecruiterBudget: job.zipRecruiterBudget || defaults.zipRecruiterBudget,
    customApplicationUrl:
      job.customApplicationUrl || defaults.customApplicationUrl,
    externalApplicationSetup:
      job.externalApplicationSetup || defaults.externalApplicationSetup,

    // Step 6: AI Ranking & Automation
    automation: job.automation || defaults.automation,
    automations: job.automations || defaults.automations,

    // Resume Analysis fields
    resumeAnalysisMode: job.resumeAnalysisMode || defaults.resumeAnalysisMode,
    resumeCriteria: job.resumeCriteria || defaults.resumeCriteria,

    // Step 7: Email Templates
    emailTemplates: job.emailTemplates || defaults.emailTemplates,

    // Step 8: Booking Page - updated field name
    availabilityId: job.availabilityId || "",
  };
};

// Loading skeleton components
const FormSkeleton = () => (
  <div className="space-y-8">
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

export default function EditJob() {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [job, setJob] = useState<JobDetailsResponse["job"] | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
    isRetrying: false,
  });
  const navigate = useNavigate();
  const { subscription } = useAuthSessionContext();

  // Check if user has Professional/Enterprise plan (custom pricing)
  const hasProfessionalFeatures =
    subscription?.planId === "professional" ||
    subscription?.planId === "enterprise";

  // Define steps for the progress stepper
  const getSteps = (): Step[] => {
    const baseSteps: Step[] = [
      {
        id: "job-ad",
        title: "Job Details",
        description: "Basic job information",
      },
      {
        id: "position",
        title: "Position Details",
        description: "Role details and company info",
      },
      {
        id: "settings",
        title: "Settings",
        description: "Job settings and notifications",
      },
    ];

    if (hasProfessionalFeatures) {
      baseSteps.push(
        {
          id: "ai-analysis",
          title: "AI Analysis",
          description: "Resume screening & AI overview",
          optional: true,
        },
        {
          id: "automation",
          title: "Automation",
          description: "Automated workflows",
          optional: true,
        },
        {
          id: "booking",
          title: "Interview Booking",
          description: "Schedule interviews",
        },
        {
          id: "review",
          title: "Review & Update",
          description: "Final review and update",
        }
      );
    } else {
      baseSteps.push(
        {
          id: "questions",
          title: "Questions",
          description: "Custom screening questions",
          optional: true,
        },
        {
          id: "automation",
          title: "Automation",
          description: "Automated workflows",
          optional: true,
        },
        {
          id: "booking",
          title: "Interview Booking",
          description: "Schedule interviews",
        },
        {
          id: "review",
          title: "Review & Update",
          description: "Final review and update",
        }
      );
    }

    return baseSteps;
  };

  const steps = getSteps();
  const totalSteps = steps.length;

  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: JOB_FORM_DEFAULT_VALUES,
    mode: "onChange",
  });

  const { trigger, handleSubmit, clearErrors, reset, getValues } = form;

  const startDate = getValues("startDate");

  console.log("::: startDate", startDate);

  const fetchJobDetails = async (showRetryIndicator = false) => {
    if (!id) {
      setLoadingState({
        isLoading: false,
        error: "Job ID is required",
        isRetrying: false,
      });
      return;
    }

    try {
      setLoadingState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isRetrying: showRetryIndicator,
      }));

      const response: JobDetailsResponse = await API.job.getJobDetails(id);

      console.log("JobDetailsResponse", response.job);

      if (!response?.job) {
        throw new Error("Job not found");
      }

      setJob(response.job);

      const jobDefaults = getJobDefaults(response.job);
      reset(jobDefaults);

      setLoadingState({
        isLoading: false,
        error: null,
        isRetrying: false,
      });
    } catch (error) {
      const errorMessage = errorResolver(error);
      console.error("Error fetching job details:", error);

      setLoadingState({
        isLoading: false,
        error: errorMessage,
        isRetrying: false,
      });

      toast.error(`Failed to load job details: ${errorMessage}`);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleRetry = () => {
    fetchJobDetails(true);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNext = async () => {
    clearErrors();

    // Skip validation for AI Analysis step (step 4 for Professional users)
    if (currentStep === 4 && hasProfessionalFeatures) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      scrollToTop();
      return;
    }

    // Skip validation for CustomQuestionsBuilder step (step 4 for non-Professional users)
    if (currentStep === 4 && !hasProfessionalFeatures) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      scrollToTop();
      return;
    }

    // Skip validation for Custom Automation step
    if (
      (currentStep === 5 && hasProfessionalFeatures) ||
      (currentStep === 5 && !hasProfessionalFeatures)
    ) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      scrollToTop();
      return;
    }

    // Special validation for Booking Page step
    const isBookingPageStep =
      (hasProfessionalFeatures && currentStep === 6) ||
      (!hasProfessionalFeatures && currentStep === 6);

    if (isBookingPageStep) {
      const isValid = await trigger("availabilityId", {
        shouldFocus: true,
      });

      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
        scrollToTop();
      }
      return;
    }

    const fieldsToValidate = stepFields[currentStep as keyof typeof stepFields];
    const isStepValid = await trigger(fieldsToValidate as any, {
      shouldFocus: true,
    });

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      clearErrors();
      scrollToTop();
    }
  };

  const handlePrevious = () => {
    clearErrors();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    scrollToTop();
  };

  const onSubmit = async (data: JobFormSchema) => {
    if (currentStep !== totalSteps || !job?.id) return;

    // Validate the required availabilityId field
    const isValid = await trigger("availabilityId");
    if (!isValid) {
      toast.error(
        "Please select an availability template for interview scheduling"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { automation, ...rest } = data;
      const {
        questionAutoFail,
        enabledRules,
        acceptanceThreshold,
        manualReviewThreshold,
        questionCriteria,
        jobRules,
        ...automationRest
      } = automation;
      console.log("automation", automation);
      const newData = {
        ...rest,
        company: job.company,
        automation: {
          ...automationRest,
          enabledRules: enabledRules || [],
          questionAutoFail: questionAutoFail || [],
          questionCriteria: questionCriteria || {},
          jobRules: jobRules || [],
          acceptanceThreshold: acceptanceThreshold || 80,
          manualReviewThreshold: manualReviewThreshold || 50,
        },
        automations: data.automations,
      };
      const response = await API.job.updateJob(job.id, newData);
      console.log("response", response);
      toast.success("Job updated successfully!");
      navigate(`${ROUTES.DASHBOARD.MAIN}`);
    } catch (err) {
      const errorMessage = errorResolver(err);
      toast.error(`Failed to update job: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <JobAdStep />;
      case 2:
        return <PositionDetailsStep />;
      case 3:
        return <SettingsNotificationsStep />;
      case 4:
        if (hasProfessionalFeatures) {
          // AI Analysis step for Professional users
          return <AIAnalysisStep />;
        } else {
          // Custom Questions step for non-Professional users
          return (
            <CustomQuestionsBuilder
              name="customQuestions"
              label="Custom Screening Questions"
              description="Add custom questions to screen applicants and gather specific information during the application process"
            />
          );
        }
      case 5:
        return (
          <CustomAutomationStep
            isSelectable={true}
            automations={getValues("automations") || []}
            onSelectionChange={(selectedIds) => {
              form.setValue("automations", selectedIds);
            }}
          />
        );
      case 6:
        return <BookingPageStep />;
      case 7:
        return <ReviewPublishStep />;
      default:
        return <JobAdStep />;
    }
  };

  // Loading state
  if (loadingState.isLoading && !loadingState.isRetrying) {
    return (
      <main className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-8 sm:p-12">
              <FormSkeleton />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Error state
  if (loadingState.error && !job) {
    return (
      <main className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
              className="text-gray-600 hover:text-gray-900 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Failed to Load Job
                  </h3>
                  <p className="text-gray-600 mb-4">{loadingState.error}</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={handleRetry}
                      disabled={loadingState.isRetrying}
                      className="flex items-center gap-2"
                    >
                      {loadingState.isRetrying ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {loadingState.isRetrying ? "Retrying..." : "Try Again"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
                    >
                      Back to Jobs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  // Job not found
  if (!job) {
    return (
      <main className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
              className="text-gray-600 hover:text-gray-900 -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Job Not Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    The job you're trying to edit doesn't exist or has been
                    removed.
                  </p>
                  <Button onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}>
                    Back to Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Retry indicator */}
        {loadingState.isRetrying && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800">
              Refreshing job details...
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-2">
          <Button
            variant="ghost"
            onClick={() => navigate(`${ROUTES.DASHBOARD.VIEW_JOB}/${id}`)}
            className="text-gray-600 hover:text-gray-900 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Job Details
          </Button>
        </div>

        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6 mb-6 sm:mb-8">
          {/* Mobile Header */}
          <div className="block sm:hidden mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-lg font-bold text-gray-900">Edit Job</h1>
                <p className="text-xs text-gray-600 truncate max-w-[200px]">
                  {job.jobTitle}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">
                  Updated: {new Date(job.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Job Posting
              </h1>
              <p className="text-gray-600 mt-1">
                Update your job posting:{" "}
                <span className="font-medium text-gray-900">
                  {job.jobTitle}
                </span>
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <p>
                Last updated: {new Date(job.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="w-full">
            <EnhancedProgressStepper
              steps={steps}
              currentStep={currentStep}
              completedSteps={Array.from(
                { length: currentStep - 1 },
                (_, i) => i + 1
              )}
              variant="horizontal"
              size="md"
              showProgress={true}
              clickable={true}
              onStepClick={(stepIndex) => {
                // Only allow navigation to completed steps or current step
                const targetStep = stepIndex + 1;
                if (targetStep <= currentStep) {
                  setCurrentStep(targetStep);
                }
              }}
              className="max-w-6xl mx-auto"
            />
          </div>
        </div>

        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-4 sm:p-8 lg:p-12">
            <FormProvider {...form}>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {renderCurrentStep()}
                  <StepControls
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    isFirstStep={currentStep === 1}
                    isLastStep={currentStep === totalSteps}
                    isValid={true}
                    isSubmitting={isSubmitting}
                    finalStepText="Update Job"
                  />
                </form>
              </Form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
