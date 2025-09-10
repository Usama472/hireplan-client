import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { AutomationType } from "@/interfaces/automations";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Brain,
  Briefcase,
  CalendarClock,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Cog,
  FilterIcon,
  LightbulbIcon,
  Mail,
  PlayIcon,
  Save,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ActionsSection from "./actions-section";
import ConditionsSection from "./conditions-section";
import SummarySection from "./summary-section";
import TriggerSection from "./trigger-section";

// Define the automation types
const AUTOMATION_TYPES = [
  {
    id: "email",
    name: "Email Automation",
    description:
      "Automate email communications with candidates at any stage of recruitment",
    icon: Mail,
    color: "bg-gradient-to-br from-blue-100 to-blue-200",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    hoverBg: "hover:bg-blue-50",
    highlightColor: "bg-blue-600",
    detailItems: [
      "Send automated follow-ups",
      "Rejection notifications",
      "Interview confirmations",
    ],
  },
  {
    id: "job",
    name: "Job Automation",
    description:
      "Streamline job-related workflows and save time on repetitive tasks",
    icon: Briefcase,
    color: "bg-gradient-to-br from-emerald-100 to-emerald-200",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    hoverBg: "hover:bg-emerald-50",
    highlightColor: "bg-emerald-600",
    detailItems: [
      "Auto-update job statuses",
      "Assign recruiters",
      "Close expired listings",
    ],
  },
  {
    id: "schedule",
    name: "Schedule Automation",
    description:
      "Create time-based triggers that run on specific days or intervals",
    icon: CalendarClock,
    color: "bg-gradient-to-br from-purple-100 to-purple-200",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    hoverBg: "hover:bg-purple-50",
    highlightColor: "bg-purple-600",
    detailItems: [
      "Daily/weekly reports",
      "Scheduled reminders",
      "Time-based actions",
    ],
  },
];

