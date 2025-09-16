import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import API from "@/http";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Clock,
  Mail,
  PieChart,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGlobalEmailTemplates } from "../../global-setting/hooks/useGlobalEmailTemplates";

interface ScheduleConfig {
  frequency: "daily" | "weekly" | "monthly" | "";
  time: string;
  dayOfWeek?: string;
  dayOfMonth?: string;
}

interface Action {
  id: string;
  type: string;
  config: {
    templateId?: string;
    daysOld?: number;
    delay: {
      value: number;
      unit: "minutes" | "hours" | "days";
    };
    [key: string]: any;
  };
}

export default function ScheduledTimeTrigger() {
  const { availableTemplates } = useGlobalEmailTemplates();
  const navigate = useNavigate();
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    frequency: "",
    time: "",
    dayOfWeek: "",
    dayOfMonth: "",
  });
  const [automationName, setAutomationName] = useState<string>("");
  const [automationStatus, setAutomationStatus] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actions, setActions] = useState<Action[]>([
    {
      id: "1",
      type: "send_pipeline_summary",
      config: { delay: { value: 0, unit: "minutes" } },
    },
  ]);

  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [formTouched, setFormTouched] = useState<boolean>(false);

  // Available frequencies
  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  // Days of the week
  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" },
  ];

  // Days of the month
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: `${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}`,
  }));

  // Available action types for scheduled time
  const actionTypes = [
    {
      value: "send_pipeline_summary",
      label: "Send Pipeline Summary to Recruiter",
      icon: <PieChart className="h-4 w-4 text-blue-500" />,
    },
    {
      value: "auto_expire_jobs",
      label: "Auto-Expire Old Jobs",
      icon: <XCircle className="h-4 w-4 text-red-500" />,
    },
    {
      value: "send_email_reminders",
      label: "Send Email Reminders to Candidates",
      icon: <Mail className="h-4 w-4 text-green-500" />,
    },
  ];

  const updateScheduleConfig = (field: keyof ScheduleConfig, value: any) => {
    setScheduleConfig((prev) => ({
      ...prev,
      [field]: value,
      // Reset dependent fields when frequency changes
      ...(field === "frequency" && {
        dayOfWeek: "",
        dayOfMonth: "",
      }),
    }));
  };

  const addAction = () => {
    const newAction: Action = {
      id: `action-${Date.now()}`,
      type: "send_pipeline_summary",
      config: { delay: { value: 0, unit: "minutes" } },
    };
    setActions([...actions, newAction]);
    setFormTouched(true);
  };

  const removeAction = (id: string) => {
    if (actions.length > 1) {
      setActions(actions.filter((action) => action.id !== id));
      setFormTouched(true);
    }
  };

  const updateAction = (id: string, field: string, value: any) => {
    setFormTouched(true);
    setActions(
      actions.map((action) => {
        if (action.id === id) {
          if (field === "type") {
            return {
              ...action,
              type: value,
              config: { delay: { value: 0, unit: "minutes" } },
            };
          }
          if (field.startsWith("config.")) {
            const configField = field.split(".")[1];
            return {
              ...action,
              config: {
                ...action.config,
                [configField]: value,
              },
            };
          }
          return { ...action, [field]: value };
        }
        return action;
      })
    );
  };

  const updateDelay = (id: string, field: "value" | "unit", value: any) => {
    setFormTouched(true);
    setActions(
      actions.map((action) => {
        if (action.id === id) {
          const updatedAction: Action = {
            ...action,
            config: {
              ...action.config,
              delay: {
                ...action.config.delay,
                ...(field === "value"
                  ? { value: Number(value) }
                  : { unit: value as "minutes" | "hours" | "days" }),
              },
            },
          };
          return updatedAction;
        }
        return action;
      })
    );
  };

  const validateForm = () => {
    if (!automationName.trim()) {
      setIsValid(false);
      setValidationMessage("Please enter an automation name");
      return false;
    }

    if (!scheduleConfig.frequency) {
      setIsValid(false);
      setValidationMessage("Please select a frequency");
      return false;
    }

    if (!scheduleConfig.time) {
      setIsValid(false);
      setValidationMessage("Please select a time");
      return false;
    }

    if (scheduleConfig.frequency === "weekly" && !scheduleConfig.dayOfWeek) {
      setIsValid(false);
      setValidationMessage("Please select a day of the week");
      return false;
    }

    if (scheduleConfig.frequency === "monthly" && !scheduleConfig.dayOfMonth) {
      setIsValid(false);
      setValidationMessage("Please select a day of the month");
      return false;
    }

    if (actions.length === 0) {
      setIsValid(false);
      setValidationMessage("At least one action is required");
      return false;
    }

    for (const action of actions) {
      if (action.type === "send_email_reminders") {
        if (!action.config.templateId || action.config.templateId === "") {
          setIsValid(false);
          setValidationMessage(
            "Please select an email template for email reminder actions"
          );
          return false;
        }
      }

      if (action.type === "auto_expire_jobs") {
        if (!action.config.daysOld || action.config.daysOld <= 0) {
          setIsValid(false);
          setValidationMessage(
            "Please specify how many days old jobs should be to auto-expire"
          );
          return false;
        }
      }
    }

    setIsValid(true);
    setValidationMessage("");
    return true;
  };

  useEffect(() => {
    if (formTouched) {
      validateForm();
    }
  }, [actions, scheduleConfig, formTouched]);

  const handleSave = async () => {
    setFormTouched(true);
    setIsLoading(true);
    if (validateForm()) {
      console.log("Form submitted", {
        name: automationName,
        status: automationStatus ? "active" : "inactive",
        schedule: scheduleConfig,
        actions,
        triggerType: "cron",
      });
      try {
        await API.automation.createAutomation({
          name: automationName,
          status: automationStatus ? "active" : "inactive",
          triggerType: "cron",
          useConditions: true,
          conditions: [],
          actions: actions,
          schedule: scheduleConfig,
        });
        navigate("/dashboard/automations");
      } catch (error: any) {
        toast.error("Failed to create automation", {
          description: error.message,
        });
      }
    }
    setIsLoading(false);
  };

  const getActionIcon = (type: string) => {
    const actionType = actionTypes.find((a) => a.value === type);
    return actionType?.icon || <ArrowRight className="h-4 w-4" />;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-purple-50 to-transparent rounded-lg p-6 border-l-4 border-purple-500">
        <div className="flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Scheduled Time Trigger
            </h1>
            <p className="text-gray-600">
              This automation runs on a recurring schedule (daily, weekly,
              monthly)
            </p>
          </div>
        </div>
      </div>

      {/* Automation Details */}
      <div className="rounded-lg overflow-hidden bg-white border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <span className="bg-purple-100 p-1.5 rounded-md mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-purple-600"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </span>
            Automation Details
          </h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Automation Name */}
            <div className="flex-1">
              <label
                htmlFor="automation-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Automation Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-gray-400"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </div>
                <Input
                  id="automation-name"
                  placeholder="Enter a descriptive name for this automation"
                  value={automationName}
                  onChange={(e) => setAutomationName(e.target.value)}
                  className={`pl-10 w-full ${
                    formTouched && !automationName.trim()
                      ? "border-red-300"
                      : ""
                  }`}
                />
              </div>
              {formTouched && !automationName.trim() && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" /> Automation name is
                  required
                </p>
              )}
            </div>

            {/* Automation Status */}
            <div className="md:w-48 md:border-l md:pl-6 md:ml-2">
              <label
                htmlFor="automation-status"
                className="block text-sm font-medium text-gray-700 mb-3"
              >
                Automation Status
              </label>
              <div className="flex items-center gap-3">
                <div className="relative inline-block w-14 h-7">
                  <input
                    type="checkbox"
                    id="automation-status"
                    className="opacity-0 absolute w-0 h-0"
                    checked={automationStatus}
                    onChange={(e) => setAutomationStatus(e.target.checked)}
                  />
                  <label
                    htmlFor="automation-status"
                    className={`flex items-center justify-between px-1 overflow-hidden h-7 w-14 rounded-full cursor-pointer ${
                      automationStatus ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium transition-opacity duration-200 ${
                        automationStatus
                          ? "opacity-0"
                          : "opacity-100 text-gray-600 pl-5"
                      }`}
                    >
                      OFF
                    </span>
                    <span
                      className={`block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
                        automationStatus ? "translate-x-7" : "translate-x-0"
                      }`}
                    ></span>
                    <span
                      className={`text-xs font-medium transition-opacity duration-200 ${
                        automationStatus
                          ? "opacity-100 text-white pr-5"
                          : "opacity-0"
                      }`}
                    >
                      ON
                    </span>
                  </label>
                </div>
                <span
                  className={`text-sm font-medium ${
                    automationStatus ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {automationStatus ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {automationStatus
                  ? "This automation will run on schedule"
                  : "This automation is currently disabled"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Configuration */}
      <div className="rounded-lg overflow-hidden bg-white border border-gray-100">
        <div className="bg-gradient-to-r from-purple-50 to-white p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <span className="bg-purple-100 p-1.5 rounded-md mr-2">
              <Clock className="h-4 w-4 text-purple-600" />
            </span>
            Schedule Configuration{" "}
            <span className="text-red-500 text-sm ml-2">(Required)</span>
          </h2>
        </div>

        <div className="p-5 bg-white">
          <div className="space-y-6">
            {/* Frequency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency <span className="text-red-500">*</span>
              </label>
              <Select
                value={scheduleConfig.frequency}
                onValueChange={(value) =>
                  updateScheduleConfig("frequency", value)
                }
              >
                <SelectTrigger
                  className={`bg-white ${
                    formTouched && !scheduleConfig.frequency
                      ? "border-red-300"
                      : ""
                  }`}
                >
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="time"
                value={scheduleConfig.time}
                onChange={(e) => updateScheduleConfig("time", e.target.value)}
                className={`bg-white max-w-xs ${
                  formTouched && !scheduleConfig.time ? "border-red-300" : ""
                }`}
              />
            </div>

            {/* Day of Week Selection (for weekly) */}
            {scheduleConfig.frequency === "weekly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week <span className="text-red-500">*</span>
                </label>
                <Select
                  value={scheduleConfig.dayOfWeek || ""}
                  onValueChange={(value) =>
                    updateScheduleConfig("dayOfWeek", value)
                  }
                >
                  <SelectTrigger
                    className={`bg-white max-w-xs ${
                      formTouched && !scheduleConfig.dayOfWeek
                        ? "border-red-300"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Select day of week" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Day of Month Selection (for monthly) */}
            {scheduleConfig.frequency === "monthly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Month <span className="text-red-500">*</span>
                </label>
                <Select
                  value={scheduleConfig.dayOfMonth || ""}
                  onValueChange={(value) =>
                    updateScheduleConfig("dayOfMonth", value)
                  }
                >
                  <SelectTrigger
                    className={`bg-white max-w-xs ${
                      formTouched && !scheduleConfig.dayOfMonth
                        ? "border-red-300"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Select day of month" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfMonth.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Schedule Preview */}
            {scheduleConfig.frequency && scheduleConfig.time && (
              <div className="bg-purple-50/30 p-4 rounded-lg border border-purple-100">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 text-purple-500 mr-1" />
                  Schedule Preview
                </h3>
                <p className="text-sm text-gray-600">
                  This automation will run{" "}
                  <span className="font-medium">
                    {scheduleConfig.frequency === "daily" &&
                      `daily at ${scheduleConfig.time}`}
                    {scheduleConfig.frequency === "weekly" &&
                      scheduleConfig.dayOfWeek &&
                      `every ${scheduleConfig.dayOfWeek} at ${scheduleConfig.time}`}
                    {scheduleConfig.frequency === "monthly" &&
                      scheduleConfig.dayOfMonth &&
                      `on the ${scheduleConfig.dayOfMonth} of each month at ${scheduleConfig.time}`}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="rounded-lg overflow-hidden bg-white border border-gray-100">
        <div className="bg-gradient-to-r from-emerald-50 to-white p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <span className="bg-emerald-100 p-1.5 rounded-md mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-emerald-600"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </span>
            Actions
          </h2>
        </div>

        <div className="p-5 space-y-6">
          {actions.map((action, i) => (
            <div
              key={action.id}
              className={`rounded-lg overflow-hidden border ${
                formTouched &&
                ((action.type === "send_email_reminders" &&
                  (!action.config.templateId ||
                    action.config.templateId === "")) ||
                  (action.type === "auto_expire_jobs" &&
                    (!action.config.daysOld || action.config.daysOld <= 0)))
                  ? "border-red-200 bg-red-50/10"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`p-3 flex items-center justify-between border-b ${
                  action.type === "send_pipeline_summary"
                    ? "bg-blue-50/50"
                    : action.type === "auto_expire_jobs"
                    ? "bg-red-50/50"
                    : action.type === "send_email_reminders"
                    ? "bg-green-50/50"
                    : "bg-gray-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      action.type === "send_pipeline_summary"
                        ? "bg-blue-100"
                        : action.type === "auto_expire_jobs"
                        ? "bg-red-100"
                        : action.type === "send_email_reminders"
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {getActionIcon(action.type)}
                  </div>
                  <span className="font-medium text-gray-700 flex items-center">
                    Action {i + 1}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {action.type === "send_pipeline_summary"
                        ? "Pipeline Summary"
                        : action.type === "auto_expire_jobs"
                        ? "Auto Expire"
                        : action.type === "send_email_reminders"
                        ? "Email Reminders"
                        : "Action"}
                    </span>
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAction(action.id)}
                  disabled={actions.length <= 1}
                  className="hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Action Type
                    </label>
                    <Select
                      value={action.type}
                      onValueChange={(value) =>
                        updateAction(action.id, "type", value)
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select action type" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {action.type === "send_pipeline_summary" && (
                    <div className="bg-blue-50/30 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-3">
                        <PieChart className="h-4 w-4 text-blue-500" />
                        <h3 className="text-sm font-medium text-gray-700">
                          Pipeline Summary Configuration
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        A comprehensive pipeline summary will be automatically
                        generated and sent to recruiters, including application
                        statistics, top candidates, and performance metrics.
                      </p>
                    </div>
                  )}

                  {action.type === "auto_expire_jobs" && (
                    <div
                      className={`bg-red-50/30 p-4 rounded-lg ${
                        formTouched &&
                        (!action.config.daysOld || action.config.daysOld <= 0)
                          ? "border border-red-300"
                          : "border border-red-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <h3 className="text-sm font-medium text-gray-700">
                          Auto-Expire Configuration
                        </h3>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Expire jobs older than{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            placeholder="30"
                            value={action.config.daysOld || ""}
                            onChange={(e) =>
                              updateAction(
                                action.id,
                                "config.daysOld",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className={`w-24 bg-white ${
                              formTouched &&
                              (!action.config.daysOld ||
                                action.config.daysOld <= 0)
                                ? "border-red-300"
                                : ""
                            }`}
                          />
                          <span className="text-sm text-gray-500">days</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Jobs that have been active for more than this number
                          of days will be automatically expired
                        </p>
                      </div>
                    </div>
                  )}

                  {action.type === "send_email_reminders" && (
                    <div
                      className={`bg-green-50/30 p-4 rounded-lg ${
                        formTouched &&
                        (!action.config.templateId ||
                          action.config.templateId === "")
                          ? "border border-red-300"
                          : "border border-green-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="h-4 w-4 text-green-500" />
                        <h3 className="text-sm font-medium text-gray-700">
                          Email Reminder Configuration
                        </h3>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Email Template <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={action.config.templateId || ""}
                          onValueChange={(value) =>
                            updateAction(action.id, "config.templateId", value)
                          }
                        >
                          <SelectTrigger
                            className={`bg-white ${
                              formTouched &&
                              (!action.config.templateId ||
                                action.config.templateId === "")
                                ? "border-red-300"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Select reminder email template" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTemplates.map((template) => (
                              <SelectItem
                                key={template.id}
                                value={template.id || ""}
                              >
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                          This reminder email will be sent to candidates who
                          haven't completed their applications
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-2 pt-4 border-t border-dashed">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <label
                        htmlFor={`delay-${action.id}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Add delay before this action
                      </label>
                      <div className="relative inline-block w-10 h-5 ml-auto transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id={`delay-${action.id}`}
                          className="opacity-0 absolute w-0 h-0"
                          checked={
                            action.config.delay && action.config.delay.value > 0
                          }
                          onChange={(e) =>
                            updateDelay(
                              action.id,
                              "value",
                              e.target.checked ? 1 : 0
                            )
                          }
                        />
                        <label
                          htmlFor={`delay-${action.id}`}
                          className={`block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer ${
                            action.config.delay && action.config.delay.value > 0
                              ? "bg-emerald-500"
                              : ""
                          }`}
                        >
                          <span
                            className={`block h-5 w-5 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                              action.config.delay &&
                              action.config.delay.value > 0
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>

                    {action.config.delay && action.config.delay.value > 0 && (
                      <div className="flex gap-3 items-center pl-6 mt-3 animate-in fade-in slide-in-from-top duration-300">
                        <Input
                          type="number"
                          min="1"
                          value={action.config.delay.value}
                          onChange={(e) =>
                            updateDelay(
                              action.id,
                              "value",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-24 bg-white"
                        />
                        <Select
                          value={action.config.delay.unit}
                          onValueChange={(value) =>
                            updateDelay(
                              action.id,
                              "unit",
                              value as "minutes" | "hours" | "days"
                            )
                          }
                        >
                          <SelectTrigger className="w-32 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-500">
                          after scheduled time
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={addAction}
              className="flex items-center gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Plus className="h-4 w-4" /> Add Another Action
            </Button>
          </div>
        </div>
      </div>

      {!isValid && (
        <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-lg border border-red-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{validationMessage}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end mt-8 pt-4 border-t">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              navigate("/dashboard/automations");
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className={`bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-2 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Saving..." : "Save Automation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
