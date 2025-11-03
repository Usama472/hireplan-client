import TriggerSection from "./trigger-section";
import { useAutomation } from "@/contexts/AutomationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "@/http";

// Import the trigger components
import ContextApplicationCreatedTrigger from "../triggers/context-application-created-trigger";
import JobCreatedTrigger from "../triggers/job-created";
import JobPublishedTrigger from "../triggers/job-published";
import JobExpiredTrigger from "../triggers/job-expired";
import ApplicationStatusChangeTrigger from "../triggers/application-status-change";
import ResumeScoreUpdatedTrigger from "../triggers/resume-score-updated";
import AIFollowupTrigger from "../triggers/ai-followup-trigger";
import ScheduledTimeTrigger from "../triggers/scheduled-time";

export default function AutomationBuilder() {
  const { 
    isEditMode, 
    automation, 
    automationName, 
    setAutomationName,
    selectedTriggerType,
    setSelectedTriggerType,
    automationStatus,
    useConditions,
    conditions,
    actions,
    scoreRules,
    labels,
    schedule,
    isValid,
    validationMessage,
    formTouched,
    setFormTouched,
    setIsValid,
    setValidationMessage
  } = useAutomation();
  
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Validation function
  const validateForm = () => {
    if (!automationName.trim()) {
      setIsValid(false);
      setValidationMessage("Please enter an automation name");
      return false;
    }

    if (!selectedTriggerType) {
      setIsValid(false);
      setValidationMessage("Please select a trigger type");
      return false;
    }

    if (actions.length === 0 && scoreRules.length === 0) {
      setIsValid(false);
      setValidationMessage("At least one action is required");
      return false;
    }

    // Validate actions have required fields
    for (const action of actions) {
      if (
        action.type === "send_email_recruiter" ||
        action.type === "send_email_recruiter_team" ||
        action.type === "send_email_applicant"
      ) {
        if (!action.config.templateId || action.config.templateId === "") {
          setIsValid(false);
          const recipient = action.type === "send_email_recruiter" 
            ? "recruiter" 
            : action.type === "send_email_recruiter_team" 
            ? "recruiter team"
            : "applicant";
          setValidationMessage(
            `Please select an email template for the ${recipient} email action`
          );
          return false;
        }
      }
      
      if (action.type === "send_sms" || action.type === "send_chat_invite") {
        if (!action.config.smsTemplateId || action.config.smsTemplateId === "") {
          setIsValid(false);
          setValidationMessage("Please select an SMS template for the SMS action");
          return false;
        }
      }
    }

    setIsValid(true);
    setValidationMessage("");
    return true;
  };

  const handleSave = async () => {
    setFormTouched(true);
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const automationData = {
        name: automationName.trim(),
        status: automationStatus ? 'active' : 'inactive',
        triggerType: selectedTriggerType,
        useConditions: useConditions,
        conditions: useConditions ? conditions : [],
        actions: selectedTriggerType === 'ai_followup' ? [] : actions,
        scoreRules: selectedTriggerType === 'ai_followup' ? scoreRules : [],
        labels: labels,
        schedule: selectedTriggerType === 'cron' ? schedule : undefined,
      };

      let response;
      if (isEditMode && automation?.id) {
        response = await API.automation.updateAutomation(automation.id, automationData);
      } else {
        response = await API.automation.createAutomation(automationData);
      }

      if (response?.success) {
        toast.success(`Automation ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate("/dashboard/automations");
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} automation`);
      }
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} automation:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} automation`, {
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // If no trigger is selected, show the trigger selection
  if (!selectedTriggerType) {
    return (
      <div className="rounded-lg p-2.5 sm:p-3 min-h-[400px] space-y-6">
        {/* Automation Name Input */}
        <div className="space-y-2">
          <Label htmlFor="automation-name" className="text-base font-semibold">
            Automation Name
          </Label>
          <Input
            id="automation-name"
            value={automationName}
            onChange={(e) => setAutomationName(e.target.value)}
            placeholder="Enter automation name..."
            className="max-w-md"
          />
          {isEditMode && (
            <p className="text-xs text-gray-500">
              Editing: {automation?.name || "Unnamed Automation"}
            </p>
          )}
        </div>

        {/* Trigger Selection */}
        <div>
          <h3 className="text-base font-semibold mb-2.5">
            When should this automation run?
          </h3>
          <TriggerSection />
        </div>
      </div>
    );
  }

  // Show the appropriate trigger component based on selectedTriggerType
  const renderTriggerComponent = () => {
    switch (selectedTriggerType) {
      case "application_created":
        return <ContextApplicationCreatedTrigger />;
      case "job_created":
        return <JobCreatedTrigger />;
      case "job_published":
        return <JobPublishedTrigger />;
      case "job_expired":
        return <JobExpiredTrigger />;
      case "application_status_changed":
        return <ApplicationStatusChangeTrigger />;
      case "resume_score_updated":
        return <ResumeScoreUpdatedTrigger />;
      case "ai_followup":
        return <AIFollowupTrigger />;
      case "cron":
        return <ScheduledTimeTrigger />;
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Trigger component for "{selectedTriggerType}" is not implemented yet.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                // Reset trigger selection using the context from the parent component
                setSelectedTriggerType('');
              }}
              className="mt-4"
            >
              Go Back to Trigger Selection
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Error/Validation Message */}
      {!isValid && formTouched && validationMessage && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {validationMessage}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Render the trigger-specific component */}
      {renderTriggerComponent()}
    </div>
  );
}
