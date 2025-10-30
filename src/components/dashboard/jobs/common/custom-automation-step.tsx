import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { allTriggers } from "@/constants/automations-constants";
import API from "@/http";
import { useAITemplates } from "@/hooks/useAITemplates";
import {
  AlertCircle,
  Brain,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileCheck,
  Mail,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

interface Automation {
  id: string;
  name: string;
  status: "active" | "inactive";
  useConditions: boolean;
  conditions: any[];
  actions: any[];
  triggerType: string;
  labels: string[];
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AutomationsResponse {
  success: boolean;
  results: Automation[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface CustomAutomationStepProps {
  title?: string;
  description?: string;
  className?: string;
  automations?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  isSelectable?: boolean;
}

// Helper function to check if automation has AI follow-up actions
const hasAIFollowupAction = (automation: Automation): boolean => {
  // Check regular actions
  const hasInActions = automation.actions?.some((action: any) => 
    action.type === 'ai_follow_up' || action.type === 'send_another_followup'
  );

  // Check score rules
  const hasInScoreRules = (automation as any).scoreRules?.some((rule: any) =>
    rule.actions?.some((action: any) => 
      action.type === 'ai_follow_up' || action.type === 'send_another_followup'
    )
  );

  return hasInActions || hasInScoreRules;
};

export const CustomAutomationStep: React.FC<CustomAutomationStepProps> = ({
  title = "Custom Automation",
  description = "Configure automated workflows and rules to streamline your hiring process. Set up triggers, actions, and conditions to automatically handle applications.",
  className = "",
  automations: selectedAutomationIds = [],
  onSelectionChange,
  isSelectable = false,
}) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [filteredAutomations, setFilteredAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    selectedAutomationIds
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);
  const { templates: aiTemplates } = useAITemplates();
  const { watch, setValue } = useFormContext();

  const aiFollowupTemplate = watch("aiFollowupTemplate") || {
    enabled: false,
    questions: [],
    emailSubject: "",
    responseDeadlineHours: 72,
    templateId: "",
  };

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const response: AutomationsResponse =
        await API.automation.getAutomations();
      if (response.success) {
        const activeAutomations = response.results.filter((a) => a.status === "active");
        setAutomations(activeAutomations);
        setFilteredAutomations(activeAutomations);
        
        // Extract unique labels
        const allLabels = activeAutomations.flatMap(a => a.labels || []);
        const uniqueLabels = [...new Set(allLabels)].sort();
        setAvailableLabels(uniqueLabels);
      }
    } catch (error) {
      console.error("Error fetching automations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  // Sync with external selectedAutomationIds prop
  useEffect(() => {
    setSelectedIds(selectedAutomationIds);
  }, [selectedAutomationIds]);

  // Filter automations based on search and label
  useEffect(() => {
    let filtered = automations;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(automation => 
        automation.name.toLowerCase().includes(searchLower) ||
        automation.labels.some(label => label.toLowerCase().includes(searchLower))
      );
    }

    // Filter by selected label
    if (selectedLabel) {
      filtered = filtered.filter(automation => 
        automation.labels.includes(selectedLabel)
      );
    }

    setFilteredAutomations(filtered);
  }, [automations, searchTerm, selectedLabel]);

  const handleSelectionChange = (automationId: string, isSelected: boolean) => {
    const newSelectedIds = isSelected
      ? [...selectedIds, automationId]
      : selectedIds.filter((id) => id !== automationId);

    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

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

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      <div className="flex items-start gap-3 sm:gap-4 px-1">
        <div className="p-2 sm:p-3 bg-blue-50 rounded-lg flex-shrink-0">
          <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600">{description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      {!loading && automations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search automations by name or labels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Label Filter */}
            {availableLabels.length > 0 && (
              <div className="sm:w-64">
                <Select value={selectedLabel} onValueChange={setSelectedLabel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by label" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All labels</SelectItem>
                    {availableLabels.map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchTerm || selectedLabel) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedLabel && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Label: {selectedLabel}
                  <button
                    onClick={() => setSelectedLabel("")}
                    className="ml-1 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedLabel("");
                }}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Results count */}
          <div className="text-sm text-gray-500">
            Showing {filteredAutomations.length} of {automations.length} automations
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border rounded-xl p-4 sm:p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredAutomations.length === 0 && automations.length > 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No matching automations
          </h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your search terms or filters to find automations
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedLabel("");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : automations.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Automations Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first automation to streamline your recruitment process
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium text-xs sm:text-sm">
                  {automations.filter((a) => a.status === "active").length}{" "}
                  Active
                </span>
              </div>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  {automations.filter((a) => a.status === "inactive").length}{" "}
                  Paused
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAutomations.map((automation) => {
              const triggerInfo = getTriggerInfo(automation.triggerType);

              return (
                <div
                  key={automation.id}
                  className={`bg-white border rounded-xl transition-all duration-200 p-4 sm:p-6 flex flex-col ${
                    isSelectable
                      ? selectedIds.includes(automation.id)
                        ? "border-blue-200 bg-blue-50/30 cursor-pointer"
                        : "border-gray-100 hover:border-gray-200 cursor-pointer"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                  onClick={() => {
                    if (isSelectable) {
                      handleSelectionChange(
                        automation.id,
                        !selectedIds.includes(automation.id)
                      );
                    }
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="p-2 sm:p-3 bg-gray-50 rounded-lg flex-shrink-0">
                        {getTriggerIcon(automation.triggerType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                            {automation.name}
                          </h3>
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
                    {isSelectable && selectedIds.includes(automation.id) && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="text-gray-500">Conditions:</div>
                      <div className="font-semibold text-gray-900">
                        {automation.useConditions
                          ? automation.conditions.length
                          : 0}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="text-gray-500">Actions:</div>
                      <div className="font-semibold text-gray-900">
                        {automation.actions.length}
                      </div>
                    </div>
                  </div>

                  {/* Labels */}
                  {automation.labels && automation.labels.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-500">Labels:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {automation.labels.map((label, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Preview */}
                  <div className="mb-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Actions
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {automation.actions.slice(0, 3).map((action, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-xs"
                        >
                          {getActionTypeIcon(action.type)}
                          <span className="text-gray-700">
                            {getActionTypeLabel(action.type)}
                          </span>
                        </div>
                      ))}
                      {automation.actions.length > 3 && (
                        <div className="flex items-center px-3 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">
                          +{automation.actions.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="pt-4 border-t border-gray-100">
                    <Badge
                      variant={
                        automation.status === "active" ? "default" : "secondary"
                      }
                      className={`rounded-full ${
                        automation.status === "active"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {automation.status === "active" ? "Active" : "Paused"}
                    </Badge>
                  </div>

                  {/* AI Follow-up Template Configuration - Only show if selected and has AI follow-up */}
                  {isSelectable && selectedIds.includes(automation.id) && hasAIFollowupAction(automation) && (
                    <div className="mt-4 pt-4 border-t border-blue-200" onClick={(e) => e.stopPropagation()}>
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="h-5 w-5 text-purple-600" />
                          <h4 className="text-sm font-semibold text-purple-900">
                            Configure AI Follow-up Questions
                          </h4>
                        </div>
                        
                        {/* Template Selector */}
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-gray-700">Question Template</Label>
                            <Select
                              value={aiFollowupTemplate.templateId || 'custom'}
                              onValueChange={(value) => {
                                if (value === 'custom') {
                                  setValue("aiFollowupTemplate", {
                                    enabled: true,
                                    templateId: "",
                                    questions: [
                                      { question: "", category: "custom", scoringCriteria: "" },
                                      { question: "", category: "custom", scoringCriteria: "" },
                                      { question: "", category: "custom", scoringCriteria: "" },
                                    ],
                                    emailSubject: "",
                                    responseDeadlineHours: 72,
                                  });
                                } else {
                                  const template = aiTemplates.find(t => t.id === value);
                                  if (template) {
                                    setValue("aiFollowupTemplate", {
                                      enabled: true,
                                      templateId: value,
                                      questions: template.questions.map((q: any) => ({
                                        question: q.text || q.question || "",
                                        category: "custom",
                                        scoringCriteria: q.scoringCriteria || "",
                                      })),
                                      emailSubject: `Follow-up: ${template.name}`,
                                      responseDeadlineHours: 72,
                                    });
                                  }
                                }
                              }}
                            >
                              <SelectTrigger className="bg-white text-xs h-8">
                                <SelectValue placeholder="Select template" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="custom">Custom Questions</SelectItem>
                                {aiTemplates.map((template) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {aiFollowupTemplate.enabled && aiFollowupTemplate.questions.length > 0 && (
                            <div className="text-xs text-purple-700 bg-purple-100/50 p-2 rounded">
                              ✓ {aiFollowupTemplate.questions.length} questions configured
                            </div>
                          )}

                          {!aiFollowupTemplate.enabled && (
                            <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded flex items-center gap-2">
                              <AlertCircle className="h-3 w-3" />
                              Please select a template to configure questions
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomAutomationStep;
