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
import { Badge } from "@/components/ui/badge";
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
import { Database, FileText, RotateCcw, Sparkles, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { SaveAsTemplateDialog } from "./SaveAsTemplateDialog";
import type { JobTemplate } from "@/types/job-template";

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
            className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 rounded-xl h-10 px-4 font-medium shadow-none transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Load Draft
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearDraft}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-10 px-4 font-medium shadow-none transition-all duration-200"
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
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(
    null
  );
  const [draftInfo, setDraftInfo] = useState<{
    step: number;
    timestamp: number;
  } | null>(null);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { data: authSession, subscription } = useAuthSessionContext();
  const userId = authSession?.user?.id || "anonymous";

  // Check if user has Professional+ subscription for AI features
  const hasProfessionalFeatures =
    subscription?.planId === "professional" ||
    subscription?.planId === "enterprise";

  // Adjust total steps based on subscription - AI step (5) is only for Professional+
  const totalSteps = hasProfessionalFeatures ? 7 : 6;

  // Log for debugging
  console.log("Current step and total steps:", { currentStep, totalSteps });

  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: JOB_FORM_DEFAULT_VALUES,
    mode: "onChange",
  });

  const { trigger, clearErrors, setValue, watch, reset } = form;

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

  // Template handling functions
  const handleSelectTemplate = (template: JobTemplate) => {
    setSelectedTemplate(template);

    // Convert template data to form format
    const templateFormData: Partial<JobFormSchema> = {
      jobTitle: template.jobTitle,
      jobBoardTitle: template.jobBoardTitle || template.jobTitle,
      jobDescription: template.jobDescription,
      department: template.department || "",
      customDepartment: template.customDepartment || "",
      workplaceType: template.workplaceType as any,
      employmentType: template.employmentType as any,
      workSetting: template.workSetting || "",
      country: template.country || "US",
      language: template.language || "en",
      hiringTimeline:
        (template.hiringTimeline as
          | "1-3-days"
          | "3-7-days"
          | "1-2-weeks"
          | "2-4-weeks"
          | "more-than-4-weeks") || "1-2-weeks",
      educationRequirement: template.educationRequirement || "",
      payType: template.payType as any,
      backgroundScreeningDisclaimer:
        template.backgroundScreeningDisclaimer || false,
    };

    // Handle job location
    if (template.jobLocation) {
      templateFormData.jobLocation = {
        address: template.jobLocation.address,
        city: template.jobLocation.city,
        state: template.jobLocation.state,
        country: template.jobLocation.country,
        zipCode: template.jobLocation.zipCode || "",
      };
    }

    // Handle pay rate
    if (template.payRate) {
      templateFormData.payRate = template.payRate as any;
    }

    // Handle qualifications (convert weight to score)
    if (template.requiredQualifications) {
      templateFormData.requiredQualifications =
        template.requiredQualifications.map((q) => ({
          text: q.text,
          score: q.weight || 1,
        }));
    }
    if (template.preferredQualifications) {
      templateFormData.preferredQualifications =
        template.preferredQualifications.map((q) => ({
          text: q.text,
          score: q.weight || 1,
        }));
    }

    // Handle job requirements
    if (template.jobRequirements) {
      templateFormData.jobRequirements = template.jobRequirements;
    }

    // Handle custom questions
    if (template.customQuestions) {
      templateFormData.customQuestions = template.customQuestions as any;
    }

    // Handle schedule and hours (convert to proper format)
    if (template.hoursPerWeek) {
      templateFormData.hoursPerWeek = {
        type:
          template.hoursPerWeek.min && template.hoursPerWeek.max
            ? "range"
            : "fixed-hours",
        min: template.hoursPerWeek.min,
        max: template.hoursPerWeek.max,
      } as any;
    }
    if (template.schedule) {
      templateFormData.schedule = template.schedule;
    }

    // Handle benefits
    if (template.benefits) {
      templateFormData.benefits = template.benefits;
    }

    // Only apply AI automation settings if user has Professional+ plan and template has them
    if (hasProfessionalFeatures && (template as any).automation) {
      templateFormData.automation = (template as any).automation;
    }

    // Apply template data to form
    Object.entries(templateFormData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        setValue(key as keyof JobFormSchema, value as any);
      }
    });

    toast.success(`Template "${template.name}" applied successfully!`);
  };

  // Check for existing draft on component mount and handle template from navigation
  useEffect(() => {
    const draft = loadDraftFromStorage(userId);
    if (draft && !location.state?.editMode) {
      // Only load draft if we're not in edit mode
      setDraftInfo({ step: draft.currentStep, timestamp: draft.timestamp });
    }

    // Check if we came from template selection or edit mode
    if (location.state?.selectedTemplate) {
      const template = location.state.selectedTemplate as JobTemplate;
      const isEditMode = location.state.editMode;

      if (isEditMode) {
        setIsEditingTemplate(true);
        setEditingTemplateId(location.state.templateId);
      }

      handleSelectTemplate(template);
      // Clear the navigation state to prevent re-applying on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [userId]); // Removed dependencies that cause infinite loops

  const loadTestData = () => {
    Object.keys(JOB_FORM_TEST_DATA).forEach((key) => {
      setValue(key as keyof JobFormSchema, (JOB_FORM_TEST_DATA as any)[key]);
    });
    toast.success("Test data loaded successfully!");
  };

  const handleNext = async () => {
    clearErrors();

    // Skip validation for AI Ranking step (5) and Review step (7/6)
    // But require validation for Booking Page step (6/5)
    if (currentStep === 5 && hasProfessionalFeatures) {
      // AI Ranking step - skip validation for Professional+ users
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      return;
    }

    if (currentStep === 4 && !hasProfessionalFeatures) {
      // For non-Professional users, skip AI step (5) and go directly to Booking Page (6->5)
      setCurrentStep(5); // This will be the Booking Page for non-Professional users
      return;
    }

    if (
      (currentStep === 7 && hasProfessionalFeatures) ||
      (currentStep === 6 && !hasProfessionalFeatures)
    ) {
      // Review step - skip validation
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      return;
    }

    // Special validation for Booking Page step (step 6 for Professional+, step 5 for Starter)
    const isBookingPageStep =
      (hasProfessionalFeatures && currentStep === 6) ||
      (!hasProfessionalFeatures && currentStep === 5);
    if (isBookingPageStep) {
      // Get current availabilityId value
      const availabilityId = watch("availabilityId");

      // If no template is selected, automatically select the default one
      if (!availabilityId) {
        try {
          // Fetch default availability template
          const response = await API.availability.getAvailabilityTemplates();

          if (
            response &&
            response.availabilities &&
            response.availabilities.length > 0
          ) {
            // Use the first template as default
            const defaultTemplate = response.availabilities[0];
            setValue("availabilityId", defaultTemplate.id);
            toast.success(
              "Default availability template selected automatically"
            );
          } else {
            toast.error(
              "No availability templates found. Please create one first."
            );
            return;
          }
        } catch (error) {
          console.error("Error fetching availability templates:", error);
          toast.error(
            "Failed to select default template. Please select one manually."
          );
          return;
        }
      }

      // Always validate after potentially setting the default
      const isValid = await trigger("availabilityId", {
        shouldFocus: true,
      });

      if (isValid) {
        // Pre-fetch the template for the review step to ensure it's ready
        try {
          await API.availability.getAvailabilityTemplates();
        } catch (error) {
          console.error("Error pre-fetching templates for review:", error);
        }

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

    // Handle skipping AI step for non-Professional users when going backwards
    if (currentStep === 5 && !hasProfessionalFeatures) {
      // For non-Professional users, step 5 is Booking Page, so go back to step 4
      setCurrentStep(4);
    } else if (currentStep === 6 && !hasProfessionalFeatures) {
      // For non-Professional users, step 6 is Review, so go back to step 5 (Booking Page)
      setCurrentStep(5);
    } else if (currentStep === 6 && hasProfessionalFeatures) {
      // For Professional+ users, step 6 is Booking Page, go back to step 5 (AI)
      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }

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
      const { automation, ...rest } = data;

      // Create automation object with required fields
      const automationData = {
        enabledRules: automation?.enabledRules || [],
        sectionWeights: automation?.sectionWeights || {
          requiredQualifications: 25,
          preferredQualifications: 15,
          preScreeningQuestions: 35,
          resume: 25,
        },
        sectionThresholds: automation?.sectionThresholds || {
          requiredQualifications: { autoReject: 30, manualReview: 70 },
          preferredQualifications: { autoReject: 20, manualReview: 60 },
          preScreeningQuestions: { autoReject: 40, manualReview: 80 },
          resume: { autoReject: 30, manualReview: 70 },
        },
        acceptanceThreshold: automation?.acceptanceThreshold || 80,
        manualReviewThreshold: automation?.manualReviewThreshold || 50,
        questionAutoFail: automation?.questionAutoFail || [],
        questionCriteria: automation?.questionCriteria || {},
        jobRules: automation?.jobRules || [],
        template: automation?.template || null,
      };

      const newData = {
        ...rest,
        automation: automationData,
      };

      await API.job.createJob(newData);
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
        if (hasProfessionalFeatures) {
          return <AIRankingStep />;
        } else {
          // For non-Professional users, step 5 is the Booking Page
          return <BookingPageStep />;
        }
      case 6:
        if (hasProfessionalFeatures) {
          return <BookingPageStep />;
        } else {
          // For non-Professional users, step 6 is the Review step
          return (
            <>
              <ReviewPublishStep mode="publish" />
            </>
          );
        }
      case 7:
        // Only for Professional+ users
        return (
          <>
            <ReviewPublishStep mode="publish" />
          </>
        );
      default:
        return <JobAdStep />;
    }
  };

  return (
    <main className="pb-16">
      {/* Enhanced Header */}
      <div className="bg-primary border-b border-primary/20 px-6 py-4 relative overflow-hidden max-h-[80px]">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white">Create New Job</h1>
                <p className="text-sm text-white/80 flex items-center gap-3">
                  Set up your job posting with detailed requirements and
                  preferences
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/20 text-xs"
                  >
                    Step {currentStep} of {totalSteps}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Template Action Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveTemplateDialog(true)}
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white rounded-xl h-9 px-4 font-medium transition-all duration-200 backdrop-blur-sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate(ROUTES.DASHBOARD.JOB_TEMPLATES, {
                      state: { fromJobCreation: true },
                    })
                  }
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white rounded-xl h-9 px-4 font-medium transition-all duration-200 backdrop-blur-sm"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  {selectedTemplate ? "Change Template" : "Browse Templates"}
                </Button>
              </div>

              <div className="h-8 w-px bg-white/20" />

              {/* Progress Display */}
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%
                </div>
                <p className="text-sm text-white/80 font-medium">Complete</p>
              </div>
              {/* Progress Bar */}
              <div className="w-32">
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${Math.round(
                        ((currentStep - 1) / (totalSteps - 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Template Status & Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {selectedTemplate && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Using template: {selectedTemplate.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(ROUTES.DASHBOARD.JOB_TEMPLATES)}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            )}

            <LoadDraftButton
              onLoadDraft={loadDraft}
              onClearDraft={clearDraft}
              draftInfo={draftInfo}
            />
          </div>
        </div>

        <Card className="shadow-none border-0 bg-white p-3">
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
                  finalStepText="Create Job"
                  isSubmitting={isSubmitting}
                />
              </form>
            </FormProvider>
          </CardContent>
        </Card>

        {/* Save as Template Dialog */}
        <SaveAsTemplateDialog
          isOpen={showSaveTemplateDialog}
          onClose={() => setShowSaveTemplateDialog(false)}
          formData={form.getValues()}
          isEditMode={isEditingTemplate}
          templateId={editingTemplateId || undefined}
          existingTemplate={
            selectedTemplate
              ? {
                  name: selectedTemplate.name,
                  description: selectedTemplate.description,
                  category: selectedTemplate.category,
                  tags: selectedTemplate.tags,
                  isPublic: selectedTemplate.isPublic,
                }
              : undefined
          }
          onSaved={() => {
            if (isEditingTemplate) {
              toast.success("Template updated! Changes have been saved.", {
                action: {
                  label: "View Templates",
                  onClick: () => navigate(ROUTES.DASHBOARD.JOB_TEMPLATES),
                },
              });
              // Reset edit mode
              setIsEditingTemplate(false);
              setEditingTemplateId(null);
            } else {
              toast.success(
                "Template saved! You can now use it when creating new jobs.",
                {
                  action: {
                    label: "View Templates",
                    onClick: () => navigate(ROUTES.DASHBOARD.JOB_TEMPLATES),
                  },
                }
              );
            }
          }}
        />
      </div>
    </main>
  );
}
