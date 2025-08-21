"use client";

import { BookingPageStep } from "@/components/dashboard/jobs/common/booking-page-step";
import { JobAdStep } from "@/components/dashboard/jobs/common/job-ad-step";
import { PositionDetailsStep } from "@/components/dashboard/jobs/common/position-details-step";
import { ReviewPublishStep } from "@/components/dashboard/jobs/common/review-publish-step";
import { SettingsNotificationsStep } from "@/components/dashboard/jobs/common/settings-notifications-step";
import { StepNavigation } from "@/components/main/signup/stepNavigation";
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

  const handleNext = async () => {
    clearErrors();

    // Skip validation for CustomQuestionsBuilder step
    if (currentStep === 4) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      return;
    }

    // Special validation for Booking Page step
    if (currentStep === 5) {
      const isValid = await trigger("availabilityId", {
        shouldFocus: true,
      });

      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, 6));
      }
      return;
    }

    const fieldsToValidate = stepFields[currentStep as keyof typeof stepFields];
    const isStepValid = await trigger(fieldsToValidate as any, {
      shouldFocus: true,
    });

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      clearErrors();
    }
  };

  const handlePrevious = () => {
    clearErrors();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: JobFormSchema) => {
    if (currentStep !== 6 || !job?.id) return;

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
        automation: automationRest,
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
        return (
          <CustomQuestionsBuilder
            name="customQuestions"
            label="Custom Screening Questions"
            description="Add custom questions to screen applicants and gather specific information during the application process"
          />
        );
      case 5:
        return <BookingPageStep />;
      case 6:
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

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
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
        </div>

        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-8 sm:p-12">
            <FormProvider {...form}>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {renderCurrentStep()}
                  <StepNavigation
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    isFirstStep={currentStep === 1}
                    isLastStep={currentStep === 6}
                    isValid={true}
                    isSubmitting={isSubmitting}
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
