import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { addDays, addHours, addMinutes, format } from "date-fns";
import {
  ArrowRightCircle,
  Brain,
  Briefcase,
  Calendar,
  Check,
  Clock,
  FileCheck,
  ListChecks,
  Mail,
  MessageSquare,
  UserCheck,
  Webhook,
} from "lucide-react";

interface SummarySectionProps {
  form: any; // Using any temporarily to avoid TypeScript errors with form types
}

export default function SummarySection({ form }: SummarySectionProps) {
  const automation = form.watch();
  const triggerType = automation.trigger?.type;
  const actions = automation.actions || [];
  const automationType = automation.automationType;

  const getTriggerSummary = () => {
    const config = automation.trigger?.config || {};

    switch (triggerType) {
      case "application_created":
        return "When a new application is created";
      case "application_status_changed": {
        const { from, to } = config;
        if (from && to) {
          return `When application status changes from ${from} to ${to}`;
        } else if (to) {
          return `When application status changes to ${to}`;
        } else {
          return "When application status changes";
        }
      }
      case "resume_score_updated":
        return "When a candidate's resume score is updated";
      case "job_created":
        return "When a new job posting is created";
      case "job_published":
        return "When a job is published";
      case "job_expired":
        return "When a job posting expires";
      case "cron": {
        const expression = config.expression;
        return expression
          ? `On schedule: ${expression}`
          : "On a scheduled basis";
      }
      default:
        return "When triggered";
    }
  };

  const getActionSummary = (action: any) => {
    const config = action.config || {};

    switch (action.type) {
      case "send_email": {
        const { templateId, delay } = config;
        const delayText = delay
          ? `after ${delay.value} ${delay.unit}`
          : "immediately";
        return `Send email template "${
          templateId || "(Not selected)"
        }" ${delayText}`;
      }
      case "webhook": {
        const { url, method } = config;
        return `Send ${method || "POST"} webhook to ${url || "(URL not set)"}`;
      }
      case "slack": {
        const { channel } = config;
        return `Send notification to Slack channel #${channel || "general"}`;
      }
      case "update_job_status": {
        const { status } = config;
        return `Update job status to "${status || "active"}"`;
      }
      case "assign_recruiter": {
        const { recruiterId, notify } = config;
        return `Assign to recruiter ${recruiterId || "(Not specified)"} ${
          notify ? "with notification" : "without notification"
        }`;
      }
      case "ai_follow_up": {
        const { followUpType, autoSend, delay } = config;
        const typeLabel =
          followUpType === "candidate_interview"
            ? "post-interview"
            : followUpType === "application_status"
            ? "status check"
            : followUpType === "job_interest"
            ? "job interest"
            : followUpType === "feedback_request"
            ? "feedback"
            : "custom";
        const sendMode = autoSend ? "automatically" : "as draft";
        const delayText = delay
          ? `after ${delay.value} ${delay.unit}`
          : "immediately";
        return `Send AI ${typeLabel} follow-up ${sendMode} ${delayText}`;
      }
      case "custom":
        return "Execute custom action";
      default:
        return "Unknown action";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "send_email":
        return <Mail className="h-5 w-5 text-blue-600" />;
      case "webhook":
        return <Webhook className="h-5 w-5 text-purple-600" />;
      case "slack":
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case "update_job_status":
        return <Briefcase className="h-5 w-5 text-orange-600" />;
      case "assign_recruiter":
        return <UserCheck className="h-5 w-5 text-indigo-600" />;
      case "ai_follow_up":
        return <Brain className="h-5 w-5 text-purple-600" />;
      default:
        return <ArrowRightCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTriggerIcon = () => {
    switch (triggerType) {
      case "cron":
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case "application_created":
      case "application_status_changed":
      case "resume_score_updated":
        return <FileCheck className="h-5 w-5 text-blue-500" />;
      case "job_created":
      case "job_published":
      case "job_expired":
        return <Briefcase className="h-5 w-5 text-green-500" />;
      default:
        return <ArrowRightCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAutomationTypeDetails = () => {
    switch (automationType) {
      case "email":
        return {
          name: "Email Automation",
          description: "Automates email communications with candidates",
          icon: <Mail className="h-5 w-5 text-blue-700" />,
          color: "bg-blue-100",
          textColor: "text-blue-700",
        };
      case "job":
        return {
          name: "Job Automation",
          description: "Automates job-related processes and notifications",
          icon: <Briefcase className="h-5 w-5 text-emerald-700" />,
          color: "bg-emerald-100",
          textColor: "text-emerald-700",
        };
      case "schedule":
        return {
          name: "Schedule Automation",
          description: "Creates time-based triggers and schedules",
          icon: <Calendar className="h-5 w-5 text-purple-700" />,
          color: "bg-purple-100",
          textColor: "text-purple-700",
        };
      default:
        return {
          name: "Custom Automation",
          description: "Custom automation workflow",
          icon: <ListChecks className="h-5 w-5 text-gray-700" />,
          color: "bg-gray-100",
          textColor: "text-gray-700",
        };
    }
  };

  const getNextRunPreview = () => {
    // Check if we have email action with delay
    const emailAction = actions.find(
      (a: any) => a.type === "send_email" && a.config?.delay
    );

    if (!emailAction) return null;

    const delay = emailAction.config.delay;
    const now = new Date();
    let nextRun;

    switch (delay.unit) {
      case "minutes":
        nextRun = addMinutes(now, delay.value);
        break;
      case "hours":
        nextRun = addHours(now, delay.value);
        break;
      case "days":
      default:
        nextRun = addDays(now, delay.value);
    }

    const timezone = emailAction.config.timezone || "UTC";
    return {
      time: format(nextRun, "PPpp"),
      timezone,
    };
  };

  const nextRun = getNextRunPreview();
  const automationTypeDetails = getAutomationTypeDetails();
  const hasConditions =
    automation.conditions && automation.conditions.length > 0;

  return (
    <div className="space-y-6">
      <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white space-y-6">
        {/* Automation Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn("p-2 rounded-full", automationTypeDetails.color)}
            >
              {automationTypeDetails.icon}
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {automation.name || "Unnamed Automation"}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className={cn("shadow-none", automationTypeDetails.textColor)}
                >
                  {automationTypeDetails.name}
                </Badge>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">
                  {automation.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>

          {automation.enabled && (
            <div className="bg-green-100 text-green-800 rounded-full flex items-center px-3 py-1">
              <Check className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Active</span>
            </div>
          )}
        </div>

        {automation.description && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-3 border border-gray-200">
            {automation.description}
          </div>
        )}

        <Separator />

        {/* Workflow visualization */}
        <div>
          <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-4">
            Workflow
          </h4>

          <div className="relative pl-8">
            {/* Connecting vertical line */}
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

            {/* Trigger step */}
            <div className="mb-6 relative">
              <div className="absolute -left-8 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {getTriggerIcon()}
              </div>
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <h5 className="font-medium text-blue-900 mb-1">Trigger</h5>
                <p className="text-sm text-blue-800">{getTriggerSummary()}</p>
                <Badge
                  variant="outline"
                  className="mt-2 bg-white shadow-none text-blue-600 border-blue-200"
                >
                  {triggerType}
                </Badge>
              </div>
            </div>

            {/* Conditions step */}
            {hasConditions && (
              <div className="mb-6 relative">
                <div className="absolute -left-8 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <ListChecks className="h-5 w-5 text-amber-600" />
                </div>
                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
                  <h5 className="font-medium text-amber-900 mb-2">
                    Conditions
                  </h5>
                  <div className="space-y-2">
                    {automation.conditions.map(
                      (condition: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm bg-white p-2 rounded-md border border-amber-100"
                        >
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            {condition.field}
                          </Badge>
                          <span className="font-medium text-amber-700">
                            {condition.operator}
                          </span>
                          <Badge className="bg-white border-amber-200 text-amber-800">
                            {condition.value}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions steps */}
            {actions.length > 0 && (
              <div className="relative">
                <div className="absolute -left-8 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <h5 className="font-medium text-green-900 mb-2">Actions</h5>
                  <div className="space-y-3">
                    {actions.map((action: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-white rounded-md border border-green-100"
                      >
                        <div className="p-1.5 rounded-full bg-gray-50 shrink-0">
                          {getActionIcon(action.type)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">
                            {getActionSummary(action)}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-1.5 text-xs shadow-none"
                          >
                            {action.type.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {nextRun && (
          <>
            <Separator />

            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-3">
                Next Run Preview
              </h4>
              <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-indigo-800">
                    If triggered now, next action would run at:
                  </p>
                  <p className="font-medium mt-1 text-indigo-900">
                    {nextRun.time}
                  </p>
                  <p className="text-xs text-indigo-700 mt-1">
                    Timezone: {nextRun.timezone}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
