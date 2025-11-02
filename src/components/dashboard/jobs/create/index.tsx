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
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Database,
  FileText,
  Layers,
  RotateCcw,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SaveAsTemplateDialog } from "./SaveAsTemplateDialog";

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
function PositionCompanyStepWithNavigation() {
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
}

interface CreateJobProps {
  draftId?: string;
  onJobCreated?: (jobId: string) => void;
  onCancel?: () => void;
}

export default function CreateJob({
  draftId: externalDraftId,
  onJobCreated,
}: CreateJobProps = {}) {
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
  const [draftCompletedSections, setDraftCompletedSections] = useState<
    string[]
  >([]);
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
      {
        id: "job-ad",
        title: "Job Details",
        description: "Basic job information",
        icon: FileText,
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
  const [draftId, setDraftId] = useState<string | null>(
    externalDraftId || null
  );
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

  // Get completed step indices based on draft's completed sections and current form state
  const getCompletedStepIndices = (): number[] => {
    const stepMap = getStepMap();
    const formData = watch();
    const currentCompletedSections = getCompletedSections(formData);

    // Combine draft's completed sections with current form state
    const allCompletedSections = [
      ...new Set([...draftCompletedSections, ...currentCompletedSections]),
    ];

    const completedIndices: number[] = [];
    allCompletedSections.forEach((sectionId) => {
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
        } as JobFormSchema);
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
            completedSections: getCompletedSections(formData as JobFormSchema),
            timestamp: Date.now(),
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Load draft if editing
  useEffect(() => {
    const loadDraft = async () => {
      if (externalDraftId) {
        try {
          const response = await API.jobDraft.getJobDraft(externalDraftId);
          const draft = response.data?.draft || response.draft;

          if (draft) {
            // Set form values from draft
            if (draft.formData) {
              Object.keys(draft.formData).forEach((key) => {
                const value = draft.formData[key];
                if (value !== undefined && value !== null) {
                  setValue(key as keyof JobFormSchema, value as any);
                }
              });
            }

            // Store completed sections
            if (draft.completedSections) {
              setDraftCompletedSections(draft.completedSections);

              // Navigate to first incomplete step or last completed step
              const stepMap = getStepMap();
              let targetStep = 1;

              // Find the highest completed step
              for (const sectionId of draft.completedSections) {
                const stepIndex = stepMap[sectionId];
                if (stepIndex && stepIndex >= targetStep) {
                  targetStep = stepIndex + 1; // Go to next step after last completed
                }
              }

              // Ensure we don't go beyond total steps
              targetStep = Math.min(targetStep, totalSteps);
              setCurrentStep(targetStep);
            }

            setDraftId(externalDraftId);
            toast.success("Draft loaded successfully");
          }
        } catch (error) {
          console.error("Error loading draft:", error);
          toast.error("Failed to load draft");
        }
      }
    };

    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalDraftId, totalSteps]);

  // Helper function to map section IDs to step indices
  const getStepMap = (): Record<string, number> => {
    if (hasProfessionalFeatures) {
      return {
        position: 1,
        qualifications: 2,
        "job-ad": 3,
        "ai-analysis": 4,
        posting: 5,
        automation: 6,
        booking: 7,
        review: 8,
      };
    } else {
      return {
        position: 1,
        qualifications: 2,
        "job-ad": 3,
        posting: 4,
        booking: 5,
        automation: 6,
        review: 7,
      };
    }
  };

  // Process temp draft on component mount (only if no external draft)
  useEffect(() => {
    if (!externalDraftId) {
      const tempDraft = localStorage.getItem("temp_job_draft");
      if (tempDraft) {
        try {
          const draftData = JSON.parse(tempDraft);
          // Save to backend API
          autoSaveDraft({
            ...draftData.formData,
            schedule: draftData.formData.schedule || [],
            benefits: draftData.formData.benefits || [],
          } as JobFormSchema);
          localStorage.removeItem("temp_job_draft");
        } catch (error) {
          console.error("Failed to process temp draft:", error);
          localStorage.removeItem("temp_job_draft");
        }
      }
    }
  }, [externalDraftId]);

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

  // Auto-scroll to top whenever step changes
  useEffect(() => {
    const scrollToTop = () => {
      // Find the scrollable container (the div with overflow-y-auto from PrivateRoute)
      // Try multiple methods to find it reliably
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

  const handleNext = async () => {
    clearErrors();

    // Skip validation for AI Analysis step (4), Automation step (6), and Review step (7/6)
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

      const response = await API.job.createJob(newData);
      const createdJobId =
        (response as any)?.data?.job?.id || (response as any)?.job?.id;

      // Delete the draft since job was successfully created
      if (draftId) {
        try {
          await API.jobDraft.deleteJobDraft(draftId);
        } catch (error) {
          console.error("Failed to delete draft:", error);
        }
      }

      toast.success("Job created successfully!");

      // Call callback if provided (for draft editing)
      if (onJobCreated && createdJobId) {
        onJobCreated(createdJobId);
        return;
      }

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
        return <PositionCompanyStepWithNavigation />;
      case 2:
        return (
          <div>
            <JobQualificationsStep />
          </div>
        );
      case 3:
        return <JobAdStep />;
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
        return <PositionCompanyStepWithNavigation />;
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
                    {externalDraftId ? "Edit Draft Job" : "Create Job"}
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
                  {externalDraftId ? "Edit Draft Job" : "Create New Job"}
                </h1>
                <div className="text-sm text-gray-600 flex items-center gap-2 mt-0.5">
                  <span>
                    {externalDraftId
                      ? "Continue editing your draft job posting"
                      : "Set up your job posting with detailed requirements"}
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
