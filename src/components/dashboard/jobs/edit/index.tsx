"use client";

import { AIAnalysisStep } from "@/components/dashboard/jobs/common/ai-analysis-step";
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
import {
  EnhancedProgressStepper,
  type Step,
} from "@/components/ui/enhanced-progress-stepper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

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

  // Define steps for the progress stepper (matching create job page)
  const getSteps = (): Step[] => {
    const baseSteps: Step[] = [
      {
        id: "position",
        title: "Position & Company",
        description: "Role details and company info",
        icon: Briefcase,
      },
      {
        id: "job-ad",
        title: "Job Details",
        description: "Basic job information",
        icon: FileText,
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
          title: "Review & Update",
          description: "Final review and update",
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
          title: "Review & Update",
          description: "Final review and update",
          icon: CheckCircle,
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

  const {
    trigger,
    handleSubmit,
    clearErrors,
    reset,
    getValues,
    watch,
    setValue,
  } = form;

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

    // Skip validation for AI Analysis step (4), Automation step (6), and Review step (7/8)
    // But require validation for Booking Page step (7/5)
    if (currentStep === 4 && hasProfessionalFeatures) {
      // AI Analysis step (merged Resume Analysis + AI Overview) - skip validation for Professional+ users
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      return;
    }

    if (currentStep === 4 && !hasProfessionalFeatures) {
      // For non-Professional users, skip AI step and go directly to Booking Page (step 5)
      setCurrentStep(5); // This will be the Booking Page for non-Professional users
      return;
    }

    if (currentStep === 6 && hasProfessionalFeatures) {
      // Automation step - skip validation for Professional+ users
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
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

    // Scroll will happen automatically via useEffect when currentStep changes
  };

  // Auto-scroll to top whenever step changes
  useEffect(() => {
    const scrollToTop = () => {
      // Find the scrollable container (the div with overflow-y-auto from PrivateRoute)
      let scrollableContainer: HTMLElement | null = null;

      // Method 1: Find by class selector
      scrollableContainer = document.querySelector(
        ".overflow-y-auto"
      ) as HTMLElement;

      // Method 2: If not found, traverse up from main element
      if (!scrollableContainer) {
        const mainElement = document.querySelector("main");
        if (mainElement) {
          let parent = mainElement.parentElement;
          while (parent) {
            const style = window.getComputedStyle(parent);
            if (style.overflowY === "auto" || style.overflowY === "scroll") {
              scrollableContainer = parent;
              break;
            }
            parent = parent.parentElement;
          }
        }
      }

      // Scroll the container if found
      if (scrollableContainer) {
        scrollableContainer.scrollTo({ top: 0, behavior: "smooth" });
        scrollableContainer.scrollTop = 0;
      }

      // Also scroll window and document as fallback
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Immediate scroll
    scrollToTop();

    // Also try after a small delay to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      scrollToTop();
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [currentStep]);

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
      const response = await API.job.updateJob(job.id, newData as any);
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

  // Helper function to map section IDs to step indices
  const getStepMap = (): Record<string, number> => {
    if (hasProfessionalFeatures) {
      return {
        position: 1,
        "job-ad": 2,
        qualifications: 3,
        "ai-analysis": 4,
        posting: 5,
        automation: 6,
        booking: 7,
        review: 8,
      };
    } else {
      return {
        position: 1,
        "job-ad": 2,
        qualifications: 3,
        posting: 4,
        booking: 5,
        automation: 6,
        review: 7,
      };
    }
  };

  // Get completed sections from form data
  const getCompletedSections = (formData: JobFormSchema) => {
    const sections = [];
    if (formData.jobDescription) {
      sections.push("job-ad");
    }
    if (
      formData.jobTitle &&
      formData.jobBoardTitle &&
      formData.department &&
      formData.payRate &&
      formData.positionsToHire
    ) {
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
    // Check for AI Analysis completion (Professional+ only)
    if (hasProfessionalFeatures) {
      if (formData.customQuestions && formData.customQuestions.length > 0) {
        sections.push("ai-analysis");
      }
    }
    // Check for automation completion
    if (
      formData.automation &&
      ((formData.automation as any).enabledRules?.length > 0 ||
        (formData.automations as string[])?.length > 0)
    ) {
      sections.push("automation");
    }
    // Check for booking page completion
    if (formData.availabilityId) {
      sections.push("booking");
    }
    return sections;
  };

  // Get completed step indices based on form state
  const getCompletedStepIndices = (): number[] => {
    const stepMap = getStepMap();
    const formData = watch();
    const currentCompletedSections = getCompletedSections(formData);

    const completedIndices: number[] = [];
    currentCompletedSections.forEach((sectionId) => {
      const stepIndex = stepMap[sectionId];
      if (stepIndex) {
        completedIndices.push(stepIndex);
      }
    });

    // Also mark steps before current step as completed
    for (let i = 1; i < currentStep; i++) {
      if (!completedIndices.includes(i)) {
        completedIndices.push(i);
      }
    }

    return completedIndices.sort((a, b) => a - b);
  };

  // Navigation items for Position & Company step
  const positionCompanyNavItems = [
    {
      id: "position-details",
      label: "Company & Position",
      icon: Building,
      description: "Job titles, company, openings",
    },
    {
      id: "hours-schedule",
      label: "Hours & Schedule",
      icon: Clock,
      description: "Work schedule and benefits",
    },
    {
      id: "compliance",
      label: "Compliance & Department",
      icon: Shield,
      description: "Department and compliance",
    },
  ];

  // Position & Company Step with Sidebar Navigation
  const PositionCompanyStepWithNavigation = () => {
    const [activeSection, setActiveSection] =
      useState<string>("position-details");
    const [isScrolling, setIsScrolling] = useState(false);

    // Handle scroll and update active section
    useEffect(() => {
      const handleScroll = () => {
        // Find scrollable container (check both window and container)
        let scrollContainer: HTMLElement | Window = window;
        const container = document.querySelector(
          ".overflow-y-auto"
        ) as HTMLElement;
        if (container) {
          scrollContainer = container;
        }

        const sections = positionCompanyNavItems.map((item) => ({
          id: item.id,
          element: document.getElementById(item.id),
        }));

        // Get scroll position
        const scrollTop =
          scrollContainer === window
            ? window.scrollY
            : (scrollContainer as HTMLElement).scrollTop;

        // Header offset for determining active section
        const headerOffset = 150;
        const threshold = scrollTop + headerOffset;

        // Check each section to see which one is currently in view
        // We check from bottom to top to find the first section that's above the threshold
        let activeId = sections[0]?.id; // Default to first section

        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (section.element) {
            let elementTop: number;

            if (scrollContainer === window) {
              // For window scroll, use offsetTop which is relative to document
              elementTop = section.element.offsetTop;
            } else {
              // For container scroll, calculate position relative to container
              const containerRect = (
                scrollContainer as HTMLElement
              ).getBoundingClientRect();
              const elementRect = section.element.getBoundingClientRect();
              const containerScrollTop = (scrollContainer as HTMLElement)
                .scrollTop;
              elementTop =
                containerScrollTop + (elementRect.top - containerRect.top);
            }

            // If section's top is above or at the threshold, it's active
            if (threshold >= elementTop) {
              activeId = section.id;
              break;
            }
          }
        }

        // Only update if not manually scrolling (to avoid flicker during click)
        if (!isScrolling) {
          setActiveSection(activeId);
        }
      };

      // Throttle scroll handler
      let timeoutId: NodeJS.Timeout;
      const throttledScroll = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleScroll, 100);
      };

      // Try to attach to scrollable container, fallback to window
      const scrollContainer = document.querySelector(".overflow-y-auto");
      const targetElement = scrollContainer || window;

      targetElement.addEventListener("scroll", throttledScroll, {
        passive: true,
      });
      handleScroll(); // Check initial position

      return () => {
        if (targetElement === window) {
          window.removeEventListener("scroll", throttledScroll);
        } else {
          (targetElement as HTMLElement).removeEventListener(
            "scroll",
            throttledScroll
          );
        }
        clearTimeout(timeoutId);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScrolling]);

    // Handle navigation click
    const handleNavClick = (
      e: React.MouseEvent<HTMLButtonElement>,
      sectionId: string
    ) => {
      e.preventDefault();
      e.stopPropagation();

      // Immediately update active section on click
      setActiveSection(sectionId);

      setIsScrolling(true);
      const element = document.getElementById(sectionId);
      if (element) {
        // Find scrollable container
        const scrollContainer = document.querySelector(
          ".overflow-y-auto"
        ) as HTMLElement;
        const headerOffset = 100;

        if (scrollContainer) {
          // Scroll within container
          const elementRect = element.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          const relativeTop = elementRect.top - containerRect.top;
          const scrollPosition =
            scrollContainer.scrollTop + relativeTop - headerOffset;

          scrollContainer.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: "smooth",
          });
        } else {
          // Scroll window - use element's offsetTop for more accurate positioning
          const elementTop = element.offsetTop;
          const offsetPosition = elementTop - headerOffset;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: "smooth",
          });
        }

        // Reset scrolling flag after animation completes
        // Also manually check scroll position after animation
        setTimeout(() => {
          setIsScrolling(false);
          // Manually trigger scroll check to ensure active section is correct
          const scrollContainer = document.querySelector(
            ".overflow-y-auto"
          ) as HTMLElement;
          const targetElement = scrollContainer || window;
          if (targetElement === window) {
            // Trigger a scroll event to update active section
            window.dispatchEvent(new Event("scroll"));
          } else {
            scrollContainer.dispatchEvent(new Event("scroll"));
          }
        }, 800);
      }
    };

    return (
      <div className="flex gap-4">
        {/* Sidebar Navigation - Desktop Only */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="mb-2.5">
                <h3 className="text-xs font-semibold text-gray-900 mb-0.5">
                  Quick Navigation
                </h3>
                <p className="text-[10px] text-gray-500">Jump to any section</p>
              </div>
              <nav className="space-y-0.5">
                {positionCompanyNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => handleNavClick(e, item.id)}
                      className={`w-full text-left p-2 rounded-md transition-all duration-300 ease-in-out group cursor-pointer ${
                        isActive
                          ? "bg-blue-50 border border-blue-200 text-blue-900 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className={`p-1 rounded-md flex-shrink-0 mt-0.5 transition-all duration-300 ease-in-out ${
                            isActive
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 transition-transform duration-300 ease-in-out group-hover:scale-110" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-medium mb-0.5 transition-colors duration-300 ease-in-out ${
                              isActive ? "text-blue-900" : "text-gray-900"
                            }`}
                          >
                            {item.label}
                          </div>
                          <div
                            className={`text-[10px] leading-tight transition-colors duration-300 ease-in-out ${
                              isActive ? "text-blue-700" : "text-gray-500"
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-1 h-1 rounded-full bg-blue-600 flex-shrink-0 mt-1.5 transition-opacity duration-300 ease-in-out"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Section 1: Company & Position Details */}
          <section id="position-details" className="scroll-mt-24">
            <CompanyPositionDetailsStep />
          </section>

          {/* Section 2: Hours, Schedule & Benefits */}
          <section id="hours-schedule" className="mt-4 sm:mt-6 scroll-mt-24">
            <HoursScheduleBenefitsStep />
          </section>

          {/* Section 3: Compliance & Department */}
          <section id="compliance" className="mt-4 sm:mt-6 scroll-mt-24">
            <ComplianceDepartmentStep />
          </section>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PositionCompanyStepWithNavigation />;
      case 2:
        return <JobAdStep />;
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
            <CustomAutomationStep
              isSelectable={true}
              automations={(watch("automations") as string[]) || []}
              onSelectionChange={(selectedIds) => {
                setValue("automations", selectedIds);
              }}
            />
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
              <ReviewPublishStep mode="edit" />
            </>
          );
        }
      case 8:
        // Only for Professional+ users - Review step
        return (
          <>
            <ReviewPublishStep mode="edit" />
          </>
        );
      default:
        return <PositionCompanyStepWithNavigation />;
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
    <main className="pb-8 min-h-full">
      {/* Retry indicator */}
      {loadingState.isRetrying && (
        <div className="bg-white border-b border-blue-200 px-4 py-3">
          <Alert className="border-blue-200 bg-blue-50 max-w-6xl mx-auto">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800">
              Refreshing job details...
            </AlertDescription>
          </Alert>
        </div>
      )}

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
                    Edit Job
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

            {/* Mobile Job Info */}
            <div className="mb-3 px-1">
              <p className="text-xs text-gray-500 truncate">{job.jobTitle}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Last updated: {new Date(job.updatedAt).toLocaleDateString()}
              </p>
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
                  Edit Job Posting
                </h1>
                <div className="text-sm text-gray-600 flex items-center gap-2 mt-0.5">
                  <span className="truncate max-w-md">{job.jobTitle}</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary font-medium text-xs px-1.5 py-0 rounded-full border border-primary/20"
                  >
                    Step {currentStep} of {totalSteps}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Last updated: {new Date(job.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
            completedSteps={getCompletedStepIndices()}
            variant="horizontal"
            size="sm"
            showProgress={true}
            clickable={true}
            onStepClick={(stepIndex) => {
              // Allow navigation to completed steps or current step
              const targetStep = stepIndex + 1;
              const completedIndices = getCompletedStepIndices();
              if (
                completedIndices.includes(targetStep) ||
                targetStep === currentStep
              ) {
                setCurrentStep(targetStep);
              }
            }}
            className="max-w-6xl mx-auto"
          />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto md:px-4 mt-3 sm:mt-4">
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
