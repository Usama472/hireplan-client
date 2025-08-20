"use client";

import { AIRankingStep } from "@/components/dashboard/jobs/common/ai-ranking-step";
import { BookingPageStep } from "@/components/dashboard/jobs/common/booking-page-step";
import { CompanyPositionDetailsStep } from "@/components/dashboard/jobs/common/company-position-details-step";
import { ComplianceDepartmentStep } from "@/components/dashboard/jobs/common/compliance-department-step";
import { HoursScheduleBenefitsStep } from "@/components/dashboard/jobs/common/hours-schedule-benefits-step";
import { JobAdStep } from "@/components/dashboard/jobs/common/job-ad-step";
import { JobQualificationsStep } from "@/components/dashboard/jobs/common/job-qualifications-step";
import { PostingScheduleBudgetStep } from "@/components/dashboard/jobs/common/posting-schedule-budget-step";
import { ReviewPublishStep } from "@/components/dashboard/jobs/common/review-publish-step";
import { StepNavigation } from "@/components/main/signup/stepNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/constants";
import { stepFields } from "@/constants/form-constants";
import {
  JOB_FORM_DEFAULT_VALUES,
  JOB_FORM_TEST_DATA,
} from "@/constants/job-form-defaults";
import API from "@/http";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { errorResolver } from "@/lib/utils";
import {
  jobFormSchema,
  type JobFormSchema,
} from "@/lib/validations/forms/job-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Database, FileText, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Draft Management Constants
const DRAFT_STORAGE_KEY = "job_creation_draft";
const DRAFT_TIMESTAMP_KEY = "job_creation_draft_timestamp";

// Helper function to get user-specific storage keys
const getDraftStorageKey = (userId: string) => `${DRAFT_STORAGE_KEY}_${userId}`;
const getDraftTimestampKey = (userId: string) =>
  `${DRAFT_TIMESTAMP_KEY}_${userId}`;

interface DraftData {
  formData: JobFormSchema;
  currentStep: number;
  timestamp: number;
  userId: string;
}

// ✅ Clean Professional Progress Bar
function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const percentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full mb-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Jobs</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <p className="text-sm font-medium text-gray-700">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-blue-600">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Draft Management Functions
const saveDraftToStorage = (
  formData: JobFormSchema,
  currentStep: number,
  userId: string
) => {
  try {
    const draftData: DraftData = {
      formData,
      currentStep,
      timestamp: Date.now(),
      userId,
    };
    const storageKey = getDraftStorageKey(userId);
    const timestampKey = getDraftTimestampKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(draftData));
    localStorage.setItem(timestampKey, Date.now().toString());
  } catch (error) {
    console.warn("Failed to save draft to localStorage:", error);
  }
};

