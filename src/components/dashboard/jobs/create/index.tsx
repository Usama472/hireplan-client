"use client";

import { AIAnalysisStep } from "@/components/dashboard/jobs/common/ai-analysis-step";
import { AIFollowupTemplateStep } from "@/components/dashboard/jobs/common/ai-followup-template-step";
import { BookingPageStep } from "@/components/dashboard/jobs/common/booking-page-step";
import { CompanyPositionDetailsStep } from "@/components/dashboard/jobs/common/company-position-details-step";
import { ComplianceDepartmentStep } from "@/components/dashboard/jobs/common/compliance-department-step";
import { CustomAutomationStep } from "@/components/dashboard/jobs/common/custom-automation-step";
import { HoursScheduleBenefitsStep } from "@/components/dashboard/jobs/common/hours-schedule-benefits-step";
import { JobAdStep } from "@/components/dashboard/jobs/common/job-ad-step";
import { JobQualificationsStep } from "@/components/dashboard/jobs/common/job-qualifications-step";
import { PostingScheduleBudgetStep } from "@/components/dashboard/jobs/common/posting-schedule-budget-step";
import { ReviewPublishStep } from "@/components/dashboard/jobs/common/review-publish-step";
import { StepControls } from "@/components/main/signup/stepNavigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  EnhancedProgressStepper,
  type Step,
} from "@/components/ui/enhanced-progress-stepper";
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
import type { JobTemplate } from "@/types/job-template";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Brain,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  FileText,
  Layers,
  RotateCcw,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SaveAsTemplateDialog } from "./SaveAsTemplateDialog";

