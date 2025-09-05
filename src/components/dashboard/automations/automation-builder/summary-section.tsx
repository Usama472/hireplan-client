import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { addDays, addHours, addMinutes, format } from "date-fns";
import {
  ArrowRightCircle,
  Calendar,
  Clock,
  FileCheck,
  MessageSquare,
  Webhook,
} from "lucide-react";

interface SummarySectionProps {
  form: any; // Using any temporarily to avoid TypeScript errors with form types
}

export default function SummarySection({ form }: SummarySectionProps) {
  const automation = form.watch();
  const triggerType = automation.trigger?.type;
  const actions = automation.actions || [];

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
      case "custom":
        return "Execute custom action";
      default:
        return "Unknown action";
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "send_email":
        return <FileCheck className="h-5 w-5 text-blue-600" />;
      case "webhook":
        return <Webhook className="h-5 w-5 text-purple-600" />;
      case "slack":
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      default:
        return <ArrowRightCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTriggerIcon = () => {
    switch (triggerType) {
      case "cron":
        return <Calendar className="h-5 w-5 text-orange-500" />;
      default:
        return <ArrowRightCircle className="h-5 w-5 text-blue-500" />;
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

  return (
    <div className="space-y-6">
      <h3 className="text-base font-medium mb-3">Automation Summary</h3>

      <div className="border border-gray-200 rounded-lg p-6 space-y-6 shadow-none">
        <div>
          <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-3">
            Trigger
          </h4>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gray-50">
              {getTriggerIcon()}
            </div>
            <div>
              <p className="font-medium">{getTriggerSummary()}</p>
              <Badge variant="outline" className="mt-2 shadow-none">
                {triggerType}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {automation.conditions && automation.conditions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-3">
              Conditions
            </h4>
            <div className="space-y-3">
              {automation.conditions.map((condition: any, index: number) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-gray-50 shadow-none">
                    {condition.field}
                  </Badge>
                  <span className="font-medium">{condition.operator}</span>
                  <Badge
                    variant="outline"
                    className="bg-gray-50 border-gray-200 text-gray-700 shadow-none"
                  >
                    {condition.value}
                  </Badge>
                </div>
              ))}
            </div>
            <Separator className="mt-6" />
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-3">
            Actions
          </h4>
          {actions.length === 0 ? (
            <p className="text-sm italic text-gray-500">
              No actions configured
            </p>
          ) : (
            <div className="space-y-4">
              {actions.map((action: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-gray-50 shrink-0 mt-1">
                    {getActionIcon(action.type)}
                  </div>
                  <div className="space-y-1">
                    <p>{getActionSummary(action)}</p>
                    <Badge variant="outline" className="text-xs shadow-none">
                      {action.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {nextRun && (
          <>
            <Separator />

            <div>
              <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 mb-3">
                Next Run Preview
              </h4>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm">
                    If triggered now, next action would run at:
                  </p>
                  <p className="font-medium mt-1">{nextRun.time}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {nextRun.timezone}
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
