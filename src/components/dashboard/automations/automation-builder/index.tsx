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
import { AlertCircle, ChevronLeft, ChevronRight, Save } from "lucide-react";
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

  const formContent = (
    <div className="">
      {/* Main Tabs - Email Rules vs Job Rules */}
      <Tabs defaultValue="email-rules" className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-6 bg-transparent p-0 rounded-none border-0 shadow-none">
          <TabsTrigger
            value="email-rules"
            className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent text-gray-500 hover:text-gray-700 rounded-none transition-all duration-200 py-3 text-sm font-medium border-0 border-b-2 border-transparent shadow-none"
          >
            Email Rules
          </TabsTrigger>
          <TabsTrigger
            value="job-rules"
            className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent text-gray-500 hover:text-gray-700 rounded-none transition-all duration-200 py-3 text-sm font-medium border-0 border-b-2 border-transparent shadow-none"
          >
            Job Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email-rules" className="pt-4 animate-fadeIn">
          {/* Email Rules Content */}
          <div className="space-y-6">
            {/* Automation Name and Description */}
            <div className="flex items-center justify-between">
              <div className="space-y-1.5 w-full">
                <div className="flex items-center justify-between gap-4">
                  <InputField
                    label=""
                    name="name"
                    placeholder="Automation name"
                    className="m-0 p-0"
                  />

                  <FormField
                    control={form.control}
                    name="enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormLabel className="text-sm font-medium cursor-pointer text-gray-700">
                          Enabled
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <InputField
                  label=""
                  multiline
                  rows={2}
                  name="description"
                  placeholder="Add a description (optional)"
                  className="m-0 p-0"
                />
              </div>
            </div>

            <Tabs
              value={activeStep}
              onValueChange={setActiveStep}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full mb-6 bg-transparent p-0 rounded-none border-0 shadow-none">
                <TabsTrigger
                  value="trigger"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent text-gray-500 hover:text-gray-700 rounded-none transition-all duration-200 py-3 text-sm font-medium border-0 border-b-2 border-transparent shadow-none"
                >
                  <span className="hidden sm:inline">1. </span>Trigger
                </TabsTrigger>
                <TabsTrigger
                  value="conditions"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent text-gray-500 hover:text-gray-700 rounded-none transition-all duration-200 py-3 text-sm font-medium border-0 border-b-2 border-transparent shadow-none"
                >
                  <span className="hidden sm:inline">2. </span>Conditions
                </TabsTrigger>
                <TabsTrigger
                  value="actions"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent text-gray-500 hover:text-gray-700 rounded-none transition-all duration-200 py-3 text-sm font-medium border-0 border-b-2 border-transparent shadow-none"
                >
                  <span className="hidden sm:inline">3. </span>Actions
                </TabsTrigger>
                <TabsTrigger
                  value="summary"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent text-gray-500 hover:text-gray-700 rounded-none transition-all duration-200 py-3 text-sm font-medium border-0 border-b-2 border-transparent shadow-none"
                >
                  <span className="hidden sm:inline">4. </span>Summary
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trigger" className="pt-4 animate-fadeIn">
                <TriggerSection
                  form={form}
                  onTriggerTypeChange={handleTriggerTypeChange}
                />
              </TabsContent>

              <TabsContent value="conditions" className="pt-4 animate-fadeIn">
                <ConditionsSection form={form} />
              </TabsContent>

              <TabsContent value="actions" className="pt-4 animate-fadeIn">
                <ActionsSection form={form} />
              </TabsContent>

              <TabsContent value="summary" className="pt-4 animate-fadeIn">
                <SummarySection form={form} />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="job-rules" className="pt-4 animate-fadeIn">
          {/* Job Rules Coming Soon */}
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Job Rules Coming Soon
              </h3>
              <p className="text-gray-600 mb-6">
                We're working on advanced job-based automation rules that will
                help you automate job posting, screening, and management
                workflows.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 mb-2">
                  Planned Features:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Auto-publish jobs based on criteria</li>
                  <li>• Smart job matching and recommendations</li>
                  <li>• Automated job status updates</li>
                  <li>• Bulk job operations</li>
                  <li>• Job template automation</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {Object.keys(formState.errors).length > 0 && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-4 flex items-center gap-2 animate-scaleIn">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>Please fix the validation errors before proceeding.</span>
        </div>
      )}

      <div className="flex justify-between pt-7">
        {activeStep !== "trigger" ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="gap-1 border-gray-300 transition-all duration-200 hover:border-indigo-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-gray-300 transition-all duration-200 hover:border-indigo-300"
          >
            Cancel
          </Button>
        )}

        {activeStep === "summary" ? (
          <Button
            type="button"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={formState.isSubmitting || !formState.isValid}
            className="bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 gap-1"
          >
            {formState.isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isEditing ? "Update Automation" : "Create Automation"}
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!formState.isValid}
            variant="secondary"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  if (mode === "dialog") {
    return (
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-0 animate-scaleIn p-8 rounded-xl shadow-none">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit" : "Create"} Automation
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isEditing
                ? "Update your automation workflow to automate recruitment tasks."
                : "Create a new automation workflow to automate recruitment tasks."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form>{formContent}</form>
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
