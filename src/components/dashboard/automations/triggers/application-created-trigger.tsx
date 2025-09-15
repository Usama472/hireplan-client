import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applicantConditions } from "@/constants/automations-constants";
import API from "@/http";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  ClipboardList,
  Clock,
  Mail,
  MessageSquare,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGlobalEmailTemplates } from "../../global-setting/hooks/useGlobalEmailTemplates";

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface AIFollowupQuestion {
  question: string;
  category?: string;
  scoringCriteria?: string;
}

interface Action {
  id: string;
  type: string;
  config: {
    templateId?: string;
    status?: string;
    delay: {
      value: number;
      unit: "minutes" | "hours" | "days";
    };
    // AI Follow-up specific config
    aiFollowupQuestions?: AIFollowupQuestion[];
    emailSubject?: string;
    responseDeadlineHours?: number;
    [key: string]: any;
  };
}

export default function ApplicationCreatedTrigger() {
  const [useConditions, setUseConditions] = useState<boolean>(false);
  const { availableTemplates } = useGlobalEmailTemplates();
  const navigate = useNavigate();
  const [conditions, setConditions] = useState<Condition[]>([
    { id: "1", field: "totalScore", operator: "equals", value: "" },
  ]);
  const [automationName, setAutomationName] = useState<string>("");
  const [automationStatus, setAutomationStatus] = useState<boolean>(true);

  const [actions, setActions] = useState<Action[]>([
    {
      id: "1",
      type: "send_email_applicant",
      config: { 
        templateId: "", 
        delay: { value: 0, unit: "minutes" },
        aiFollowupQuestions: [
          { question: "", category: "custom" },
          { question: "", category: "custom" },
          { question: "", category: "custom" }
        ],
        emailSubject: "",
        responseDeadlineHours: 72
      },
    },
  ]);

  const [isValid, setIsValid] = useState<boolean>(true);
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [formTouched, setFormTouched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getOperators = (field: string) => {
    const scoreFields = [
      "totalScore",
      "culturalFitScore",
      "educationScore",
      "experienceScore",
      "skillsMatchScore",
    ];

    if (scoreFields.includes(field)) {
      return [
        { value: "equals", label: "Equals" },
        { value: "not_equals", label: "Not Equals" },
        { value: "greater_than", label: "Greater Than" },
        { value: "less_than", label: "Less Than" },
        { value: "between", label: "Between" },
      ];
    }

    return [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not Equals" },
      { value: "contains", label: "Contains" },
      { value: "not_contains", label: "Does Not Contain" },
    ];
  };

  // Available action types
  const actionTypes = [
    {
      value: "send_email_applicant",
      label: "Send Email to Applicant",
      icon: <Mail className="h-4 w-4 text-blue-500" />,
    },
    {
      value: "send_email_recruiter",
      label: "Send Email to Recruiter",
      icon: <Mail className="h-4 w-4 text-indigo-500" />,
    },
    {
      value: "update_job_status",
      label: "Update Application Status",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      value: "ai_follow_up",
      label: "AI Follow-up Questions",
      icon: <Brain className="h-4 w-4 text-purple-500" />,
    },
  ];

  const addCondition = () => {
    const newCondition: Condition = {
      id: `condition-${Date.now()}`,
      field: "totalScore",
      operator: "equals",
      value: "",
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((condition) => condition.id !== id));
    }
  };

  const updateCondition = (id: string, field: string, value: any) => {
    setConditions(
      conditions.map((condition) => {
        if (condition.id === id) {
          if (field === "field") {
            return {
              ...condition,
              [field]: value,
              operator: "equals",
            };
          }
          return { ...condition, [field]: value };
        }
        return condition;
      })
    );
  };

  const addAction = () => {
    const newAction: Action = {
      id: `action-${Date.now()}`,
      type: "send_email_applicant",
      config: { 
        templateId: "", 
        delay: { value: 0, unit: "minutes" },
        aiFollowupQuestions: [
          { question: "", category: "custom" },
          { question: "", category: "custom" },
          { question: "", category: "custom" }
        ],
        emailSubject: "",
        responseDeadlineHours: 72
      },
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

  // Update the validateForm function to handle both email action types
  const validateForm = () => {
    if (!automationName.trim()) {
      setIsValid(false);
      setValidationMessage("Please enter an automation name");
      return false;
    }

    if (actions.length === 0) {
      setIsValid(false);
      setValidationMessage("At least one action is required");
      return false;
    }

    for (const action of actions) {
      if (
        action.type === "send_email_applicant" ||
        action.type === "send_email_recruiter"
      ) {
        if (!action.config.templateId || action.config.templateId === "") {
          setIsValid(false);
          const recipient =
            action.type === "send_email_applicant" ? "applicant" : "recruiter";
          setValidationMessage(
            `Please select an email template for the ${recipient} email action`
          );
          return false;
        }
      }

      if (action.type === "update_job_status") {
        if (!action.config.status || action.config.status === "") {
          setIsValid(false);
          setValidationMessage(
            "Please select a status for all status update actions"
          );
          return false;
        }
      }

      if (action.type === "ai_follow_up") {
        if (!action.config.aiFollowupQuestions || action.config.aiFollowupQuestions.length < 3) {
          setIsValid(false);
          setValidationMessage(
            "AI follow-up requires at least 3 questions"
          );
          return false;
        }
        
        const hasEmptyQuestions = action.config.aiFollowupQuestions.some(
          (q: AIFollowupQuestion) => !q.question || q.question.trim() === ""
        );
        
        if (hasEmptyQuestions) {
          setIsValid(false);
          setValidationMessage(
            "All AI follow-up questions must be filled out"
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
  }, [actions, formTouched]);

  const handleSave = async () => {
    setFormTouched(true);
    setIsLoading(true);
    if (validateForm()) {
      console.log("Form submitted", {
        name: automationName,
        status: automationStatus ? "active" : "inactive",
        useConditions,
        conditions: useConditions ? conditions : [],
        actions,
        triggerType: "application_created",
      });

      try {
        await API.automation.createAutomation({
          name: automationName,
          status: automationStatus ? "active" : "inactive",
          triggerType: "application_created",
          useConditions: useConditions,
          conditions: useConditions ? conditions : [],
          actions: actions,
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

  const isNumericField = (fieldId: string) => {
    return fieldId.toLowerCase().includes("score");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-6 border-l-4 border-blue-500">
        <div className="flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              New Application Trigger
            </h1>
            <p className="text-gray-600">
              This automation runs when a new candidate applies to a job
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
                  ? "This automation will run when conditions are met"
                  : "This automation is currently disabled"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions Section */}
      <div className="rounded-lg overflow-hidden bg-white border border-gray-100">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-4 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <span className="bg-indigo-100 p-1.5 rounded-md mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-indigo-600"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </span>
            Conditions{" "}
            <span className="text-gray-500 text-sm ml-2">(Optional)</span>
          </h2>
          <div className="flex items-center gap-3">
            <label
              htmlFor="use-conditions"
              className="text-sm font-medium text-gray-700"
            >
              Use conditions
            </label>
            <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
              <input
                type="checkbox"
                id="use-conditions"
                className="opacity-0 absolute w-0 h-0"
                checked={useConditions}
                onChange={(e) => setUseConditions(e.target.checked)}
              />
              <label
                htmlFor="use-conditions"
                className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                  useConditions ? "bg-indigo-500" : ""
                }`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white transform transition-transform duration-200 ease-in-out ${
                    useConditions ? "translate-x-6" : "translate-x-0"
                  }`}
                ></span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white">
          {useConditions ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="text-sm font-medium text-gray-500">Key</div>
                <div className="text-sm font-medium text-gray-500">
                  Condition
                </div>
                <div className="text-sm font-medium text-gray-500">Value</div>
              </div>

              {conditions.map((condition) => (
                <div
                  key={condition.id}
                  className="flex items-start gap-3 bg-indigo-50/50 p-4 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <Select
                      value={condition.field}
                      onValueChange={(value) =>
                        updateCondition(condition.id, "field", value)
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select key" />
                      </SelectTrigger>
                      <SelectContent>
                        {applicantConditions.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={condition.operator}
                      onValueChange={(value) =>
                        updateCondition(condition.id, "operator", value)
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {getOperators(condition.field).map((operator) => (
                          <SelectItem
                            key={operator.value}
                            value={operator.value}
                          >
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Enter value"
                      value={condition.value}
                      onChange={(e) =>
                        updateCondition(condition.id, "value", e.target.value)
                      }
                      type={isNumericField(condition.field) ? "number" : "text"}
                      className="bg-white"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCondition(condition.id)}
                    disabled={conditions.length <= 1}
                    className="mt-1 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="flex items-center gap-1 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Plus className="h-4 w-4" /> Add Condition
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 bg-indigo-50/30 rounded-lg">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No conditions specified</p>
                <p className="text-sm text-gray-400">
                  This automation will run for every new application
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => setUseConditions(true)}
                >
                  Add Conditions
                </Button>
              </div>
            </div>
          )}
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
                ((action.type === "send_email_applicant" &&
                  (!action.config.templateId ||
                    action.config.templateId === "")) ||
                  (action.type === "send_email_recruiter" &&
                    (!action.config.templateId ||
                      action.config.templateId === "")) ||
                  (action.type === "update_job_status" &&
                    (!action.config.status || action.config.status === "")) ||
                  (action.type === "ai_follow_up" &&
                    (!action.config.aiFollowupQuestions ||
                      action.config.aiFollowupQuestions.length < 3 ||
                      action.config.aiFollowupQuestions.some((q: AIFollowupQuestion) => !q.question || q.question.trim() === ""))))
                  ? "border-red-200 bg-red-50/10"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div
                className={`p-3 flex items-center justify-between border-b ${
                  action.type === "send_email_applicant" ||
                  action.type === "send_email_recruiter"
                    ? "bg-blue-50/50"
                    : action.type === "ai_follow_up"
                    ? "bg-purple-50/50"
                    : "bg-emerald-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      action.type === "send_email_applicant" ||
                      action.type === "send_email_recruiter"
                        ? "bg-blue-100"
                        : action.type === "ai_follow_up"
                        ? "bg-purple-100"
                        : "bg-emerald-100"
                    }`}
                  >
                    {getActionIcon(action.type)}
                  </div>
                  <span className="font-medium text-gray-700 flex items-center">
                    Action {i + 1}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {action.type === "send_email_applicant"
                        ? "Email to Applicant"
                        : action.type === "send_email_recruiter"
                        ? "Email to Recruiter"
                        : action.type === "ai_follow_up"
                        ? "AI Follow-up"
                        : "Status Update"}
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

                  {action.type === "send_email_applicant" && (
                    <div
                      className={`bg-blue-50/30 p-4 rounded-lg ${
                        formTouched &&
                        (!action.config.templateId ||
                          action.config.templateId === "")
                          ? "border border-red-300"
                          : "border border-blue-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <h3 className="text-sm font-medium text-gray-700">
                          Email to Applicant
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
                            <SelectValue placeholder="Select applicant email template" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTemplates
                              .filter(
                                (template) =>
                                  template.name
                                    ?.toLowerCase()
                                    .includes("applicant") ||
                                  !template.name
                                    ?.toLowerCase()
                                    .includes("recruiter")
                              )
                              .map((template) => (
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
                          This email will be sent to the job applicant
                        </p>
                      </div>
                    </div>
                  )}

                  {action.type === "send_email_recruiter" && (
                    <div
                      className={`bg-indigo-50/30 p-4 rounded-lg ${
                        formTouched &&
                        (!action.config.templateId ||
                          action.config.templateId === "")
                          ? "border border-red-300"
                          : "border border-indigo-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Mail className="h-4 w-4 text-indigo-500" />
                        <h3 className="text-sm font-medium text-gray-700">
                          Email to Recruiter
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
                            <SelectValue placeholder="Select recruiter email template" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTemplates
                              .filter(
                                (template) =>
                                  template.name
                                    ?.toLowerCase()
                                    .includes("recruiter") ||
                                  !template.name
                                    ?.toLowerCase()
                                    .includes("applicant")
                              )
                              .map((template) => (
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
                          This email will be sent to the assigned recruiter
                        </p>
                      </div>
                    </div>
                  )}

                  {action.type === "update_job_status" && (
                    <div
                      className={`bg-emerald-50/30 p-4 rounded-lg ${
                        formTouched &&
                        (!action.config.status || action.config.status === "")
                          ? "border border-red-300"
                          : "border border-emerald-100"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardList className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-sm font-medium text-gray-700">
                          Status Configuration
                        </h3>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          New Status <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={action.config.status || ""}
                          onValueChange={(value) =>
                            updateAction(action.id, "config.status", value)
                          }
                        >
                          <SelectTrigger
                            className={`bg-white ${
                              formTouched &&
                              (!action.config.status ||
                                action.config.status === "")
                                ? "border-red-300"
                                : ""
                            }`}
                          >
                            <SelectValue placeholder="Select new status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="shortlisted">
                              Shortlisted
                            </SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {action.type === "ai_follow_up" && (
                    <div className="bg-purple-50/30 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <h3 className="text-sm font-medium text-gray-700">
                          AI Follow-up Configuration
                        </h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Email Subject
                          </label>
                          <Input
                            placeholder="Follow-up questions for {{job_title}} position"
                            value={action.config.emailSubject || ""}
                            onChange={(e) =>
                              updateAction(action.id, "config.emailSubject", e.target.value)
                            }
                            className="bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Response Deadline (hours)
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="168"
                            placeholder="72"
                            value={action.config.responseDeadlineHours || 72}
                            onChange={(e) =>
                              updateAction(action.id, "config.responseDeadlineHours", parseInt(e.target.value))
                            }
                            className="bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Follow-up Questions <span className="text-red-500">*</span>
                            <span className="text-xs text-gray-500 ml-1">(3-5 questions)</span>
                          </label>
                          <div className="space-y-3">
                            {(action.config.aiFollowupQuestions || []).map((question: AIFollowupQuestion, qIndex: number) => (
                              <div key={qIndex} className="p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare className="h-4 w-4 text-purple-400" />
                                  <span className="text-xs font-medium text-gray-600">
                                    Question {qIndex + 1}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newQuestions = [...(action.config.aiFollowupQuestions || [])];
                                      newQuestions.splice(qIndex, 1);
                                      updateAction(action.id, "config.aiFollowupQuestions", newQuestions);
                                    }}
                                    disabled={(action.config.aiFollowupQuestions?.length || 0) <= 3}
                                    className={`ml-auto h-6 w-6 p-0 ${
                                      (action.config.aiFollowupQuestions?.length || 0) <= 3
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-red-500 hover:text-red-700 hover:bg-red-50"
                                    }`}
                                    title={(action.config.aiFollowupQuestions?.length || 0) <= 3 
                                      ? "Minimum 3 questions required" 
                                      : "Delete question"}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  <Input
                                    placeholder="Enter your question here..."
                                    value={question.question}
                                    onChange={(e) => {
                                      const newQuestions = [...(action.config.aiFollowupQuestions || [])];
                                      newQuestions[qIndex] = { ...question, question: e.target.value };
                                      updateAction(action.id, "config.aiFollowupQuestions", newQuestions);
                                    }}
                                    className={`text-sm ${
                                      formTouched && (!question.question || question.question.trim() === "")
                                        ? "border-red-300"
                                        : ""
                                    }`}
                                  />
                                  
                                  <div>
                                    <Select
                                      value={question.category || "custom"}
                                      onValueChange={(value) => {
                                        const newQuestions = [...(action.config.aiFollowupQuestions || [])];
                                        newQuestions[qIndex] = { ...question, category: value };
                                        updateAction(action.id, "config.aiFollowupQuestions", newQuestions);
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="technical">Technical</SelectItem>
                                        <SelectItem value="experience">Experience</SelectItem>
                                        <SelectItem value="cultural">Cultural</SelectItem>
                                        <SelectItem value="behavioral">Behavioral</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <Input
                                    placeholder="Scoring criteria (what makes a good answer?)"
                                    value={question.scoringCriteria || ""}
                                    onChange={(e) => {
                                      const newQuestions = [...(action.config.aiFollowupQuestions || [])];
                                      newQuestions[qIndex] = { ...question, scoringCriteria: e.target.value };
                                      updateAction(action.id, "config.aiFollowupQuestions", newQuestions);
                                    }}
                                    className="text-xs"
                                  />
                                </div>
                              </div>
                            ))}
                            
                            {(action.config.aiFollowupQuestions?.length || 0) < 5 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newQuestions = [...(action.config.aiFollowupQuestions || [])];
                                  newQuestions.push({ question: "", category: "custom" });
                                  updateAction(action.id, "config.aiFollowupQuestions", newQuestions);
                                }}
                                className="w-full border-dashed border-purple-200 text-purple-600 hover:bg-purple-50"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Question
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delay settings for all action types */}
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
                          after trigger
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
            className={`bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-2 ${
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
