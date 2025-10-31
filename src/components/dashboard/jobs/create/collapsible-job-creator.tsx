import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Save, 
  Trash2, 
  FileText,
  Briefcase,
  Users,
  Calendar,
  Settings,
  Brain,
  Zap,
  Clock,
  Eye,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jobFormSchema, type JobFormSchema } from "@/lib/validations/forms/job-form-schema";
import { JOB_FORM_DEFAULT_VALUES } from "@/constants/job-form-defaults";
import API from "@/http";
import { toast } from "sonner";

// Import existing step components
import { JobAdStep } from "@/components/dashboard/jobs/common/job-ad-step";
import { CompanyPositionDetailsStep } from "@/components/dashboard/jobs/common/company-position-details-step";
import { JobQualificationsStep } from "@/components/dashboard/jobs/common/job-qualifications-step";
import { HoursScheduleBenefitsStep } from "@/components/dashboard/jobs/common/hours-schedule-benefits-step";
import { PostingScheduleBudgetStep } from "@/components/dashboard/jobs/common/posting-schedule-budget-step";
import { AIOverviewStep } from "@/components/dashboard/jobs/common/ai-overview-step";
import { CustomAutomationStep } from "@/components/dashboard/jobs/common/custom-automation-step";

interface JobDraft {
  id: string;
  title: string;
  formData: JobFormSchema;
  lastModified: Date;
  completedSections: string[];
}

interface CollapsibleJobCreatorProps {
  draftId?: string;
  onSave?: (jobId: string) => void;
  onCancel?: () => void;
}

const jobSections = [
  { id: "job-ad", title: "Job Details", icon: FileText, component: JobAdStep },
  { id: "position", title: "Position & Company", icon: Briefcase, component: CompanyPositionDetailsStep },
  { id: "qualifications", title: "Qualifications", icon: Users, component: JobQualificationsStep },
  { id: "schedule", title: "Schedule & Benefits", icon: Clock, component: HoursScheduleBenefitsStep },
  { id: "posting", title: "Posting & Budget", icon: Calendar, component: PostingScheduleBudgetStep },
  { id: "ai-overview", title: "AI Overview", icon: Brain, component: AIOverviewStep },
  { id: "automations", title: "Automations", icon: Zap, component: CustomAutomationStep },
];

export default function CollapsibleJobCreator({ draftId, onSave, onCancel }: CollapsibleJobCreatorProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["job-ad"]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const form = useForm<JobFormSchema>({
    resolver: zodResolver(jobFormSchema) as any,
    defaultValues: JOB_FORM_DEFAULT_VALUES,
    mode: "onChange",
  });

  const { watch, trigger, getValues, setValue } = form;
  const formData = watch();

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDraft) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isDraft, formData]);

  // Load draft if editing
  useEffect(() => {
    if (draftId) {
      loadDraft(draftId);
    }
  }, [draftId]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionCompletionStatus = (sectionId: string) => {
    // Basic validation for each section
    switch (sectionId) {
      case "job-ad":
        return !!(formData.jobTitle && formData.jobBoardTitle && formData.jobDescription);
      case "position":
        return !!(formData.department && formData.payRate && formData.positionsToHire);
      case "qualifications":
        return !!(formData.requiredQualifications && formData.requiredQualifications.length > 0);
      case "schedule":
        return !!(formData.startDate && formData.endDate);
      case "posting":
        return !!(formData.startDate);
      case "ai-overview":
        return true; // AI overview is optional
      case "automations":
        return true; // Automations are optional
      default:
        return false;
    }
  };

  const getCompletedSectionsCount = () => {
    return jobSections.filter(section => getSectionCompletionStatus(section.id)).length;
  };

  const saveDraft = async () => {
    try {
      const draftData = {
        title: formData.jobTitle || "Untitled Job",
        formData,
        completedSections: jobSections.filter(s => getSectionCompletionStatus(s.id)).map(s => s.id),
      };

      if (draftId) {
        await API.jobDraft.updateJobDraft(draftId, draftData);
      } else {
        const response = await API.jobDraft.createJobDraft(draftData);
        // Update URL or handle new draft ID
      }
      
      toast.success("Draft saved");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    }
  };

  const loadDraft = async (id: string) => {
    try {
      const response = await API.jobDraft.getJobDraft(id);
      const draft = response.data?.draft || response.draft;
      
      // Set form values
      Object.keys(draft.formData).forEach((key) => {
        setValue(key as keyof JobFormSchema, draft.formData[key]);
      });
      
      setIsDraft(true);
      toast.success("Draft loaded");
    } catch (error) {
      console.error("Error loading draft:", error);
      toast.error("Failed to load draft");
    }
  };

  const publishJob = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate all sections
      const isValid = await trigger();
      if (!isValid) {
        toast.error("Please complete all required fields");
        return;
      }

      const response = await API.job.createJob(formData);
      
      // Delete draft if it exists
      if (draftId) {
        await API.jobDraft.deleteJobDraft(draftId);
      }
      
      toast.success("Job published successfully!");
      if (onSave) {
        onSave(response.data.job.id);
      }
    } catch (error: any) {
      toast.error("Failed to publish job", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedCount = getCompletedSectionsCount();
  const totalSections = jobSections.length;
  const completionPercentage = Math.round((completedCount / totalSections) * 100);

  return (
    <FormProvider {...form}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {draftId ? "Edit Job Draft" : "Create New Job"}
            </h1>
            <p className="text-gray-600 mt-1">
              {completedCount}/{totalSections} sections completed ({completionPercentage}%)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                saveDraft();
                setIsDraft(true);
              }}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button
              onClick={publishJob}
              disabled={isSubmitting || completedCount < 4} // Require at least 4 sections
              className="bg-primary hover:bg-primary/90"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isSubmitting ? "Publishing..." : "Publish Job"}
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                {completionPercentage}% Complete
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          {jobSections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const isCompleted = getSectionCompletionStatus(section.id);
            const Icon = section.icon;
            const Component = section.component;

            return (
              <Card key={section.id} className={`overflow-hidden ${isCompleted ? 'border-green-200' : 'border-gray-200'}`}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isCompleted ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {isCompleted ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <Icon className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            <p className="text-sm text-gray-500">
                              {isCompleted ? "Completed" : "Not completed"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-800">
                              ✓ Complete
                            </Badge>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 border-t border-gray-100">
                      <div className="py-6">
                        <Component />
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                saveDraft();
                setIsDraft(true);
              }}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={publishJob}
              disabled={isSubmitting || completedCount < 4}
              className="bg-primary hover:bg-primary/90"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isSubmitting ? "Publishing..." : "Publish Job"}
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
