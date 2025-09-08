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
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AutomationType } from "@/interfaces/automations";
import { useToast } from "@/lib/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ChevronLeft, ChevronRight, Save, Brain, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ActionsSection from "./actions-section";
import ConditionsSection from "./conditions-section";
import SummarySection from "./summary-section";
import TriggerSection from "./trigger-section";
import { InputField } from "@/components/common/InputField";

// Define the form schema
const automationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
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
      type: z.enum(["send_email", "webhook", "slack", "custom"]),
      config: z.record(z.any()).optional(),
    })
  ),
});

type FormValues = z.infer<typeof automationSchema>;

interface AutomationBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (automation: AutomationType) => void;
  automation?: AutomationType; // For editing existing automation
  mode?: "dialog" | "sheet";
}

export default function AutomationBuilder({
  open,
  onClose,
  onSave,
  automation,
  mode = "sheet",
}: AutomationBuilderProps) {
  const [activeStep, setActiveStep] = useState("trigger");
  const { toast } = useToast();
  const isEditing = !!automation;

  const defaultValues: FormValues = {
    name: "",
    description: "",
    enabled: true,
    trigger: {
      type: "application_created",
      config: {},
    },
    conditions: [],
    actions: [
      {
        type: "send_email",
        config: {
          templateId: "",
          delay: {
            value: 0,
            unit: "days",
          },
          timezone: "UTC",
        },
      },
    ],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(automationSchema),
    defaultValues: automation || defaultValues,
    mode: "onChange",
  });

  const { formState, watch, setValue } = form;
  const triggerType = watch("trigger.type");

  // Reset form when editing a different automation
  useEffect(() => {
    if (open) {
      if (automation) {
        form.reset(automation);
        setActiveStep("trigger");
      } else {
        form.reset(defaultValues);
      }
    }
  }, [automation, open]);

  // Handle trigger type change
  const handleTriggerTypeChange = (newType: FormValues["trigger"]["type"]) => {
    if (newType !== triggerType) {
      setValue("trigger.type", newType, { shouldValidate: true });
      setValue("trigger.config", {});
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

  // This is now handled directly in the dialog mode, no separate formContent needed
  const formContent = null;

  if (mode === "dialog") {
    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
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
                    {isEditing ? "Update automation settings" : "Set up a new automation workflow"}
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

          <Form {...form}>
            <form className="space-y-6">
              
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
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

              {/* Step Navigation */}
              <div className="flex justify-center">
                <div className="inline-flex bg-gray-100 rounded-lg p-1">
                  {["trigger", "conditions", "actions", "summary"].map((step, index) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setActiveStep(step)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeStep === step
                          ? "bg-white text-primary shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {index + 1}. {step.charAt(0).toUpperCase() + step.slice(1)}
                    </button>
                  ))}
          </div>
              </div>

              {/* Step Content */}
              <div className="border rounded-lg p-6 min-h-[500px]">
                {activeStep === "trigger" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">When should this run?</h3>
                    <TriggerSection form={form} onTriggerTypeChange={handleTriggerTypeChange} />
              </div>
                )}

                {activeStep === "conditions" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Conditions (Optional)</h3>
                    <ConditionsSection form={form} />
            </div>
                )}

                {activeStep === "actions" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">What should happen?</h3>
                    <ActionsSection form={form} />
        </div>
      )}

                {activeStep === "summary" && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Review</h3>
                    <SummarySection form={form} />
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
        {activeStep !== "trigger" ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
          >
                    <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
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
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Next
                    <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
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
      <SheetContent
        side="right"
        className="w-full max-w-3xl overflow-y-auto p-6"
      >
        <Form {...form}>
          <form>{formContent}</form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
