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
import { zodResolver } from "@hookform/resolvers/zod";
import { Brain, ChevronLeft, ChevronRight, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TriggerSection from "./trigger-section";

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
  const [triggerSelected, setTriggerSelected] = useState<boolean>(false);

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

      // Reset trigger selected state when type changes
      setTriggerSelected(false);
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
        // Only validate trigger type, name will be validated later
        return await form.trigger(["trigger.type"]);
      case "conditions":
        return true; // Conditions are optional
      case "actions":
        return await form.trigger(["actions"]);
      case "summary":
        // On summary, validate everything including name
        return await form.trigger(["name", "trigger.type", "actions"]);
      default:
        return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    switch (activeStep) {
      case "trigger":
        // Mark that user has selected a trigger and wants to continue
        setTriggerSelected(true);
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
        // If going back to trigger, reset trigger selected state
        setTriggerSelected(false);
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

  const formContent = (
    <Form {...form}>
      <form className="space-y-6">
        {/* Basic Info - Only show when trigger is selected or on summary */}
        {(triggerSelected || activeStep === "summary") && (
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
          {/* Always show trigger selection at the top */}
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
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          {/* Back button - only show if trigger is selected and not on trigger step */}
          {triggerSelected && activeStep !== "trigger" ? (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}

          {/* Next/Submit button */}
          {triggerSelected && activeStep === "summary" ? (
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
              disabled={!triggerType}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {!triggerSelected ? "Continue to Configure" : "Next"}
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
