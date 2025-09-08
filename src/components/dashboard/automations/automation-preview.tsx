import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { AutomationType } from "@/interfaces/automations";
import { format, parseISO } from "date-fns";
import {
  ArrowRight,
  ArrowRightCircle,
  Calendar,
  Calendar as CalendarIcon,
  Clock,
  FileCheck,
  HistoryIcon,
  ListFilter,
  Pencil,
  Trash2,
} from "lucide-react";

interface AutomationPreviewProps {
  automation: AutomationType;
  onEdit: () => void;
  onEnableToggle: (enabled: boolean) => void;
  onDelete: () => void;
}

export default function AutomationPreview({
  automation,
  onEdit,
  onEnableToggle,
  onDelete,
}: AutomationPreviewProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    try {
      return format(parseISO(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const renderTriggerDetails = () => {
    const { type, config } = automation.trigger;

    switch (type) {
      case "application_created":
        return (
          <div className="flex items-center gap-3">
            <ArrowRightCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Application Created</p>
              <p className="text-sm text-gray-500">
                Triggers when a new application is created
              </p>
            </div>
          </div>
        );

      case "application_status_changed":
        return (
          <div className="flex items-center gap-3">
            <ArrowRightCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Application Status Changed</p>
              <div className="flex items-center gap-2 text-sm">
                {config.from ? (
                  <Badge variant="outline">{config.from}</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-gray-500 border-gray-300"
                  >
                    Any status
                  </Badge>
                )}
                <ArrowRight className="h-3 w-3 text-gray-400" />
                {config.to ? (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 border-primary/20 text-primary"
                  >
                    {config.to}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-gray-500 border-gray-300"
                  >
                    Any status
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );

      case "resume_score_updated":
        return (
          <div className="flex items-center gap-3">
            <ArrowRightCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Resume Score Updated</p>
              <p className="text-sm text-gray-500">
                Triggers when a candidate's resume score changes
              </p>
            </div>
          </div>
        );

      case "cron":
        return (
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Scheduled</p>
              <p className="text-sm text-gray-500">
                {config.expression
                  ? `Runs on schedule: ${config.expression}`
                  : "Runs on a custom schedule"}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-3">
            <ArrowRightCircle className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Custom Trigger</p>
              <p className="text-sm text-gray-500">
                Custom trigger configuration
              </p>
            </div>
          </div>
        );
    }
  };

  const renderConditionsSection = () => {
    if (!automation.conditions || automation.conditions.length === 0) {
      return (
        <div className="flex items-center gap-3 text-gray-500 italic">
          <p>No conditions set - automation will always run when triggered</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {automation.conditions.map((condition, index) => (
          <div key={index} className="flex items-center gap-3">
            <ListFilter className="h-5 w-5 text-purple-500 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-gray-50">
                  {condition.field}
                </Badge>
                <span className="text-sm font-medium">
                  {condition.operator}
                </span>
                <Badge
                  variant="outline"
                  className="bg-purple-50 border-purple-200 text-purple-700"
                >
                  {condition.value}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActionsSection = () => {
    if (!automation.actions || automation.actions.length === 0) {
      return (
        <div className="flex items-center gap-3 text-gray-500 italic">
          <p>No actions configured</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {automation.actions.map((action, index) => {
          const { type, config } = action;

          switch (type) {
            case "send_email":
              return (
                <div key={index} className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    <FileCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Send Email</p>

                    {config.templateId && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Template:</span>
                        <Badge
                          variant="outline"
                          className="bg-primary/10 border-primary/20 text-primary"
                        >
                          {config.templateId}
                        </Badge>
                      </div>
                    )}

                    {config.delay && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-500">Delay:</span>
                        <span>
                          {config.delay.value} {config.delay.unit}
                        </span>
                        {config.timezone && (
                          <span className="text-gray-500 text-xs">
                            ({config.timezone})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );

            case "webhook":
              return (
                <div key={index} className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    <ArrowRightCircle className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Send Webhook</p>

                    {config.url && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">URL:</span>
                        <span className="text-primary underline font-mono text-xs truncate max-w-md">
                          {config.url}
                        </span>
                      </div>
                    )}

                    {config.method && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Method:</span>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 border-purple-200 text-purple-700 font-mono"
                        >
                          {config.method}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );

            case "slack":
              return (
                <div key={index} className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    <ArrowRightCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Send Slack Notification</p>
                    {config.channel && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Channel:</span>
                        <span className="text-gray-800 font-mono">
                          #{config.channel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );

            default:
              return (
                <div key={index} className="flex gap-3">
                  <div className="mt-1 shrink-0">
                    <ArrowRightCircle className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">Custom Action</p>
                    <p className="text-sm text-gray-500">
                      Custom action configuration
                    </p>
                  </div>
                </div>
              );
          }
        })}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg animate-slideInRight">
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {automation.name}
            </h2>
            <p className="mt-1.5 text-gray-600">{automation.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium text-gray-700">
                {automation.enabled ? "Enabled" : "Disabled"}
              </span>
              <Switch
                checked={automation.enabled}
                onCheckedChange={onEnableToggle}
                aria-label="Toggle automation"
                className="transition-opacity duration-200 hover:opacity-90"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="border-gray-200 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-300 hover:scale-105"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Trigger Section */}
        <div
          className="space-y-4 animate-fadeIn"
          style={{ animationDelay: "100ms" }}
        >
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <span className="bg-primary/10 text-primary p-1 rounded-md mr-2">
              <ArrowRightCircle className="h-4 w-4" />
            </span>
            Trigger
          </h3>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 transition-all duration-300 hover:border-primary/20">
            {renderTriggerDetails()}
          </div>
        </div>

        <Separator className="bg-gray-100" />

        {/* Conditions Section */}
        <div
          className="space-y-4 animate-fadeIn"
          style={{ animationDelay: "200ms" }}
        >
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <span className="bg-secondary/10 text-secondary p-1 rounded-md mr-2">
              <ListFilter className="h-4 w-4" />
            </span>
            Conditions
          </h3>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 transition-all duration-300 hover:border-secondary/20">
            {renderConditionsSection()}
          </div>
        </div>

        <Separator className="bg-gray-100" />

        {/* Actions Section */}
        <div
          className="space-y-4 animate-fadeIn"
          style={{ animationDelay: "300ms" }}
        >
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <span className="bg-accent/10 text-accent p-1 rounded-md mr-2">
              <FileCheck className="h-4 w-4" />
            </span>
            Actions
          </h3>
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 transition-all duration-300 hover:border-accent/20">
            {renderActionsSection()}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 flex items-center justify-between py-5 px-6 rounded-b-lg border-t border-gray-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HistoryIcon className="h-4 w-4" />
            <span>Last run:</span>
            <span className="font-medium">
              {automation.lastRunAt
                ? formatDate(automation.lastRunAt)
                : "Never"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>Next scheduled:</span>
            <span className="font-medium">
              {automation.nextRunAt
                ? formatDate(automation.nextRunAt)
                : "Not scheduled"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:bg-gray-100 transition-transform duration-200 hover:scale-105"
            onClick={() => {
              // Navigate to automation logs view
              console.log("View logs");
            }}
          >
            <HistoryIcon className="w-4 h-4 mr-2" />
            View Audit Logs
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200 transition-transform duration-200 hover:scale-105"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="animate-scaleIn">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete automation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this automation? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-200">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-600 hover:bg-red-700 transition-transform duration-200 hover:scale-105"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
