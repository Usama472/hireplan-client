import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { applicantConditions } from "@/constants/automations-constants";
import { useAutomation } from "@/contexts/AutomationContext";
import {
  AlertCircle,
  ArrowRight,
  Brain,
  ClipboardList,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Send,
  Trash2,
  UserCheck,
} from "lucide-react";
import { TagManager } from "../common/tag-manager";
import { useGlobalEmailTemplates } from "../../global-setting/hooks/useGlobalEmailTemplates";
import { useGlobalSMSTemplates } from "../../sms/hooks/useSMSTemplates";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

export default function ContextApplicationCreatedTrigger() {
  const { 
    automationName, 
    setAutomationName,
    automationStatus,
    setAutomationStatus,
    useConditions, 
    setUseConditions,
    conditions,
    setConditions,
    actions,
    setActions,
    labels,
    setLabels,
    isEditMode,
    setFormTouched
  } = useAutomation();

  const { availableTemplates } = useGlobalEmailTemplates();
  const { templates: smsTemplates } = useGlobalSMSTemplates();
  const { subscription } = useAuthSessionContext();

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

  // Available action types (filter AI actions based on company settings)
  const hasAI = subscription?.planId === 'professional' || subscription?.planId === 'enterprise';
  
  const allActionTypes = [
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
      value: "send_sms",
      label: "Send SMS to Applicant",
      icon: <Phone className="h-4 w-4 text-green-500" />,
    },
    {
      value: "send_chat_invite",
      label: "Send Chat Invitation via SMS",
      icon: <Send className="h-4 w-4 text-purple-500" />,
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
      requiresAI: true,
      description: "Questions configured at job level",
    },
  ];
  
  // Filter out AI actions if company doesn't have AI enabled
  const actionTypes = allActionTypes.filter(action => !action.requiresAI || hasAI);

  const addCondition = () => {
    const newCondition = {
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
              value: "",
            };
          }
          return { ...condition, [field]: value };
        }
        return condition;
      })
    );
  };

  const addAction = () => {
    const newAction = {
      id: `action-${Date.now()}`,
      type: "send_email_applicant",
      config: { templateId: "", delay: { value: 0, unit: "minutes" as const } },
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
    setActions(
      actions.map((action) => {
        if (action.id === id) {
          if (field.startsWith("delay.")) {
            const delayField = field.split(".")[1];
            return {
              ...action,
              config: {
                ...action.config,
                delay: {
                  ...action.config.delay,
                  [delayField]: value,
                },
              },
            };
          }
          return {
            ...action,
            config: {
              ...action.config,
              [field]: value,
            },
          };
        }
        return action;
      })
    );
    setFormTouched(true);
  };

  const updateActionType = (id: string, newType: string) => {
    setActions(
      actions.map((action) => {
        if (action.id === id) {
          return {
            ...action,
            type: newType,
            config: {
              delay: action.config.delay,
              ...(newType === "send_email_applicant" || newType === "send_email_recruiter" ? { templateId: "" } : {}),
              ...(newType === "send_sms" || newType === "send_chat_invite" ? { smsTemplateId: "" } : {}),
              ...(newType === "update_job_status" ? { status: "" } : {}),
            },
          };
        }
        return action;
      })
    );
    setFormTouched(true);
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
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Application Created Trigger
            </h2>
            <p className="text-sm text-gray-600">
              Execute actions when a new application is submitted
            </p>
          </div>
        </div>

        {/* Automation Name */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="automation-name" className="text-sm font-medium">
            Automation Name *
          </Label>
          <Input
            id="automation-name"
            value={automationName}
            onChange={(e) => setAutomationName(e.target.value)}
            placeholder="Enter automation name..."
            className="max-w-md"
          />
        </div>

        {/* Status Toggle */}
        <div className="flex items-center space-x-3 mb-6">
          <Switch
            id="automation-status"
            checked={automationStatus}
            onCheckedChange={setAutomationStatus}
          />
          <Label htmlFor="automation-status" className="text-sm font-medium">
            {automationStatus ? "Active" : "Inactive"}
          </Label>
          {isEditMode && (
            <span className="text-xs text-gray-500 ml-2">(Edit Mode)</span>
          )}
        </div>
      </div>

      {/* Conditions Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Conditions</h3>
            <p className="text-sm text-gray-600">
              Define when this automation should trigger (optional)
            </p>
          </div>
          <Switch
            checked={useConditions}
            onCheckedChange={setUseConditions}
          />
        </div>

        {useConditions && (
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <Select
                    value={condition.field}
                    onValueChange={(value) => updateCondition(condition.id, "field", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {applicantConditions.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Select
                    value={condition.operator}
                    onValueChange={(value) => updateCondition(condition.id, "operator", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperators(condition.field).map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Input
                    type={isNumericField(condition.field) ? "number" : "text"}
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, "value", e.target.value)}
                    placeholder="Value"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(condition.id)}
                  disabled={conditions.length === 1}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addCondition}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            <p className="text-sm text-gray-600">
              Define what happens when this automation triggers
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {actions.map((action, index) => (
            <div key={action.id} className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getActionIcon(action.type)}
                  <span className="font-medium">Action {index + 1}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAction(action.id)}
                  disabled={actions.length === 1}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Type */}
              <div>
                <Label className="text-sm font-medium">Action Type</Label>
                <Select
                  value={action.type}
                  onValueChange={(value) => updateActionType(action.id, value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((actionType) => (
                      <SelectItem key={actionType.value} value={actionType.value}>
                        <div className="flex items-center gap-2">
                          {actionType.icon}
                          <span>{actionType.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Selection for Email Actions */}
              {(action.type === "send_email_applicant" || action.type === "send_email_recruiter") && (
                <div>
                  <Label className="text-sm font-medium">Email Template</Label>
                  <Select
                    value={action.config.templateId || ""}
                    onValueChange={(value) => updateAction(action.id, "templateId", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Template Selection for SMS Actions */}
              {(action.type === "send_sms" || action.type === "send_chat_invite") && (
                <div>
                  <Label className="text-sm font-medium">SMS Template</Label>
                  <Select
                    value={action.config.smsTemplateId || ""}
                    onValueChange={(value) => updateAction(action.id, "smsTemplateId", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select SMS template" />
                    </SelectTrigger>
                    <SelectContent>
                      {smsTemplates?.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status Selection for Job Status Updates */}
              {action.type === "update_job_status" && (
                <div>
                  <Label className="text-sm font-medium">New Status</Label>
                  <Select
                    value={action.config.status || ""}
                    onValueChange={(value) => updateAction(action.id, "status", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="interviewed">Interviewed</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Delay Configuration */}
              <div>
                <Label className="text-sm font-medium">Delay</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    min="0"
                    value={action.config.delay?.value || 0}
                    onChange={(e) => updateAction(action.id, "delay.value", parseInt(e.target.value))}
                    className="w-24"
                  />
                  <Select
                    value={action.config.delay?.unit || "minutes"}
                    onValueChange={(value) => updateAction(action.id, "delay.unit", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addAction}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </div>
      </div>

      {/* Labels Section */}
      <div className="bg-white rounded-lg border p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Labels</h3>
          <p className="text-sm text-gray-600">
            Add labels to organize your automations (optional)
          </p>
        </div>
        <TagManager
          tags={labels}
          onChange={setLabels}
        />
      </div>
    </div>
  );
}
