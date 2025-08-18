import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { DeleteEmailTemplateModal } from "../DeleteEmailTemplateModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/hooks/use-toast";
import { InputField } from "@/components/common/InputField";
import { VariableSection } from "../VariableSection";
import { emailTemplateSchema } from "@/lib/validations/forms";
import { INPUT_TYPES, type EmailTemplate } from "@/interfaces";
import { EMAIL_TEMPLATE_CATEGORIES } from "@/constants";
import { updateEmailTemplate } from "@/http/email-template/api";
import API from "@/http";

type EditEmailTemplateFormValues = {
  name: string;
  category: string;
  subject: string;
  body: string;
  isActive: boolean;
  description?: string;
};

export const EditEmailTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isViewMode, setIsViewMode] = useState(
    searchParams.get("mode") === "view"
  );

  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch template data on component mount
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Template ID is required",
          duration: 3000,
          type: "error",
        });
        navigate("/dashboard/email-templates");
        return;
      }

      try {
        setIsFetching(true);
        const { status, emailTemplate } = await API.emailTemplate.getEmailTemplate(id);
        if (status) {
          form.reset({
            name: emailTemplate.name || "",
            category: emailTemplate.category || "",
            subject: emailTemplate.subject || "",
            body: emailTemplate.body || "",
            isActive: emailTemplate.isActive ?? true,
            description: emailTemplate.description || "",
          });
        }
      } catch (error) {
        console.error("Error fetching template:", error);
        toast({
          title: "Error",
          description: "Failed to fetch email template",
          type: "error",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Handle URL search params changes
  useEffect(() => {
    setIsViewMode(searchParams.get("mode") === "view");
  }, [searchParams]);

  const form = useForm<EditEmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema),
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
    // Copy variable to clipboard
    navigator.clipboard
      .writeText(variable)
      .then(() => {
        toast({
          title: "Variable copied! 📋",
          description: `${variable} copied to clipboard successfully.`,
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
          title: "Variable copied! 📋",
          description: `${variable} copied to clipboard successfully.`,
          duration: 3000,
          type: "success",
        });
      });
  };

  const onSubmit = async (data: EditEmailTemplateFormValues) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Template data not found",
        duration: 3000,
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setSubmitStatus("idle");


    try {
      const updatedTemplate: EmailTemplate = {
        ...data,
        // id: id,
      };

      await updateEmailTemplate(id, updatedTemplate);

      setSubmitStatus("success");

      toast({
        title: "Template updated successfully! 🎉",
        description:
          "Your email template has been updated and is ready to use.",
        duration: 5000,
        type: "success",
      });

      // Redirect to templates list after successful update
      setTimeout(() => {
        navigate("/dashboard/email-templates");
      }, 1500);
    } catch (error) {
      console.error("Error updating template:", error);
      setSubmitStatus("error");

      const errorMessage =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Failed to update template. Please try again.";

      toast({
        title: "Update failed",
        description: errorMessage,
        duration: 5000,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleViewMode = () => {
    const newMode = !isViewMode;
    setIsViewMode(newMode);
    navigate(
      `/dashboard/email-templates/edit/${id}${newMode ? "?mode=view" : ""}`
    );
  };

  const goBack = () => {
    navigate("/dashboard/email-templates");
  };

  const handleDeleteSuccess = () => {
    navigate("/dashboard/email-templates");
  };

  const handleFormChange = () => {
    // Reset submit status when user makes changes
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
    }
  };

  // Watch form changes to reset status
  const watchedValues = form.watch();
  useEffect(() => {
    handleFormChange();
  }, [watchedValues]);

  // Show loading state while fetching template data
  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading template...</p>
        </div>
      </div>
    );
  }

  // Show error state if template is not found
  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Template not found</p>
          <Button onClick={() => navigate("/dashboard/email-templates")}>
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
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
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {isViewMode ? "View Email Template" : "Edit Email Template"}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {isViewMode
                    ? "Review your email template details and content"
                    : "Modify your email template for the recruitment process"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Status Banner */}
        {submitStatus === "success" && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800">
                Template updated successfully!
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
                Failed to update template
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
            onSubmit={form.handleSubmit(onSubmit)}
            onChange={handleFormChange}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Form - Enhanced Design */}
              <div className="lg:col-span-3">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-card-foreground">
                          Template Configuration
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {isViewMode
                            ? "Template information and content"
                            : "Update your template details and content"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {/* Template Status - Enhanced */}
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <Label className="text-sm font-medium text-card-foreground">
                            Template Status
                          </Label>
                          <Switch
                            checked={form.watch("isActive")}
                            onCheckedChange={(checked) =>
                              form.setValue("isActive", checked)
                            }
                            disabled={isViewMode || isLoading}
                          />
                        </div>
                        <Badge
                          variant={
                            form.watch("isActive") ? "default" : "secondary"
                          }
                          className="px-3 py-1 rounded-full"
                        >
                          {form.watch("isActive") ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {form.watch("isActive")
                          ? "Template is available for use"
                          : "Template is hidden from users"}
                      </p>
                    </div>

                    {/* Template Name & Category - Enhanced Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <InputField
                          name="name"
                          label="Template Name"
                          placeholder="e.g., Interview Invitation"
                          showIsRequired
                          disabled={isViewMode || isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <InputField
                          name="category"
                          label="Category"
                          type="select"
                          selectOptions={EMAIL_TEMPLATE_CATEGORIES.map(
                            (cat) => ({
                              value: cat.value,
                              label: `${cat.icon} ${cat.label}`,
                            })
                          )}
                          showIsRequired
                          disabled={isViewMode || isLoading}
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
                        disabled={isViewMode || isLoading}
                      />
                    </div>

                    {/* Subject Line - Enhanced */}
                    <div className="space-y-2">
                      <InputField
                        name="subject"
                        label="Subject Line"
                        placeholder="e.g., Interview Invitation for {{job_title}} position"
                        showIsRequired
                        disabled={isViewMode || isLoading}
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
                        disabled={isViewMode || isLoading}
                      />
                    </div>

                    {/* Action Buttons - Enhanced */}
                    {!isViewMode && (
                      <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/50">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={goBack}
                          disabled={isLoading}
                          className="px-6 py-2 h-11 rounded-xl border-border/50 hover:bg-muted/50 transition-all duration-200 bg-transparent"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading || submitStatus === "success"}
                          className="px-8 py-2 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 disabled:hover:scale-100 disabled:opacity-70"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Updating...
                            </>
                          ) : submitStatus === "success" ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Template Updated!
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Update Template
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Enhanced Design */}
              <div className="lg:col-span-1 space-y-6">
                <VariableSection onInsertVariable={insertVariable} />

                {/* View Mode Toggle & Actions */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4 bg-gradient-to-r from-muted/10 to-accent/10 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted/10 text-muted-foreground">
                        {isViewMode ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-card-foreground">
                          Actions
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Toggle view mode and manage template
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={toggleViewMode}
                      className="w-full bg-blue-200/10 border-blue-300 hover:border-blue-500 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
                    >
                      {isViewMode ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Switch to Edit Mode
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Switch to View Mode
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="w-full bg-red-200/10 border-red-300 hover:border-red-500 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Template
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </FormProvider>

        {/* Delete Email Template Modal */}
        <DeleteEmailTemplateModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleteSuccess={handleDeleteSuccess}
          templateId={id || ""}
          templateName={form.watch("name") || "Email Template"}
        />
      </div>
    </div>
  );
};
