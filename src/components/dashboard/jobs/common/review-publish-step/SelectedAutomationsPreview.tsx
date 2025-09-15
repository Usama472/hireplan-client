import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { allTriggers } from "@/constants/automations-constants";
import API from "@/http";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileCheck,
  Mail,
  Target,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";

interface Automation {
  id: string;
  name: string;
  status: "active" | "inactive";
  useConditions: boolean;
  conditions: any[];
  actions: any[];
  triggerType: string;
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SelectedAutomationsPreviewProps {
  automations: string[];
}

export function SelectedAutomationsPreview({
  automations: selectedAutomationIds,
}: SelectedAutomationsPreviewProps) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAutomations = async () => {
    if (selectedAutomationIds.length === 0) {
      setAutomations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all automations and filter by selected IDs
      const response = await API.automation.getAutomations();
      if (response.success) {
        const selectedAutomations = response.results.filter((automation) =>
          selectedAutomationIds.includes(automation.id)
        );
        setAutomations(selectedAutomations);
      }
    } catch (err) {
      console.error("Error fetching selected automations:", err);
      setError("Failed to load selected automations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [selectedAutomationIds]);

  const getTriggerInfo = (triggerType: string) => {
    return allTriggers.find((trigger) => trigger.type === triggerType);
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "application_created":
        return <UserCheck className="h-5 w-5 text-blue-600" />;
      case "application_status_changed":
        return <FileCheck className="h-5 w-5 text-indigo-600" />;
      case "resume_score_updated":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "job_created":
        return <Briefcase className="h-5 w-5 text-amber-600" />;
      case "job_published":
        return <Briefcase className="h-5 w-5 text-emerald-600" />;
      case "job_expired":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "cron":
        return <Calendar className="h-5 w-5 text-purple-600" />;
      default:
        return <Zap className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionTypeIcon = (actionType: string) => {
    switch (actionType) {
      case "send_email_applicant":
      case "send_email_recruiter":
      case "send_email_recruiter_team":
      case "send_email_reminders":
        return <Mail className="h-4 w-4 text-blue-600" />;
      case "update_job_status":
        return <FileCheck className="h-4 w-4 text-emerald-600" />;
      case "send_pipeline_summary":
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      case "auto_expire_jobs":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    switch (actionType) {
      case "send_email_applicant":
        return "Email Applicant";
      case "send_email_recruiter":
        return "Email Recruiter";
      case "send_email_recruiter_team":
        return "Email Team";
      case "send_email_reminders":
        return "Email Reminders";
      case "update_job_status":
        return "Update Status";
      case "send_pipeline_summary":
        return "Pipeline Summary";
      case "auto_expire_jobs":
        return "Auto Expire";
      default:
        return actionType;
    }
  };

  if (selectedAutomationIds.length === 0) {
    return (
      <div className="space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Custom Automations
          </h2>
          <p className="text-gray-600">
            Review the custom automations that will be applied to this job
            posting.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Zap className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Automations Selected
          </h3>
          <p className="text-gray-500">
            No custom automations have been selected for this job posting.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white border rounded-lg p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Error loading automations</span>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Custom Automations</h2>
        <p className="text-gray-600">
          Review the custom automations that will be applied to this job
          posting.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Zap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Selected Automations
            </h3>
            <p className="text-sm text-gray-600">
              {automations.length} automation
              {automations.length !== 1 ? "s" : ""} will be applied to this job
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((automation) => {
            const triggerInfo = getTriggerInfo(automation.triggerType);

            return (
              <div
                key={automation.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                    {getTriggerIcon(automation.triggerType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {automation.name}
                      </h4>
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          automation.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {triggerInfo?.label || automation.triggerType}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Conditions:</span>
                    <span className="font-medium text-gray-900">
                      {automation.useConditions
                        ? automation.conditions.length
                        : 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Actions:</span>
                    <span className="font-medium text-gray-900">
                      {automation.actions.length}
                    </span>
                  </div>
                </div>

                {/* Actions Preview */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Actions
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {automation.actions.slice(0, 2).map((action, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs"
                      >
                        {getActionTypeIcon(action.type)}
                        <span className="text-gray-700">
                          {getActionTypeLabel(action.type)}
                        </span>
                      </div>
                    ))}
                    {automation.actions.length > 2 && (
                      <div className="flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-500">
                        +{automation.actions.length - 2} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant={
                      automation.status === "active" ? "default" : "secondary"
                    }
                    className={`text-xs ${
                      automation.status === "active"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {automation.status === "active" ? "Active" : "Paused"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
