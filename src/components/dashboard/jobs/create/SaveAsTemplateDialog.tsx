import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import API from "@/http";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import type { JobFormSchema } from "@/lib/validations/forms/job-form-schema";
import type { CreateJobTemplateData } from "@/types/job-template";

interface SaveAsTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: JobFormSchema;
  onSaved?: () => void;
  isEditMode?: boolean;
  templateId?: string;
  existingTemplate?: {
    name: string;
    description?: string;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
  };
}

export const SaveAsTemplateDialog: React.FC<SaveAsTemplateDialogProps> = ({
  isOpen,
  onClose,
  formData,
  onSaved,
  isEditMode = false,
  templateId,
  existingTemplate,
}) => {
  const { subscription } = useAuthSessionContext();
  const [templateName, setTemplateName] = useState(existingTemplate?.name || "");
  const [description, setDescription] = useState(existingTemplate?.description || "");
  const [category, setCategory] = useState(existingTemplate?.category || "");
  const [isPublic, setIsPublic] = useState(existingTemplate?.isPublic || false);
  const [tags, setTags] = useState<string[]>(existingTemplate?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has Professional+ subscription for AI features
  const hasProfessionalFeatures = subscription?.planId === 'professional' || subscription?.planId === 'enterprise';

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setIsLoading(true);
    try {
      // Helper function to clean up empty values
      const cleanValue = (value: any) => {
        if (value === '' || value === null || value === undefined) {
          return undefined;
        }
        return value;
      };

      const templateData: CreateJobTemplateData = {
        name: templateName.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        jobTitle: formData.jobTitle,
        jobBoardTitle: cleanValue(formData.jobBoardTitle) || formData.jobTitle,
        jobDescription: formData.jobDescription,
        department: cleanValue(formData.department),
        customDepartment: cleanValue(formData.customDepartment),
        workplaceType: formData.workplaceType as string,
        employmentType: formData.employmentType as string,
        workSetting: cleanValue(formData.workSetting),
        country: cleanValue(formData.country),
        language: cleanValue(formData.language),
        hiringTimeline: cleanValue(formData.hiringTimeline),
        educationRequirement: cleanValue(formData.educationRequirement),
        payType: cleanValue(formData.payType),
        backgroundScreeningDisclaimer: formData.backgroundScreeningDisclaimer,
        // Only include jobLocation if it has meaningful data
        ...(formData.jobLocation && 
            (formData.jobLocation.address || formData.jobLocation.city || formData.jobLocation.state) && {
          jobLocation: {
            address: cleanValue(formData.jobLocation.address),
            city: cleanValue(formData.jobLocation.city),
            state: cleanValue(formData.jobLocation.state),
            country: cleanValue(formData.jobLocation.country) || 'US',
            zipCode: cleanValue(formData.jobLocation.zipCode),
          }
        }),
        payRate: formData.payRate,
        requiredQualifications: formData.requiredQualifications?.map(q => ({
          text: q.text,
          weight: Math.min(Math.max(Math.round((q.score || 0) / 10), 1), 10) // Convert 0-100 score to 1-10 weight
        })),
        preferredQualifications: formData.preferredQualifications?.map(q => ({
          text: q.text,
          weight: Math.min(Math.max(Math.round((q.score || 0) / 10), 1), 10) // Convert 0-100 score to 1-10 weight
        })),
        jobRequirements: formData.jobRequirements,
        customQuestions: formData.customQuestions,
        hoursPerWeek: formData.hoursPerWeek ? {
          min: formData.hoursPerWeek.min,
          max: formData.hoursPerWeek.max
        } : undefined,
        schedule: formData.schedule,
        benefits: formData.benefits,
        isPublic,
        tags: tags.length > 0 ? tags : [formData.department, formData.workplaceType, formData.employmentType].filter(Boolean) as string[],
        
        // Only include AI automation settings if user has Professional+ plan
        ...(hasProfessionalFeatures && formData.automation && {
          automation: {
            enabledRules: formData.automation.enabledRules || [],
            sectionWeights: formData.automation.sectionWeights || {},
            sectionThresholds: formData.automation.sectionThresholds || {},
            preferredQualScoring: formData.automation.preferredQualScoring || {},
            resumeItems: formData.automation.resumeItems || [],
            resumeItemScoring: formData.automation.resumeItemScoring || {},
            questionAutoFail: formData.automation.questionAutoFail || {},
            questionCriteria: formData.automation.questionCriteria || {},
            jobRules: formData.automation.jobRules || [],
            acceptanceThreshold: formData.automation.acceptanceThreshold || 76,
            manualReviewThreshold: formData.automation.manualReviewThreshold || 41,
            autoRejectThreshold: formData.automation.autoRejectThreshold || 40,
            templateId: formData.automation.templateId
          }
        })
      };

      // Remove undefined values and fields that shouldn't be sent to avoid backend validation errors
      const fieldsToExclude = ['id', '_id', 'createdAt', 'updatedAt', 'usageCount', 'isActive', 'createdBy', 'company'];
      
      Object.keys(templateData).forEach(key => {
        if (templateData[key as keyof CreateJobTemplateData] === undefined || 
            fieldsToExclude.includes(key)) {
          delete templateData[key as keyof CreateJobTemplateData];
        }
      });

      // Clean up jobLocation object if it exists and ensure it has required fields
      if (templateData.jobLocation) {
        Object.keys(templateData.jobLocation).forEach(key => {
          if (templateData.jobLocation![key as keyof typeof templateData.jobLocation] === undefined) {
            delete templateData.jobLocation![key as keyof typeof templateData.jobLocation];
          }
        });
        
        // If jobLocation doesn't have address, remove it entirely
        if (!templateData.jobLocation.address) {
          delete templateData.jobLocation;
        }
      }

      // Deep clean nested objects to remove any 'id' fields
      const cleanObject = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(item => cleanObject(item));
        } else if (obj && typeof obj === 'object') {
          const cleaned: any = {};
          Object.keys(obj).forEach(key => {
            if (!fieldsToExclude.includes(key) && obj[key] !== undefined) {
              cleaned[key] = cleanObject(obj[key]);
            }
          });
          return cleaned;
        }
        return obj;
      };

      const cleanedTemplateData = cleanObject(templateData);

      console.log('Sending template data:', cleanedTemplateData); // Debug log

      if (isEditMode && templateId) {
        await API.jobTemplate.updateJobTemplate(templateId, cleanedTemplateData);
        toast.success(`Template "${templateName}" updated successfully!`);
      } else {
        await API.jobTemplate.createJobTemplate(cleanedTemplateData);
        toast.success(`Template "${templateName}" created successfully!`);
      }
      
      // Reset form
      setTemplateName("");
      setDescription("");
      setCategory("");
      setIsPublic(false);
      setTags([]);
      setTagInput("");
      
      onSaved?.();
      onClose();
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            {isEditMode ? 'Update Template' : 'Save as Template'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isEditMode 
              ? 'Update this template with the current job configuration.'
              : 'Save your current job configuration as a reusable template'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name" className="text-sm font-medium text-gray-700">
              Template Name *
            </Label>
            <Input
              id="template-name"
              placeholder="e.g., Senior Software Engineer Template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of this template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category
            </Label>
            <Input
              id="category"
              placeholder="e.g., Engineering, Marketing, Sales"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
              Tags
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || isLoading}
                  className="px-4"
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isLoading}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Public Template */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is-public"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked === true)}
              disabled={isLoading}
            />
            <Label htmlFor="is-public" className="text-sm font-medium text-gray-700">
              Make this template public (visible to other team members)
            </Label>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Template Preview:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Job Title:</span> {formData.jobTitle}</p>
              <p><span className="font-medium">Department:</span> {formData.department || "Not specified"}</p>
              <p><span className="font-medium">Employment Type:</span> {formData.employmentType}</p>
              <p><span className="font-medium">Workplace Type:</span> {formData.workplaceType}</p>
              {hasProfessionalFeatures && (
                <p><span className="font-medium">AI Settings:</span> {formData.automation ? "Included" : "Not configured"}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !templateName.trim()}
          >
            {isLoading ? (
              isEditMode ? "Updating..." : "Creating..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Template' : 'Create Template'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
