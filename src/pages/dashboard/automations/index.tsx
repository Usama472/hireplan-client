import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allTriggers } from "@/constants/automations-constants";
import { AutomationTemplateLibrary } from "@/components/dashboard/automations/AutomationTemplateLibrary";
import API from "@/http";
import {
  AlertCircle,
  AlertTriangle,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileCheck,
  Library,
  Mail,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

interface AutomationsResponse {
  success: boolean;
  results: Automation[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface ConfirmationDialog {
  isOpen: boolean;
  automationId: string;
  automationName: string;
  currentStatus: string;
  action: "pause" | "activate" | "delete";
}

export default function AutomationsDashboard() {
  const navigate = useNavigate();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    automationId: "",
    automationName: "",
    currentStatus: "",
    action: "pause",
  });

  const handleCreateAutomation = useCallback(() => {
    navigate("/dashboard/automations/create");
  }, [navigate]);

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const response: AutomationsResponse =
        await API.automation.getAutomations();
      if (response.success) {
        setAutomations(response.results);
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

  const filteredAutomations = automations.filter((automation) => {
    const matchesSearch = automation.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || automation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleAutomationStatus = async (id: string, currentStatus: string) => {
    const automation = automations.find((a) => a.id === id);
    if (!automation) return;

    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "pause";

    setConfirmDialog({
      isOpen: true,
      automationId: id,
      automationName: automation.name,
      currentStatus,
      action: action as "pause" | "activate",
    });
  };

  const handleCancelStatusChange = () => {
    setConfirmDialog({
      isOpen: false,
      automationId: "",
      automationName: "",
      currentStatus: "",
      action: "pause",
    });
  };

  const handleDeleteAutomation = (id: string) => {
    const automation = automations.find((a) => a.id === id);
    if (!automation) return;

    setConfirmDialog({
      isOpen: true,
      automationId: id,
      automationName: automation.name,
      currentStatus: automation.status,
      action: "delete",
    });
  };

  const handleConfirmAction = async () => {
    const { automationId, currentStatus, action } = confirmDialog;

    if (action === "delete") {
      try {
        await API.automation.deleteAutomation(automationId);
        setAutomations((prev) =>
          prev.filter((automation) => automation.id !== automationId)
        );
        setConfirmDialog({
          isOpen: false,
          automationId: "",
          automationName: "",
          currentStatus: "",
          action: "pause",
        });
      } catch (error) {
        console.error("Error deleting automation:", error);
        alert("Failed to delete automation. Please try again.");
      }
    } else {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      try {
        await API.automation.updateAutomation(automationId, {
          status: newStatus,
        });
        setAutomations((prev) =>
          prev.map((automation) =>
            automation.id === automationId
              ? { ...automation, status: newStatus as "active" | "inactive" }
              : automation
          )
        );
        setConfirmDialog({
          isOpen: false,
          automationId: "",
          automationName: "",
          currentStatus: "",
          action: "pause",
        });
      } catch (error) {
        console.error("Error updating automation status:", error);
        alert("Failed to update automation status. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="space-y-4 sm:space-y-6">
          {/* Mobile-Optimized Loading Header */}
          <div className="bg-white border-b px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="p-2 sm:p-3 bg-blue-50 rounded-xl flex-shrink-0">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">
                    Automations
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 truncate">
                    Loading automations...
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-Optimized Loading Cards */}
          <div className="px-3 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border rounded-xl p-4 sm:p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <div className="space-y-4 sm:space-y-6">
        {/* Mobile-First Responsive Header */}
        <div className="bg-white border-b px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Tabs defaultValue="automations" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="p-2 sm:p-3 bg-blue-50 rounded-xl flex-shrink-0">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    Automation Center
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 truncate">
                    Streamline your recruitment workflow
                  </p>
                </div>
              </div>
            </div>

            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="automations" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                My Automations
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <Library className="h-4 w-4" />
                Template Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="automations">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-blue-600 font-medium">
                    {automations.length} automations
                  </span>
                  <Button onClick={handleCreateAutomation} variant="secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Create Automation</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                </div>

        {/* Mobile-First Filters Section */}
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            {/* Mobile Layout */}
            <div className="block lg:hidden space-y-4">
              {/* Search Bar - Mobile */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search automations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Status Filters - Mobile */}
              <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
                {["all", "active", "inactive"].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setStatusFilter(status as "all" | "active" | "inactive")
                    }
                    className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                      statusFilter === status
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Stats - Mobile */}
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    {automations.filter((a) => a.status === "active").length}{" "}
                    Active
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600 font-medium">
                    {automations.filter((a) => a.status === "inactive").length}{" "}
                    Paused
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search automations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
                  {["all", "active", "inactive"].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setStatusFilter(status as "all" | "active" | "inactive")
                      }
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        statusFilter === status
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {status === "all"
                        ? "All"
                        : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    {automations.filter((a) => a.status === "active").length}{" "}
                    Active
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600 font-medium">
                    {automations.filter((a) => a.status === "inactive").length}{" "}
                    Paused
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Automations Grid */}
        <div className="px-3 sm:px-6 lg:px-8 pb-6 sm:pb-8">
          {filteredAutomations.length === 0 ? (
            <div className="bg-white rounded-xl p-6 sm:p-12 text-center shadow-sm">
              <div className="flex flex-col items-center max-w-md mx-auto">
                <div className="p-3 sm:p-4 bg-gray-100 rounded-full mb-4">
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm || statusFilter !== "all"
                    ? "No automations found"
                    : "No automations yet"}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 text-center">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Create your first automation to streamline your recruitment process"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button onClick={handleCreateAutomation} variant="secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      Create Your First Automation
                    </span>
                    <span className="sm:hidden">Create Automation</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAutomations.map((automation) => {
                const triggerInfo = getTriggerInfo(automation.triggerType);

                return (
                  <div
                    key={automation.id}
                    className="bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all duration-200 p-4 sm:p-6 flex flex-col shadow-sm hover:shadow-md"
                  >
                    {/* Mobile-First Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 sm:p-3 bg-gray-50 rounded-lg flex-shrink-0">
                        {getTriggerIcon(automation.triggerType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
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
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {triggerInfo?.label || automation.triggerType}
                        </p>
                      </div>
                    </div>

                    {/* Mobile-Optimized Stats */}
                    <div className="flex items-center justify-between mb-4 text-xs sm:text-sm bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Conditions:</span>
                        <span className="font-semibold text-gray-900">
                          {automation.useConditions
                            ? automation.conditions.length
                            : 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Actions:</span>
                        <span className="font-semibold text-gray-900">
                          {automation.actions.length}
                        </span>
                      </div>
                    </div>

                    {/* Mobile-Friendly Actions Preview */}
                    <div className="mb-4 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          Actions
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {automation.actions.slice(0, 2).map((action, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-gray-50 rounded-lg text-xs"
                          >
                            {getActionTypeIcon(action.type)}
                            <span className="text-gray-700 truncate">
                              {getActionTypeLabel(action.type)}
                            </span>
                          </div>
                        ))}
                        {automation.actions.length > 2 && (
                          <div className="flex items-center px-2 sm:px-3 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">
                            +{automation.actions.length - 2}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile-Optimized Status and Actions */}
                    <div className="space-y-3">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <Badge
                          variant={
                            automation.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={`rounded-full text-xs ${
                            automation.status === "active"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
                        >
                          {automation.status === "active" ? "Active" : "Paused"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(automation.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      {/* Mobile Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleAutomationStatus(
                              automation.id,
                              automation.status
                            )
                          }
                          className={`flex-1 rounded-lg text-xs sm:text-sm ${
                            automation.status === "active"
                              ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                              : "text-green-600 border-green-200 hover:bg-green-50"
                          }`}
                        >
                          {automation.status === "active" ? (
                            <>
                              <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">Pause</span>
                              <span className="sm:hidden">Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              <span className="hidden sm:inline">Activate</span>
                              <span className="sm:hidden">Start</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAutomation(automation.id)}
                          className="rounded-lg text-red-600 border-red-200 hover:bg-red-50 px-3"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile-Responsive Confirmation Dialog */}
      <Dialog
        open={confirmDialog.isOpen}
        onOpenChange={handleCancelStatusChange}
      >
        <DialogContent className="sm:max-w-md mx-3 sm:mx-auto w-[calc(100vw-24px)] sm:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-left">
              <div
                className={`p-2 rounded-lg flex-shrink-0 ${
                  confirmDialog.action === "delete"
                    ? "bg-red-100"
                    : confirmDialog.action === "pause"
                    ? "bg-orange-100"
                    : "bg-green-100"
                }`}
              >
                {confirmDialog.action === "delete" ? (
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                ) : confirmDialog.action === "pause" ? (
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                ) : (
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                )}
              </div>
              <span className="text-lg sm:text-xl font-semibold">
                {confirmDialog.action === "delete"
                  ? "Delete Automation"
                  : confirmDialog.action === "pause"
                  ? "Pause Automation"
                  : "Activate Automation"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Are you sure you want to <strong>{confirmDialog.action}</strong>{" "}
              the automation:
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                {confirmDialog.automationName}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {confirmDialog.action === "delete"
                  ? "This action cannot be undone. The automation and all its configurations will be permanently removed."
                  : confirmDialog.action === "pause"
                  ? "This automation will stop running until you activate it again."
                  : "This automation will start running and executing its configured actions."}
              </p>
            </div>
          </div>

          {/* Mobile-First Button Layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={handleCancelStatusChange}
              className="rounded-lg order-2 sm:order-1 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={`rounded-lg order-1 sm:order-2 w-full sm:w-auto ${
                confirmDialog.action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : confirmDialog.action === "pause"
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              {confirmDialog.action === "delete" ? (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Delete Automation</span>
                  <span className="sm:hidden">Delete</span>
                </>
              ) : confirmDialog.action === "pause" ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Pause Automation</span>
                  <span className="sm:hidden">Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Activate Automation</span>
                  <span className="sm:hidden">Activate</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
            </TabsContent>

            <TabsContent value="templates">
              <AutomationTemplateLibrary onTemplateActivated={fetchAutomations} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
