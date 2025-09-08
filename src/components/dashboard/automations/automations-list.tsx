import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import type { AutomationType } from "@/interfaces/automations";
import { cn } from "@/lib/utils";
import { Clock, MoreHorizontal, Pencil } from "lucide-react";

interface AutomationsListProps {
  automations: AutomationType[];
  selectedId?: string;
  onSelect: (automation: AutomationType) => void;
  onEnableToggle: (id: string, enabled: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AutomationsList({
  automations,
  selectedId,
  onSelect,
  onEnableToggle,
  onEdit,
  onDelete,
}: AutomationsListProps) {
  const getTriggerSummary = (automation: AutomationType) => {
    switch (automation.trigger.type) {
      case "application_created":
        return "When application is created";
      case "application_status_changed":
        if (automation.trigger.config.from && automation.trigger.config.to) {
          return `When status changes from ${automation.trigger.config.from} to ${automation.trigger.config.to}`;
        } else if (automation.trigger.config.to) {
          return `When status changes to ${automation.trigger.config.to}`;
        } else {
          return "When status changes";
        }
      case "resume_score_updated":
        return "When resume score updates";
      case "cron":
        return "On schedule";
      default:
        return "When triggered";
    }
  };

  return (
    <div className="space-y-4">
      {automations.map((automation, index) => (
        <div
          key={automation.id}
          className={cn(
            "border border-gray-200 bg-white rounded-lg cursor-pointer transition-all duration-300 card-hover-effect",
            selectedId === automation.id && "border-primary bg-primary/5",
            "animate-slideIn"
          )}
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => onSelect(automation)}
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {automation.name}
                  </h3>
                  <Switch
                    checked={automation.enabled}
                    onCheckedChange={(checked) => {
                      // Prevent the card click event
                      event?.stopPropagation();
                      onEnableToggle(automation.id, checked);
                    }}
                    className="ml-2 transition-opacity duration-200 hover:opacity-90"
                    aria-label={`Toggle ${automation.name}`}
                  />
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {automation.description}
                </p>

                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1.5" />
                  {getTriggerSummary(automation)}
                </div>

                {/* Action badges */}
                <div className="flex flex-wrap gap-2 mt-3.5">
                  {automation.actions.map((action, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={cn(
                        "text-xs border-0 badge-animate-in",
                        action.type === "send_email" &&
                          "bg-blue-50 text-blue-700",
                        action.type === "webhook" &&
                          "bg-purple-50 text-purple-700",
                        action.type === "slack" && "bg-green-50 text-green-700",
                        action.type === "custom" &&
                          "bg-orange-50 text-orange-700"
                      )}
                      style={{ animationDelay: `${(index + 1) * 50}ms` }}
                    >
                      {action.type === "send_email"
                        ? "Email"
                        : action.type === "webhook"
                        ? "Webhook"
                        : action.type === "slack"
                        ? "Slack"
                        : "Custom"}
                    </Badge>
                  ))}
                </div>
              </div>

              <div
                className="flex items-center gap-1 ml-4"
                onClick={(e) => e.stopPropagation()}
              >
                                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 transition-transform duration-200 hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(automation.id);
                    }}
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                    <span className="sr-only">Edit</span>
                  </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-primary/10 transition-transform duration-200 hover:scale-110"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="animate-scaleIn">
                    <DropdownMenuItem onClick={() => onEdit(automation.id)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(automation.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