const loadDraftFromStorage = (userId: string): DraftData | null => {
  try {
    const storageKey = getDraftStorageKey(userId);
    const timestampKey = getDraftTimestampKey(userId);
    const draftData = localStorage.getItem(storageKey);
    const timestamp = localStorage.getItem(timestampKey);

    if (!draftData || !timestamp) return null;

    const parsed: DraftData = JSON.parse(draftData);

    // Verify the draft belongs to the current user
    if (parsed.userId !== userId) {
      clearDraftFromStorage(userId);
      return null;
    }

    const draftAge = Date.now() - parseInt(timestamp);

    // Auto-delete drafts older than 7 days
    if (draftAge > 7 * 24 * 60 * 60 * 1000) {
      clearDraftFromStorage(userId);
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Failed to load draft from localStorage:", error);
    return null;
  }
};

const clearDraftFromStorage = (userId: string) => {
  try {
    const storageKey = getDraftStorageKey(userId);
    const timestampKey = getDraftTimestampKey(userId);
    localStorage.removeItem(storageKey);
    localStorage.removeItem(timestampKey);
  } catch (error) {
    console.warn("Failed to clear draft from localStorage:", error);
  }
};

// Load Draft Button Component
function LoadDraftButton({
  onLoadDraft,
  onClearDraft,
  draftInfo,
}: {
  onLoadDraft: () => void;
  onClearDraft: () => void;
  draftInfo: { step: number; timestamp: number } | null;
}) {
  if (!draftInfo) return null;

  const formatDraftAge = (timestamp: number) => {
    const age = Date.now() - timestamp;
    const hours = Math.floor(age / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Draft Available
            </h3>
            <p className="text-xs text-gray-600">
              Step {draftInfo.step} • {formatDraftAge(draftInfo.timestamp)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLoadDraft}
            className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Load Draft
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearDraft}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            Clear Draft
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CreateJob() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{
    step: number;
    timestamp: number;
  } | null>(null);
  const navigate = useNavigate();
  // Changed from 6 to 7 to match the number of steps in renderCurrentStep, including the new booking page step
  const totalSteps = 7;
  const { data: authSession } = useAuthSessionContext();
  const userId = authSession?.user?.id || "anonymous";

  // Log for debugging
  console.log("Current step and total steps:", { currentStep, totalSteps });

  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: JOB_FORM_DEFAULT_VALUES,
    mode: "onChange",
  });

  const { trigger, clearErrors, setValue, watch, reset } = form;

  // Check for existing draft on component mount
  useEffect(() => {
    const draft = loadDraftFromStorage(userId);
    if (draft) {
      setDraftInfo({ step: draft.currentStep, timestamp: draft.timestamp });
    }
  }, [userId]);

  // Auto-save draft on form data changes
  useEffect(() => {
    const subscription = watch((formData) => {
      if (Object.keys(formData).length > 0) {
        saveDraftToStorage(formData as JobFormSchema, currentStep, userId);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, currentStep, userId]);

  const loadDraft = () => {
    const draft = loadDraftFromStorage(userId);
    if (draft) {
      reset(draft.formData);
      setCurrentStep(draft.currentStep);
      setDraftInfo(null);
      toast.success(`Draft loaded from step ${draft.currentStep}!`);
    }
  };

  const clearDraft = () => {
    clearDraftFromStorage(userId);
    setDraftInfo(null);
    toast.success("Draft cleared successfully!");
  };

  const loadTestData = () => {
    Object.keys(JOB_FORM_TEST_DATA).forEach((key) => {
      setValue(key as keyof JobFormSchema, (JOB_FORM_TEST_DATA as any)[key]);
    });
    toast.success("Test data loaded successfully!");
  };

  const handleNext = async () => {
    clearErrors();

    // Skip validation for steps 5 and 7 (AI Ranking and Review)
    // But require validation for step 6 (Booking Page)
    if (currentStep === 5) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      return;
    }

    if (currentStep === 7) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      return;
    }

    // Special validation for Booking Page step
    if (currentStep === 6) {
      const isValid = await trigger("availabilityId", {
        shouldFocus: true,
      });

      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
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
    }
  };

  const handlePrevious = () => {
    clearErrors();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    // Scroll to top when going to previous step
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Add debugging for the submission condition
  const onSubmit = async (data: JobFormSchema) => {
    console.log("onSubmit called with data:", data);

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
      console.log("Attempting to create job with data:", data);
      await API.job.createJob(data);
      // Clear draft after successful submission
      clearDraftFromStorage(userId);
      toast.success("Job created successfully!");
      navigate(ROUTES.DASHBOARD.MAIN);
    } catch (err) {
      const errorMessage = errorResolver(err);
      console.error("Error creating job:", err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="relative">
            <JobAdStep />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadTestData}
                    className="absolute top-4 right-4 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Load Data
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Load sample data to test the form</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      case 2:
        return (
          <div>
            <CompanyPositionDetailsStep />
            <div className="mt-4">
              <HoursScheduleBenefitsStep />
            </div>
            <div className="mt-4">
              <ComplianceDepartmentStep />;
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <JobQualificationsStep />;
          </div>
        );
      case 4:
        return <PostingScheduleBudgetStep />;
      case 5:
        return <AIRankingStep />;
      case 6:
        return <BookingPageStep />;
      case 7:
        return (
          <>
            <ReviewPublishStep mode="publish" />
            {/* Add a direct submit button on the last step */}
            {/* <div className='mt-6 text-center'>
              <Button
                type='submit'
                className='bg-green-600 hover:bg-green-700 text-white px-8 py-2 text-lg font-semibold'
              >
                Submit Job Application
              </Button>
            </div> */}
          </>
        );
      default:
        return <JobAdStep />;
    }
  };

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        {/* Load Draft Button */}
        <LoadDraftButton
          onLoadDraft={loadDraft}
          onClearDraft={clearDraft}
          draftInfo={draftInfo}
        />

        <Card className="shadow-sm border-0 bg-white p-3">
          <CardContent className="px-8 pt-4 pb-4">
            <FormProvider {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // Prevent default form submission
                  console.log("Form submit event triggered");
                  const formData = form.getValues();
                  onSubmit(formData as JobFormSchema);
                  return false;
                }}
                className="space-y-8"
              >
                {renderCurrentStep()}
                <StepNavigation
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isFirstStep={currentStep === 1}
                  isLastStep={currentStep === totalSteps}
                  isValid={true}
                  isSubmitting={isSubmitting}
                />
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
