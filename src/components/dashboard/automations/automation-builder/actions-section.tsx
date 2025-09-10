import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  Bot,
  FileText,
  Mail,
  MessageSquare,
  Plus,
  Rocket,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useFieldArray } from "react-hook-form";

interface ActionsSectionProps {
  form: any;
  automationType?: "email" | "job" | "schedule";
}

export default function ActionsSection({ form }: ActionsSectionProps) {
  // Use field array to handle dynamic actions
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "actions",
  });

  const [tempActionType, setTempActionType] = useState<string>("send_email");

  // Define our two action types
  const actionTypes = [
    {
      type: "send_email",
      label: "Send Email",
      description: "Send an email using a template with delay options",
      icon: <Mail className="h-5 w-5" />,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      glowColor: "shadow-blue-500/30",
      gradient: "from-blue-500 to-sky-500",
      lightGradient: "from-blue-50 to-blue-100/50",
    },
    {
      type: "ai_rule",
      label: "AI Rule",
      description: "Leverage AI to automate decisions and actions",
      icon: <Sparkles className="h-5 w-5" />,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      glowColor: "shadow-purple-500/30",
      gradient: "from-purple-500 to-indigo-500",
      lightGradient: "from-purple-50 to-purple-100/50",
    },
  ];

  // Add a new action based on the temp action type
  const addAction = useCallback(
    (e?: React.MouseEvent, actionType = tempActionType) => {
      // Prevent default form submission if triggered by a button
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Create specific default config based on action type
      let config = {};

      if (actionType === "send_email") {
        config = {
          templateId: "",
          delay: { value: 0, unit: "days" },
          timezone: "UTC",
        };
      } else if (actionType === "ai_rule") {
        config = {
          mode: "auto",
          reviewRequired: true,
        };
      }

      append({
        type: actionType,
        config,
      });
    },
    [append, tempActionType]
  );

  // Type assertion for field to avoid type errors
  interface ActionField {
    id: string;
    type: string;
    config?: Record<string, any>;
  }

  return (
    <div className="space-y-6">
      {fields.length === 0 ? (
        <div className="overflow-hidden">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 relative">
            {/* Background decorative elements - more subtle */}
            <div className="absolute inset-0 overflow-hidden opacity-5">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-blue-200 blur-3xl"></div>
              <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-purple-200 blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center relative">
                      <Zap className="h-7 w-7 text-slate-700" />
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-medium text-slate-800 mb-2">
                  Choose Your Action
                </h2>
                <p className="text-slate-600 max-w-md mx-auto mb-8 text-sm">
                  Actions define what happens when your automation runs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {actionTypes.map((action) => (
                  <div
                    key={action.type}
                    onClick={(e) => {
                      setTempActionType(action.type);
                      addAction(e, action.type);
                    }}
                    className={cn(
                      "group relative bg-white rounded-lg overflow-hidden",
                      "transition-all duration-300 cursor-pointer",
                      "hover:bg-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-1 w-full",
                        action.type === "send_email"
                          ? "bg-blue-400"
                          : "bg-purple-400"
                      )}
                    ></div>

                    <div className="p-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3 relative">
                          <div
                            className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center relative",
                              "bg-white",
                              action.type === "send_email"
                                ? "text-blue-500"
                                : "text-purple-500",
                              "group-hover:scale-110 transition-transform duration-300"
                            )}
                          >
                            {action.icon}
                          </div>
                        </div>

                        <div>
                          <h3
                            className={cn(
                              "text-base font-medium mb-1 group-hover:translate-x-0.5 transition-transform duration-300",
                              action.type === "send_email"
                                ? "text-blue-700"
                                : "text-purple-700"
                            )}
                          >
                            {action.label}
                          </h3>
                          <p className="text-slate-600 text-xs leading-relaxed">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative pb-6">
            {/* Vertical timeline line connecting actions - more subtle */}
            {fields.length > 1 && (
              <div className="absolute left-7 top-10 bottom-10 w-px bg-gradient-to-b from-blue-100 via-purple-100 to-blue-100 z-0"></div>
            )}

            <div className="space-y-8 relative z-10">
              {fields.map((field, index) => {
                // Add type assertion for the field
                const typedField = field as unknown as ActionField;
                const actionType =
                  actionTypes.find((a) => a.type === typedField.type) ||
                  actionTypes[0];

                return (
                  <div key={field.id} className="relative">
                    {/* Step connector with "then" indicator - more subtle */}
                    {index > 0 && (
                      <div className="absolute -top-5 left-7 transform -translate-x-1/2 flex flex-col items-center">
                        <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center">
                          <ArrowDown className="h-2.5 w-2.5 text-slate-400" />
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5">
                          then
                        </span>
                      </div>
                    )}

                    {/* Action card with minimal styling */}
                    <div className="bg-white overflow-hidden relative transition-all duration-300 transform hover:bg-slate-50">
                      {/* Top color bar based on action type */}
                      <div
                        className={cn(
                          "h-1 w-full",
                          typedField.type === "send_email"
                            ? "bg-blue-400"
                            : "bg-purple-400"
                        )}
                      ></div>

                      <div className="p-4 relative">
                        <div className="flex items-start">
                          {/* Icon with minimal styling */}
                          <div className="mr-4 relative">
                            <div
                              className={cn(
                                "h-12 w-12 rounded-full flex items-center justify-center relative bg-white",
                                typedField.type === "send_email"
                                  ? "text-blue-500"
                                  : "text-purple-500"
                              )}
                            >
                              <div>{actionType.icon}</div>

                              {/* Small indicator badge for step number */}
                              <div
                                className={cn(
                                  "absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs flex items-center justify-center font-medium",
                                  typedField.type === "send_email"
                                    ? "bg-blue-500 text-white"
                                    : "bg-purple-500 text-white"
                                )}
                              >
                                {index + 1}
                              </div>
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h4
                                    className={cn(
                                      "text-base font-medium",
                                      typedField.type === "send_email"
                                        ? "text-blue-700"
                                        : "text-purple-700"
                                    )}
                                  >
                                    {actionType.label}
                                  </h4>
                                  <Badge
                                    className={cn(
                                      "font-normal text-xs",
                                      typedField.type === "send_email"
                                        ? "bg-blue-50 text-blue-600"
                                        : "bg-purple-50 text-purple-600"
                                    )}
                                  >
                                    {index === 0
                                      ? "First Step"
                                      : `Step ${index + 1}`}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {actionType.description}
                                </p>
                              </div>

                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  remove(index);
                                }}
                                className="opacity-60 hover:opacity-100 hover:bg-red-50 hover:text-red-500 h-8 w-8 p-0 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Configuration panels based on action type */}
                            {typedField.type === "send_email" && (
                              <div className="mt-3 rounded-md bg-gray-50 p-4">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name={`actions.${index}.config.templateId`}
                                      render={({ field: configField }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs font-medium text-gray-700 flex items-center gap-2">
                                            <FileText className="h-3 w-3 text-blue-500" />
                                            Email Template
                                          </FormLabel>
                                          <Select
                                            onValueChange={configField.onChange}
                                            defaultValue={configField.value}
                                          >
                                            <FormControl>
                                              <SelectTrigger className="bg-white h-8 text-sm">
                                                <SelectValue placeholder="Select template" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              <SelectItem value="welcome">
                                                Welcome Email
                                              </SelectItem>
                                              <SelectItem value="interview-invite">
                                                Interview Invitation
                                              </SelectItem>
                                              <SelectItem value="rejection">
                                                Rejection Email
                                              </SelectItem>
                                              <SelectItem value="offer">
                                                Job Offer
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </FormItem>
                                      )}
                                    />
                                  </div>

                                  <div className="bg-white p-3 rounded-md">
                                    <h5 className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-2">
                                      <Rocket className="h-3 w-3 text-blue-500" />
                                      Sending Options
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                      <FormField
                                        control={form.control}
                                        name={`actions.${index}.config.delay.value`}
                                        render={({ field: configField }) => (
                                          <FormItem className="col-span-1">
                                            <FormLabel className="text-xs font-medium text-gray-600">
                                              Delay
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                {...configField}
                                                min="0"
                                                className="bg-white h-8 text-sm"
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name={`actions.${index}.config.delay.unit`}
                                        render={({ field: configField }) => (
                                          <FormItem className="col-span-1">
                                            <FormLabel className="text-xs font-medium text-gray-600">
                                              Unit
                                            </FormLabel>
                                            <Select
                                              onValueChange={
                                                configField.onChange
                                              }
                                              defaultValue={configField.value}
                                            >
                                              <FormControl>
                                                <SelectTrigger className="bg-white h-8 text-sm">
                                                  <SelectValue placeholder="Unit" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="minutes">
                                                  Minutes
                                                </SelectItem>
                                                <SelectItem value="hours">
                                                  Hours
                                                </SelectItem>
                                                <SelectItem value="days">
                                                  Days
                                                </SelectItem>
                                                <SelectItem value="weeks">
                                                  Weeks
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={form.control}
                                        name={`actions.${index}.config.timezone`}
                                        render={({ field: configField }) => (
                                          <FormItem className="col-span-1">
                                            <FormLabel className="text-xs font-medium text-gray-600">
                                              Timezone
                                            </FormLabel>
                                            <Select
                                              onValueChange={
                                                configField.onChange
                                              }
                                              defaultValue={configField.value}
                                            >
                                              <FormControl>
                                                <SelectTrigger className="bg-white h-8 text-sm">
                                                  <SelectValue placeholder="Select timezone" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="UTC">
                                                  UTC
                                                </SelectItem>
                                                <SelectItem value="America/New_York">
                                                  Eastern Time
                                                </SelectItem>
                                                <SelectItem value="America/Chicago">
                                                  Central Time
                                                </SelectItem>
                                                <SelectItem value="America/Denver">
                                                  Mountain Time
                                                </SelectItem>
                                                <SelectItem value="America/Los_Angeles">
                                                  Pacific Time
                                                </SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* AI Rule placeholder UI - more minimal */}
                            {typedField.type === "ai_rule" && (
                              <div className="mt-3 rounded-md bg-gray-50 p-4">
                                <div className="flex items-center p-3 bg-purple-50 rounded-md mb-4">
                                  <div className="mr-3 p-1.5">
                                    <Wand2 className="h-4 w-4 text-purple-500" />
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-medium text-purple-700">
                                      AI Rule Configuration
                                    </h5>
                                    <p className="text-xs text-purple-600">
                                      Coming soon: Create powerful
                                      decision-making logic
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-white border-l-2 border-purple-200 p-3 rounded-sm flex items-center text-xs text-slate-600">
                                    <MessageSquare className="h-4 w-4 text-purple-400 mr-2" />
                                    <span>
                                      Intelligent decision making with AI
                                    </span>
                                  </div>

                                  <div className="bg-white border-l-2 border-purple-200 p-3 rounded-sm flex items-center text-xs text-slate-600">
                                    <Bot className="h-4 w-4 text-purple-400 mr-2" />
                                    <span>
                                      Automated actions based on conditions
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <FormField
                                    control={form.control}
                                    name={`actions.${index}.config.reviewRequired`}
                                    render={({ field: configField }) => (
                                      <FormItem className="flex items-center justify-between">
                                        <FormLabel className="text-xs text-gray-700 cursor-pointer">
                                          Review Before Executing
                                        </FormLabel>
                                        <FormControl>
                                          <Switch
                                            checked={configField.value}
                                            onCheckedChange={
                                              configField.onChange
                                            }
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add More Actions - Minimal UI */}
          <div className="mt-8 flex justify-center">
            <div className="max-w-3xl w-full">
              <div className="grid grid-cols-2 gap-3">
                {actionTypes.map((action) => (
                  <div
                    key={action.type}
                    onClick={(e) => {
                      setTempActionType(action.type);
                      addAction(e, action.type);
                    }}
                    className={cn(
                      "p-3 rounded-md cursor-pointer",
                      "transition-all duration-200 flex items-center gap-2",
                      tempActionType === action.type
                        ? action.type === "send_email"
                          ? "bg-blue-50"
                          : "bg-purple-50"
                        : "bg-white hover:bg-slate-50"
                    )}
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-md",
                        action.type === "send_email"
                          ? "bg-blue-100"
                          : "bg-purple-100"
                      )}
                    >
                      <div className={action.color}>{action.icon}</div>
                    </div>
                    <div>
                      <h4
                        className={cn(
                          "text-sm font-medium",
                          action.type === "send_email"
                            ? "text-blue-700"
                            : "text-purple-700"
                        )}
                      >
                        {action.label}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  onClick={(e) => addAction(e)}
                  className={cn(
                    "h-9 gap-1.5 text-sm",
                    "bg-slate-800 hover:bg-slate-900 text-white"
                  )}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add{" "}
                  {tempActionType === "send_email" ? "Email Action" : "AI Rule"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-md p-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white rounded-md">
                <Bot className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h4 className="text-xs font-medium text-slate-800 mb-1">
                  How Your Workflow Will Run
                </h4>
                <p className="text-xs text-slate-600 leading-normal">
                  Actions execute in sequence from top to bottom when conditions
                  are met and the trigger event occurs.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
