"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Save,
  Sparkles,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { InputField } from "@/components/common/InputField";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  EMAIL_TEMPLATE_CATEGORIES,
  ROUTES,
  TEST_EMAIL_TEMPLATES,
} from "@/constants";
import API from "@/http";
import { INPUT_TYPES, type EmailTemplate } from "@/interfaces";
import { useToast } from "@/lib/hooks/use-toast";
import { emailTemplateSchema } from "@/lib/validations/forms";

import { VariableSection } from "../VariableSection";

type EmailTemplateFormValues = {
  name: string;
  category: string;
  subject: string;
  body: string;
  isActive: boolean;
  description?: string;
};

export const CreateEmailTemplate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [bodyEditor, setBodyEditor] = useState<any>(null);

  const { toast } = useToast();

  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema) as any,
    defaultValues: {
      name: "",
      category: "",
      subject: "",
      body: "",
      isActive: true,
      description: "",
    },
  });

  const insertVariable = (variable: string) => {
    // Insert variable into editor at cursor position (or append if no cursor)
    if (bodyEditor) {
      try {
        // Focus the editor first
        bodyEditor.chain().focus().run();

        // Insert the variable at cursor position
        // If no selection, it will insert at cursor; if selection, it replaces it
        bodyEditor.chain().insertContent(variable).run();

        // Update form value to sync
        const html = bodyEditor.getHTML();
        form.setValue("body", html, { shouldValidate: true });
      } catch (error) {
        console.error("Error inserting variable:", error);
        // Fallback: append to end if insertion fails
        const currentContent = bodyEditor.getHTML();
        const newContent = currentContent
          ? `${currentContent} ${variable}`
          : variable;
        bodyEditor.commands.setContent(newContent);
        form.setValue("body", newContent, { shouldValidate: true });
      }
    } else {
      // If editor not ready, append to form value
      const currentBody = form.getValues("body") || "";
      form.setValue(
        "body",
        currentBody ? `${currentBody} ${variable}` : variable
      );
    }

    // Also copy variable to clipboard for convenience
    navigator.clipboard
      .writeText(variable)
      .then(() => {
        toast({
          title: "Variable inserted! ✨",
          description: `${variable} inserted into email body and copied to clipboard.`,
          duration: 3000,
          type: "success",
        });
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = variable;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        toast({
          title: "Variable inserted! ✨",
          description: `${variable} inserted into email body and copied to clipboard.`,
          duration: 3000,
          type: "success",
        });
      });
  };

  const onSubmit = useCallback(
    async (data: EmailTemplateFormValues) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setSubmitStatus("idle");

      try {
        // Transform form data to match API interface
        const templateData: EmailTemplate = {
          name: data.name.trim(),
          category: data.category,
          subject: data.subject.trim(),
          body: data.body.trim(),
          isActive: data.isActive,
          description: data.description?.trim() || undefined,
        };

        // Call API to create template
        await API.emailTemplate.createEmailTemplate(templateData);

        setSubmitStatus("success");

        toast({
          title: "Template created successfully! 🎉",
          description:
            "Your email template has been saved and is ready to use.",
          type: "success",
          duration: 5000,
        });

        // Redirect to templates list after successful creation
        setTimeout(() => {
          navigate(ROUTES.DASHBOARD.EMAIL_TEMPLATES);
        }, 1500);
      } catch (error: any) {
        console.error("Error creating template:", error);
        setSubmitStatus("error");

        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create template. Please try again.";

        toast({
          title: "Error creating template",
          description: errorMessage,
          type: "error",
          duration: 5000,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, navigate, toast]
  );

  const goBack = useCallback(() => {
    navigate("/dashboard/email-template");
  }, [navigate]);

  const handleFormChange = useCallback(() => {
    // Reset submit status when user makes changes
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
    }
  }, [submitStatus]);

  // Watch form changes to reset status
  const watchedValues = form.watch();
  useEffect(() => {
    handleFormChange();
  }, [watchedValues, handleFormChange]);

  // Watch body field changes to sync with editor
  const bodyValue = form.watch("body");
  useEffect(() => {
    // The InputField will handle content synchronization automatically
  }, [bodyValue]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section - Enhanced */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="group inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-all duration-200 hover:translate-x-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Templates
          </button>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Create Email Template
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Design professional email templates with dynamic variables
                    and rich formatting
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const template = TEST_EMAIL_TEMPLATES[0]; // Load first template
                  form.setValue("name", template.name);
                  form.setValue("category", template.category);
                  form.setValue("subject", template.subject);
                  form.setValue("body", template.body);
                  form.setValue("description", template.description);
                  form.setValue("isActive", true);

                  // Force editor update by directly calling the change handler
                  // The InputField will handle the content update automatically
                  form.setValue("body", template.body);

                  toast({
                    title: "Test data loaded! ✨",
                    description:
                      "Template form has been populated with sample data.",
                    duration: 3000,
                    type: "success",
                  });
                }}
                disabled={isSubmitting}
                className="px-4 py-2 h-10 rounded-lg border-border/50 hover:bg-muted/50 transition-all duration-200"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Load Test Data
              </Button>
            </div>
          </div>
        </div>

        {/* Success/Error Status Banner */}
        {submitStatus === "success" && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800">
                Template created successfully!
              </p>
              <p className="text-sm text-emerald-700">
                Redirecting to templates list...
              </p>
            </div>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">
                Failed to create template
              </p>
              <p className="text-sm text-red-700">
                Please check your input and try again.
              </p>
            </div>
          </div>
        )}

        {/* Form Validation Summary */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="font-medium text-amber-800">
                Please fix the following errors:
              </p>
            </div>
            <ul className="space-y-1 text-sm text-amber-700">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                  <span className="capitalize">
                    {field.replace(/([A-Z])/g, " $1").toLowerCase()}:
                  </span>
                  <span>{error?.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            onChange={handleFormChange}
          >
            <div className="w-full">
              {/* Main Form - Enhanced Design */}
              <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                <CardHeader className="pb-6 bg-white border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-card-foreground">
                        Template Configuration
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Configure your email template with variables and rich
                        content
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Template Status */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Template Status
                    </Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={form.watch("isActive")}
                        onCheckedChange={(checked) =>
                          form.setValue("isActive", checked)
                        }
                        disabled={isSubmitting}
                      />
                      <span className="text-sm font-medium">
                        {form.watch("isActive") ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs ml-2">
                        {form.watch("isActive")
                          ? "Template is available for use"
                          : "Template is hidden from users"}
                      </span>
                    </div>
                  </div>

                  {/* Template Name & Category - Enhanced Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <InputField
                        name="name"
                        label="Template Name"
                        placeholder="e.g., Interview Invitation"
                        showIsRequired
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <InputField
                        name="category"
                        label="Category"
                        type="select"
                        selectOptions={EMAIL_TEMPLATE_CATEGORIES.map((cat) => ({
                          value: cat.value,
                          label: `${cat.icon} ${cat.label}`,
                        }))}
                        showIsRequired
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Description - Enhanced */}
                  <div className="space-y-2">
                    <InputField
                      name="description"
                      label="Description"
                      placeholder="Brief description of when to use this template..."
                      multiline
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Subject Line - Enhanced */}
                  <div className="space-y-2">
                    <InputField
                      name="subject"
                      label="Subject Line"
                      placeholder="e.g., Interview Invitation for {{job_title}} position"
                      showIsRequired
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Variable Section - Horizontal View */}
                  <div className="space-y-3">
                    <VariableSection
                      onInsertVariable={insertVariable}
                      variant="horizontal"
                    />
                  </div>

                  {/* Email Body - Enhanced */}
                  <div className="space-y-3">
                    <InputField
                      name="body"
                      label="Email Body"
                      placeholder="Enter your email template content..."
                      type={INPUT_TYPES.EDITOR}
                      showIsRequired
                      disabled={isSubmitting}
                      editorRef={setBodyEditor}
                    />
                  </div>

                  {/* Action Buttons - Enhanced */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/50">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goBack}
                      disabled={isSubmitting}
                      className="px-6 py-2 h-11 rounded-xl border-border/50 hover:bg-muted/50 transition-all duration-200 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || submitStatus === "success"}
                      className="px-8 py-2 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 disabled:hover:scale-100 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : submitStatus === "success" ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Template Created!
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Template
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
