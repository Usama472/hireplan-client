"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Save,
  Sparkles,
  Phone,
  Hash,
  MessageSquare,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { InputField } from "@/components/common/InputField";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/constants";
import API from "@/http";
import { useToast } from "@/lib/hooks/use-toast";
import * as z from 'zod';
import {
  SMS_CATEGORIES,
  SMS_MAX_LENGTH,
  CHAT_LINK_LENGTH,
  DEFAULT_TEMPLATE_VARIABLES,
  type CreateSMSTemplateRequest,
} from '@/interfaces/sms';

import { SMSVariableSection } from "../SMSVariableSection";

const smsTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  category: z.enum(['invite', 'notification', 'reminder', 'follow-up', 'custom']),
  message: z.string().min(1, 'Message is required').max(SMS_MAX_LENGTH - CHAT_LINK_LENGTH, `Message must be ${SMS_MAX_LENGTH - CHAT_LINK_LENGTH} characters or less (reserving space for chat link)`),
  description: z.string().max(500, 'Description must be 500 characters or less').default(''),
  isActive: z.boolean().default(true),
});

type SMSTemplateFormValues = z.infer<typeof smsTemplateSchema>;

export const CreateSMSTemplate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const { toast } = useToast();

  const form = useForm<SMSTemplateFormValues>({
    resolver: zodResolver(smsTemplateSchema),
    defaultValues: {
      name: "",
      category: "invite",
      message: "",
      description: "",
      isActive: true,
    },
  });

  const watchedMessage = form.watch('message');

  const insertVariable = (variableKey: string) => {
    const currentMessage = form.getValues('message');
    const cursorPosition = (document.activeElement as HTMLTextAreaElement)?.selectionStart || currentMessage.length;
    const variableText = `{{${variableKey}}}`;
    
    const newMessage = 
      currentMessage.slice(0, cursorPosition) + 
      variableText + 
      currentMessage.slice(cursorPosition);
    
    form.setValue('message', newMessage);

    // Show toast
    toast({
      title: "Variable inserted! 📱",
      description: `{{${variableKey}}} added to your message.`,
      duration: 2000,
    });
  };

  const getCharacterCount = () => {
    const messageLength = watchedMessage?.length || 0;
    // Add chat link length if message contains shortChatLink variable
    const hasShortChatLink = watchedMessage?.includes('{{shortChatLink}}');
    const linkLength = hasShortChatLink ? CHAT_LINK_LENGTH : 0;
    return messageLength + linkLength;
  };

  const getAvailableCharacters = () => {
    return SMS_MAX_LENGTH - getCharacterCount();
  };

  const isOverLimit = () => {
    return getCharacterCount() > SMS_MAX_LENGTH;
  };

  const onSubmit = useCallback(
    async (data: SMSTemplateFormValues) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      setSubmitStatus("idle");

      try {
        const templateData: CreateSMSTemplateRequest = {
          name: data.name.trim(),
          category: data.category,
          message: data.message.trim(),
          description: data.description?.trim() || undefined,
          maxLength: SMS_MAX_LENGTH,
          variables: [], // Extract from message if needed
        };

        await API.sms.createSMSTemplate(templateData);
        setSubmitStatus("success");

        toast({
          title: "SMS Template created successfully! 🎉",
          description: "Your SMS template has been saved and is ready to use.",
          duration: 5000,
        });

        setTimeout(() => {
          navigate(ROUTES.DASHBOARD.SMS);
        }, 1500);
      } catch (error: any) {
        console.error("Error creating SMS template:", error);
        setSubmitStatus("error");

        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create SMS template. Please try again.";

        toast.error("Error creating template", {
          description: errorMessage,
          duration: 5000,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, navigate, toast]
  );

  const goBack = useCallback(() => {
    navigate(ROUTES.DASHBOARD.SMS);
  }, [navigate]);

  const handleFormChange = useCallback(() => {
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
    }
  }, [submitStatus]);

  const watchedValues = form.watch();
  useEffect(() => {
    handleFormChange();
  }, [watchedValues, handleFormChange]);

  const loadTestData = () => {
    form.setValue("name", "Chat Invitation");
    form.setValue("category", "invite");
    form.setValue("message", `Hi {{applicant.firstName}}! Thanks for applying to {{company.name}}. Let's chat: {{shortChatLink}}`);
    form.setValue("description", "Invite applicants to start a chat conversation");
    form.setValue("isActive", true);

    toast({
      title: "Test data loaded! ✨",
      description: "SMS template form has been populated with sample data.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="group inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-all duration-200 hover:translate-x-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to SMS Management
          </button>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Phone className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Create SMS Template
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Design SMS templates with chat portal integration and dynamic variables
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={loadTestData}
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
                SMS Template created successfully!
              </p>
              <p className="text-sm text-emerald-700">
                Redirecting to SMS management...
              </p>
            </div>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">
                Failed to create SMS template
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
              {/* Main Form */}
              <div className="lg:col-span-3">
                <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                  <CardHeader className="pb-6 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-50">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-card-foreground">
                          SMS Template Configuration
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Configure your SMS template with variables and chat portal integration
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

                    {/* Template Name & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Template Name <span className="text-red-500">*</span>
                        </Label>
                        <InputField
                          name="name"
                          placeholder="e.g., Chat Invitation"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                          value={form.watch("category")} 
                          onValueChange={(value) => form.setValue("category", value as any)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {SMS_CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div>
                                  <div className="font-medium">{category.label}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {category.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <InputField
                        name="description"
                        placeholder="Brief description of when to use this template..."
                        disabled={isSubmitting}
                      />
                    </div>


                    {/* Message Template */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Message Template <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        {...form.register('message')}
                        placeholder={`Hi {{applicant.firstName}}, thanks for applying to {{job.jobTitle}}! We'd love to chat: {{shortChatLink}}`}
                        className={`min-h-[120px] ${isOverLimit() ? 'border-red-500' : ''}`}
                        disabled={isSubmitting}
                      />
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className={`flex items-center gap-1 ${isOverLimit() ? 'text-red-500' : getAvailableCharacters() < 20 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            <Hash className="h-3 w-3" />
                            {getCharacterCount()}/{SMS_MAX_LENGTH} characters
                          </span>
                          <span className={`flex items-center gap-1 ${getAvailableCharacters() < 20 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            <MessageSquare className="h-3 w-3" />
                            {getAvailableCharacters()} remaining
                          </span>
                        </div>
                        {isOverLimit() && (
                          <span className="text-red-500 text-xs">Message exceeds 160 character limit</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Use variables like {`{{applicant.firstName}}`} and {`{{shortChatLink}}`} for personalization.
                        The shortChatLink automatically directs users to the chat portal.
                      </p>
                    </div>

                    {/* SMS Preview */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">SMS Preview</Label>
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <div className="text-sm font-mono text-muted-foreground mb-2">SMS Message:</div>
                        <div className="p-3 bg-background rounded text-sm font-mono">
                          {watchedMessage || 'Your message will appear here...'}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Variables will be replaced with actual values when sent.
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/50">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        disabled={isSubmitting}
                        className="px-6 py-2 h-11 rounded-xl border-border/50 hover:bg-muted/50 transition-all duration-200"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || submitStatus === "success" || isOverLimit()}
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
                            Save SMS Template
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <SMSVariableSection onInsertVariable={insertVariable} />
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