// Define the form schema
const automationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  automationType: z.enum(["email", "job", "schedule"]).optional(),
  trigger: z.object({
    type: z.enum([
      "application_created",
      "application_status_changed",
      "resume_score_updated",
      "job_created",
      "job_published",
      "job_expired",
      "candidate_matched",
      "email_received",
      "cron",
    ]),
    config: z.record(z.any()).optional(),
  }),
  conditions: z
    .array(
      z.object({
        field: z.string(),
        operator: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  actions: z.array(
    z.object({
      type: z.enum([
        "send_email",
        "webhook",
        "slack",
        "custom",
        "update_job_status",
        "assign_recruiter",
        "ai_follow_up",
      ]),
      config: z.record(z.any()).optional(),
    })
  ),
});

type FormValues = z.infer<typeof automationSchema>;

interface AutomationBuilderProps {
  open?: boolean;
  onClose?: () => void;
  onSave: (automation: AutomationType) => void;
  automation?: AutomationType; // For editing existing automation
  mode?: "dialog" | "sheet" | "standalone";
  isPageLayout?: boolean;
}

export default function AutomationBuilder({
  open,
  onClose,
  onSave,
  automation,
  mode = "sheet",
  isPageLayout = false,
}: AutomationBuilderProps) {
  const [activeStep, setActiveStep] = useState<string>("trigger");
  const { toast } = useToast();
  const isEditing = !!automation;

  // Extend the default values to include automationType
  const defaultValues: FormValues = {
    name: "",
    description: "",
    enabled: true,
    automationType: "email", // Default to email type
    trigger: {
      type: "application_created",
      config: {},
    },
    conditions: [],
    actions: [], // Start with an empty array instead of a pre-created action
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(automationSchema),
    defaultValues: automation
      ? {
          ...automation,
          // Determine automation type based on the trigger or actions
          automationType: determineAutomationType(automation),
        }
      : defaultValues,
    mode: "onChange",
  });

  // Helper function to determine automation type from existing automation
  function determineAutomationType(
    automation: AutomationType
  ): "email" | "job" | "schedule" {
    // Logic to determine type based on trigger or actions
    if (automation.trigger.type === "cron") {
      return "schedule";
    } else if (automation.actions.some((a) => a.type === "send_email")) {
      return "email";
    } else if (
      ["job_created", "job_published", "job_expired"].includes(
        automation.trigger.type
      )
    ) {
      return "job";
    }

    return "email"; // Default to email if can't determine
  }

  const { formState, watch, setValue } = form;
  const triggerType = watch("trigger.type");
  const automationType = watch("automationType");

  // Reset form when editing a different automation
  useEffect(() => {
    if (open) {
      if (automation) {
        const values = {
          ...automation,
          // Determine automation type based on the trigger or actions
          automationType: determineAutomationType(automation),
        };
        form.reset(values);
        setActiveStep("trigger");
      } else {
        form.reset(defaultValues);
        setActiveStep("trigger");
      }
    }
  }, [automation, open]);

  // Handle trigger type change
  const handleTriggerTypeChange = (newType: FormValues["trigger"]["type"]) => {
    if (newType !== triggerType) {
      setValue("trigger.type", newType, { shouldValidate: true });
      setValue("trigger.config", {});

      // Infer automation type from trigger
      if (newType === "cron") {
        setValue("automationType", "schedule", { shouldValidate: true });
      } else if (
        ["job_created", "job_published", "job_expired"].includes(newType)
      ) {
        setValue("automationType", "job", { shouldValidate: true });
      } else {
        setValue("automationType", "email", { shouldValidate: true });
      }
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const automationData = {
        ...values,
        id: automation?.id || Math.random().toString(36).substring(2, 9),
        createdAt: automation?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as AutomationType;

      onSave(automationData);
      onClose();

      toast({
        title: isEditing ? "Automation updated" : "Automation created",
        description: `${automationData.name} has been ${
          isEditing ? "updated" : "created"
        } successfully.`,
        type: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${
          isEditing ? "update" : "create"
        } automation. Please try again.`,
        type: "error",
      });
    }
  };

  const validateCurrentStep = async () => {
    switch (activeStep) {
      case "trigger":
        return await form.trigger(["name", "trigger.type"]);
      case "conditions":
        return true; // Conditions are optional
      case "actions":
        return await form.trigger(["actions"]);
      case "summary":
        return formState.isValid;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    switch (activeStep) {
      case "trigger":
        setActiveStep("conditions");
        break;
      case "conditions":
        setActiveStep("actions");
        break;
      case "actions":
        setActiveStep("summary");
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (activeStep) {
      case "conditions":
        setActiveStep("trigger");
        break;
      case "actions":
        setActiveStep("conditions");
        break;
      case "summary":
        setActiveStep("actions");
        break;
      default:
        break;
    }
  };

  const handleCancel = () => {
    if (Object.keys(formState.dirtyFields).length > 0) {
      if (
        confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost."
        )
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Steps configuration - removed "Type" step
  const steps = [
    { id: "trigger", label: "Trigger" },
    { id: "conditions", label: "Conditions" },
    { id: "actions", label: "Actions" },
    { id: "summary", label: "Review" },
  ];

  // Step Content - Remove container conditional
  <div className="rounded-lg p-6 min-h-[500px]">
    {/* Trigger Selection */}
    {activeStep === "trigger" && (
      <div>
        <h3 className="text-lg font-semibold mb-4">
          When should this automation run?
        </h3>
        <TriggerSection
          form={form}
          onTriggerTypeChange={handleTriggerTypeChange}
          selectedAutomationType={undefined} // Show all triggers
        />
      </div>
    )}
  </div>;

  // Create the main form content that will be used in all modes
  const formContent = (
    <Form {...form}>
      <form className="space-y-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <ol className="flex items-center w-full">
            {steps.map((step, i) => (
              <li
                key={step.id}
                className={cn(
                  "flex items-center",
                  i < steps.length - 1 ? "w-full" : "",
                  i < steps.findIndex((s) => s.id === activeStep)
                    ? "text-blue-600"
                    : "text-gray-500"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-medium",
                    activeStep === step.id
                      ? "bg-blue-600 text-white"
                      : i < steps.findIndex((s) => s.id === activeStep)
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100"
                  )}
                >
                  {i < steps.findIndex((s) => s.id === activeStep) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="ml-2 text-sm font-medium hidden sm:inline">
                  {step.label}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 sm:mx-4",
                      i < steps.findIndex((s) => s.id === activeStep)
                        ? "bg-blue-600"
                        : "bg-gray-200"
                    )}
                  ></div>
                )}
              </li>
            ))}
          </ol>
        </div>

        {/* Basic Info (Common to all steps) */}
        {(activeStep === "trigger" || activeStep === "summary") && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Automation Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-end">
                <FormField
                  control={form.control}
                  name="enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormLabel>Enabled</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-3">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Optional description"
                        rows={2}
                        {...field}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="rounded-lg p-6 min-h-[500px]">
          {/* Trigger Selection */}
          {activeStep === "trigger" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                When should this automation run?
              </h3>
              <TriggerSection
                form={form}
                onTriggerTypeChange={handleTriggerTypeChange}
                selectedAutomationType={undefined} // Show all triggers
              />
            </div>
          )}

          {/* Conditions Section */}
          {activeStep === "conditions" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full shadow-sm">
                  <FilterIcon className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold">Define conditions</h3>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="absolute w-24 h-24 -right-4 -top-4 text-gray-50 opacity-10">
                  <FilterIcon className="h-full w-full" />
                </div>
                <ConditionsSection form={form} />
              </div>

              <div className="mt-5 flex justify-end">
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full inline-flex items-center">
                  <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                  <span>Add conditions (optional)</span>
                </div>
              </div>
            </div>
          )}

          {/* Update Actions section to remove border */}
          {activeStep === "actions" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full shadow-sm">
                  <PlayIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold">What should happen?</h3>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="absolute w-32 h-32 -right-10 -top-10 text-gray-50 opacity-10">
                  <Cog className="h-full w-full" />
                </div>

                {/* Flow Arrows */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2">
                  <div className="bg-emerald-100 h-20 w-1.5 rounded-full"></div>
                </div>

                <ActionsSection form={form} automationType={automationType} />

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 bg-green-50 inline-block px-3 py-1.5 rounded-full">
                    Actions determine what happens when your automation runs
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Update Summary section to remove border */}
          {activeStep === "summary" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full shadow-sm">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  Review Your Automation
                </h3>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="absolute w-32 h-32 -right-10 -top-10 text-gray-50 opacity-5">
                  <CheckCircle className="h-full w-full" />
                </div>

                {/* Flow Visualization */}
                <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-100 via-amber-100 to-green-100"></div>

                <SummarySection form={form} />

                <div className="mt-6 bg-purple-50 rounded-lg p-4 border border-purple-100 flex items-start">
                  <div className="p-2 bg-white rounded-full shadow-sm mr-3">
                    <LightbulbIcon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-purple-800 mb-1">
                      Automation Tips
                    </h4>
                    <ul className="text-xs text-purple-700 space-y-1 list-disc pl-4">
                      <li>Review all settings carefully before saving</li>
                      <li>Test your automation with a small group first</li>
                      <li>Monitor automation performance in the dashboard</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          {activeStep !== "trigger" ? (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}

          {activeStep === "summary" ? (
            <Button
              type="button"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={formState.isSubmitting || !formState.isValid}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {formState.isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Update" : "Create"} Automation
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              disabled={activeStep === "trigger" && !triggerType}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );

  // If this is standalone mode (page layout), return just the form content
  if (mode === "standalone") {
    return formContent;
  }

  // Otherwise, use the appropriate modal/sheet container
  if (mode === "dialog") {
    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen && onClose) onClose();
        }}
      >
        <DialogContent className="max-w-5xl w-full h-[95vh] max-h-[95vh] overflow-y-auto p-6">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    {isEditing ? "Edit Automation" : "Create Automation"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    {isEditing
                      ? "Update automation settings"
                      : "Set up a new automation workflow"}
                  </DialogDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && onClose) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full max-w-3xl overflow-y-auto p-6"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit" : "Create"} Automation
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            {isEditing
              ? "Update your automation workflow to automate recruitment tasks."
              : "Create a new automation workflow to automate recruitment tasks."}
          </SheetDescription>
        </SheetHeader>

        {formContent}
      </SheetContent>
    </Sheet>
  );
}