export default function CreateJob() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(
    null
  );
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { data: authSession, subscription } = useAuthSessionContext();
  const userId = authSession?.user?.id || "anonymous";

  // Check if user has Professional/Enterprise plan (custom pricing)
  const hasProfessionalFeatures =
    subscription?.planId === "professional" ||
    subscription?.planId === "enterprise";

  const totalSteps = hasProfessionalFeatures ? 8 : 7;

  console.log("Current step and total steps:", { currentStep, totalSteps });

  // Define steps for the progress stepper
  const getSteps = (): Step[] => {
    const baseSteps: Step[] = [
      {
        id: "job-ad",
        title: "Job Details",
        description: "Basic job information",
        icon: FileText,
      },
      {
        id: "position",
        title: "Position & Company",
        description: "Role details and company info",
        icon: Briefcase,
      },
      {
        id: "qualifications",
        title: "Requirements",
        description: "Skills and qualifications",
        icon: Users,
      },
    ];

    if (hasProfessionalFeatures) {
      baseSteps.push(
        {
          id: "ai-analysis",
          title: "AI Analysis",
          description: "Resume screening & AI overview",
          optional: true,
          icon: Brain,
        },
        {
          id: "posting",
          title: "Schedule & Budget",
          description: "Posting timeline and budget",
          icon: Calendar,
        },
        {
          id: "automation",
          title: "Automation",
          description: "Automated workflows",
          optional: true,
          icon: Zap,
        },
        {
          id: "booking",
          title: "Interview Booking",
          description: "Schedule interviews",
          icon: Clock,
        },
        {
          id: "review",
          title: "Review & Publish",
          description: "Final review and publish",
          icon: CheckCircle,
        }
      );
    } else {
      baseSteps.push(
        {
          id: "posting",
          title: "Schedule & Budget",
          description: "Posting timeline and budget",
          icon: Calendar,
        },
        {
          id: "booking",
          title: "Interview Booking",
          description: "Schedule interviews",
          icon: Clock,
        },
        {
          id: "automation",
          title: "Automation",
          description: "Automated workflows",
          optional: true,
          icon: Zap,
        },
        {
          id: "review",
          title: "Review & Publish",
          description: "Final review and publish",
          icon: CheckCircle,
        }
      );
    }

    return baseSteps;
  };

  const steps = getSteps();

  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: JOB_FORM_DEFAULT_VALUES,
    mode: "onChange",
  });

  const { trigger, clearErrors, setValue, watch } = form;
  const [draftId, setDraftId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save draft functionality
  const autoSaveDraft = async (formData: JobFormSchema) => {
    try {
      const draftData = {
        title:
          formData.jobTitle ||
          `Untitled Job - ${new Date().toLocaleDateString()}`,
        formData,
        completedSections: getCompletedSections(formData),
      };

      if (draftId) {
        // Update existing draft
        await API.jobDraft.updateJobDraft(draftId, draftData);
      } else {
        // Create new draft
        const response = await API.jobDraft.createJobDraft(draftData);
        setDraftId(response.data.draft.id);
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed:", error);
      // Don't show error toast for auto-save failures
    }
  };

  const getCompletedSections = (formData: JobFormSchema) => {
    const sections = [];
    if (
      formData.jobTitle &&
      formData.jobBoardTitle &&
      formData.jobDescription
    ) {
      sections.push("job-ad");
    }
    if (formData.department && formData.payRate && formData.positionsToHire) {
      sections.push("position");
    }
    if (
      formData.requiredQualifications &&
      formData.requiredQualifications.length > 0
    ) {
      sections.push("qualifications");
    }
    if (formData.startDate && formData.endDate) {
      sections.push("schedule");
    }
    if (formData.startDate) {
      sections.push("posting");
    }
    return sections;
  };

  // Auto-save on step navigation and page unload (much better performance)
  useEffect(() => {
    // Save when user navigates between steps
    if (currentStep > 1) {
      const formData = watch();
      if (formData.jobTitle || formData.jobBoardTitle) {
        // Only if meaningful data
        autoSaveDraft({
          ...formData,
          schedule: formData.schedule || [],
          benefits: formData.benefits || [],
        });
      }
    }
  }, [currentStep]);

  // Save on page unload/navigation away
  useEffect(() => {
    const handleBeforeUnload = () => {
      const formData = watch();
      if (formData.jobTitle || formData.jobBoardTitle) {
        // Use localStorage for immediate save on page unload
        localStorage.setItem(
          "temp_job_draft",
          JSON.stringify({
            title:
              formData.jobTitle ||
              `Untitled Job - ${new Date().toLocaleDateString()}`,
            formData,
            completedSections: getCompletedSections(formData),
            timestamp: Date.now(),
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Process temp draft on component mount
  useEffect(() => {
    const tempDraft = localStorage.getItem("temp_job_draft");
    if (tempDraft) {
      try {
        const draftData = JSON.parse(tempDraft);
        // Save to backend API
        autoSaveDraft({
          ...draftData.formData,
          schedule: draftData.formData.schedule || [],
          benefits: draftData.formData.benefits || [],
        });
        localStorage.removeItem("temp_job_draft");
      } catch (error) {
        console.error("Failed to process temp draft:", error);
        localStorage.removeItem("temp_job_draft");
      }
    }
  }, []);

  const handleSelectTemplate = (template: JobTemplate) => {
    setSelectedTemplate(template);

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

  useEffect(() => {
    if (location.state?.selectedTemplate) {
      const template = location.state.selectedTemplate as JobTemplate;
      const isEditMode = location.state.editMode;

      if (isEditMode) {
        setIsEditingTemplate(true);
        setEditingTemplateId(location.state.templateId);
      }

      handleSelectTemplate(template);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [userId]);

  const loadTestData = () => {
    Object.keys(JOB_FORM_TEST_DATA).forEach((key) => {
      setValue(key as keyof JobFormSchema, (JOB_FORM_TEST_DATA as any)[key]);
    });
    toast.success("Test data loaded successfully!");
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNext = async () => {
    clearErrors();

    // Skip validation for AI Analysis step (4), Automation step (6), and Review step (7/6)
    // But require validation for Booking Page step (7/5)
    if (currentStep === 4 && hasProfessionalFeatures) {
      // AI Analysis step (merged Resume Analysis + AI Overview) - skip validation for Professional+ users
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      scrollToTop();
      return;
    }

    if (currentStep === 4 && !hasProfessionalFeatures) {
      // For non-Professional users, skip AI step and go directly to Booking Page (step 5)
      setCurrentStep(5); // This will be the Booking Page for non-Professional users
      scrollToTop();
      return;
    }

    if (currentStep === 6 && hasProfessionalFeatures) {
      // Automation step - skip validation for Professional+ users
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      scrollToTop();
      return;
    }

    if (
      (currentStep === 7 && hasProfessionalFeatures) ||
      (currentStep === 6 && !hasProfessionalFeatures)
    ) {
      // Review step - skip validation
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      scrollToTop();
      return;
    }

    // Special validation for Booking Page step (step 7 for Professional+, step 5 for Starter)
    const isBookingPageStep =
      (hasProfessionalFeatures && currentStep === 7) ||
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

    // Handle skipping AI step for non-Professional users when going backwards
    if (currentStep === 5 && !hasProfessionalFeatures) {
      // For non-Professional users, step 5 is Booking Page, so go back to step 4 (Schedule & Budget)
      setCurrentStep(4);
    } else if (currentStep === 6 && !hasProfessionalFeatures) {
      // For non-Professional users, step 6 is Automation, so go back to step 5 (Booking Page)
      setCurrentStep(5);
    } else if (currentStep === 7 && !hasProfessionalFeatures) {
      // For non-Professional users, step 7 is Review, so go back to step 6 (Automation)
      setCurrentStep(6);
    } else if (currentStep === 5 && hasProfessionalFeatures) {
      // For Professional+ users, step 5 is Schedule & Budget, go back to step 4 (AI Analysis)
      setCurrentStep(4);
    } else if (currentStep === 6 && hasProfessionalFeatures) {
      // For Professional+ users, step 6 is Automation, go back to step 5 (Schedule & Budget)
      setCurrentStep(5);
    } else if (currentStep === 7 && hasProfessionalFeatures) {
      // For Professional+ users, step 7 is Booking Page, go back to step 6 (Automation)
      setCurrentStep(6);
    } else if (currentStep === 8 && hasProfessionalFeatures) {
      // For Professional+ users, step 8 is Review, go back to step 7 (Booking Page)
      setCurrentStep(7);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }

    // Scroll to top when going to previous step
    scrollToTop();
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
        templateId: automation?.templateId || undefined,
        preferredQualScoring: automation?.preferredQualScoring || false,
        resumeItems: automation?.resumeItems || [],
        resumeItemScoring: automation?.resumeItemScoring || false,
        autoRejectThreshold: automation?.autoRejectThreshold || 30,
      };

      const newData = {
        ...rest,
        automation: automationData,
        schedule: rest.schedule || [],
      } as any;

      await API.job.createJob(newData);

      // Delete the draft since job was successfully created
      if (draftId) {
        try {
          await API.jobDraft.deleteJobDraft(draftId);
        } catch (error) {
          console.error("Failed to delete draft:", error);
        }
      }

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
        return <JobAdStep />;
      case 2:
        return (
          <div>
            <CompanyPositionDetailsStep />
            <div className="mt-4">
              <HoursScheduleBenefitsStep />
            </div>
            <div className="mt-4">
              <ComplianceDepartmentStep />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <JobQualificationsStep />
          </div>
        );
      case 4:
        if (hasProfessionalFeatures) {
          // Merged AI Analysis step - includes both Resume Analysis and AI Overview
          return <AIAnalysisStep />;
        } else {
          // For non-Professional users, step 4 is Posting/Schedule/Budget
          return <PostingScheduleBudgetStep />;
        }
      case 5:
        if (hasProfessionalFeatures) {
          return <PostingScheduleBudgetStep />;
        } else {
          // For non-Professional users, step 5 is the Booking Page
          return <BookingPageStep />;
        }
      case 6:
        if (hasProfessionalFeatures) {
          return (
            <div className="space-y-8">
              <CustomAutomationStep
                isSelectable={true}
                automations={(watch("automations") as string[]) || []}
                onSelectionChange={(selectedIds) => {
                  setValue("automations", selectedIds);
                }}
              />
              <AIFollowupTemplateStep automations={(watch("automations") as string[]) || []} />
            </div>
          );
        } else {
          // For non-Professional users, step 6 is the Automation step
          return (
            <CustomAutomationStep
              isSelectable={true}
              automations={(watch("automations") as string[]) || []}
              onSelectionChange={(selectedIds) => {
                setValue("automations", selectedIds);
              }}
            />
          );
        }
      case 7:
        if (hasProfessionalFeatures) {
          return <BookingPageStep />;
        } else {
          // For non-Professional users, step 7 is the Review step
          return (
            <>
              <ReviewPublishStep mode="publish" />
            </>
          );
        }
      case 8:
        // Only for Professional+ users - Review step
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
    <main className="pb-8 min-h-full">
      {/* Enhanced Header - Professional Mobile Design */}
      <div className="bg-white border-b border-gray-100 px-3 sm:px-4 pt-2 sm:pt-3 relative overflow-hidden">
        <div className="relative z-10">
          {/* Mobile Header - Professional Design */}
          <div className="block sm:hidden mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/10">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900 leading-tight">
                    Create Job
                  </h1>
                  <p className="text-xs text-gray-600">
                    Step {currentStep} of {totalSteps}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%
                </div>
                <p className="text-xs text-gray-600 font-medium">Complete</p>
              </div>
            </div>

            {/* Mobile Action Buttons - Professional Touch Targets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 -mx-1 px-1">
              <Button
                variant="outline"
                onClick={() => setShowSaveTemplateDialog(true)}
                className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 rounded-lg h-8 px-2.5 text-xs font-medium whitespace-nowrap flex-shrink-0 shadow-none"
              >
                <FileText className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Save Template</span>
                <span className="sm:hidden">Save</span>
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(ROUTES.DASHBOARD.JOB_TEMPLATES, {
                    state: { fromJobCreation: true },
                  })
                }
                className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 rounded-lg h-8 px-2.5 text-xs font-medium whitespace-nowrap flex-shrink-0 shadow-none"
              >
                <Layers className="h-3.5 w-3.5 mr-1" />
                Templates
              </Button>
              <Button
                variant="outline"
                onClick={loadTestData}
                className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 rounded-lg h-8 px-2.5 text-xs font-medium whitespace-nowrap flex-shrink-0 shadow-none"
              >
                <Database className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Load Data</span>
                <span className="sm:hidden">Load</span>
              </Button>
            </div>
          </div>

          {/* Desktop Header - Enhanced Professional Design */}
          <div className="hidden sm:flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Create New Job
                </h1>
                <div className="text-sm text-gray-600 flex items-center gap-2 mt-0.5">
                  <span>
                    Set up your job posting with detailed requirements
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary font-medium text-xs px-1.5 py-0 rounded-full border border-primary/20"
                  >
                    Step {currentStep} of {totalSteps}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Template Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveTemplateDialog(true)}
                  className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 rounded-lg h-8 px-3 text-xs font-medium transition-all duration-200 shadow-none"
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Save as Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(ROUTES.DASHBOARD.JOB_TEMPLATES, {
                      state: { fromJobCreation: true },
                    })
                  }
                  className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900 rounded-lg h-8 px-3 text-xs font-medium transition-all duration-200 shadow-none"
                >
                  <Layers className="h-3.5 w-3.5 mr-1.5" />
                  {selectedTemplate ? "Change Template" : "Browse Templates"}
                </Button>
                <Button
                  variant="outline"
                  onClick={loadTestData}
                  className="bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary hover:text-primary rounded-lg h-8 px-3 text-xs font-medium transition-all duration-200 shadow-none"
                >
                  <Database className="h-3.5 w-3.5 mr-1.5" />
                  Load Test Data
                </Button>
              </div>

              <div className="h-6 w-px bg-gray-200" />

              {/* Progress Display */}
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  {Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)}%
                </div>
                <p className="text-xs text-gray-600 font-medium">Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="w-full px-3 sm:px-4 mt-3 sm:mt-4">
          <EnhancedProgressStepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={Array.from(
              { length: currentStep - 1 },
              (_, i) => i + 1
            )}
            variant="horizontal"
            size="sm"
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

      <div className="max-w-[1400px] mx-auto md:px-4 mt-3 sm:mt-4">
        {/* Template Status & Actions - Professional Mobile Design */}
        <div className="mb-3 sm:mb-4">
          {selectedTemplate && (
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium text-primary truncate">
                Using template: {selectedTemplate.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.DASHBOARD.JOB_TEMPLATES)}
                className="h-6 w-6 p-0 text-primary hover:text-primary/80 hover:bg-primary/10 flex-shrink-0 rounded-lg"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Auto-save status indicator */}
          {lastSaved && (
            <div className="text-xs text-gray-500 flex items-center gap-1.5 justify-center sm:justify-start bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-saved {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        <Card className="shadow-none border-none md:border border-gray-100 bg-white rounded-lg">
          <CardContent className="px-3 md:px-5 py-4 sm:py-5">
            <FormProvider {...form}>
              <form
                onSubmit={(e) => {
                  e.preventDefault(); // Prevent default form submission
                  console.log("Form submit event triggered");
                  const formData = form.getValues();
                  onSubmit(formData as JobFormSchema);
                  return false;
                }}
                className="space-y-5"
              >
                {renderCurrentStep()}
                <StepControls
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
          formData={form.getValues() as any}
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
