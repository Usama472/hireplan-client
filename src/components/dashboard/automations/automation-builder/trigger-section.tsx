import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileCheck,
  Mail,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

interface TriggerSectionProps {
  form: UseFormReturn<any>;
  onTriggerTypeChange?: (type: string) => void;
  selectedAutomationType?: "email" | "job" | "schedule";
}

type TriggerCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
};

export default function TriggerSection({
  form,
  onTriggerTypeChange,
}: TriggerSectionProps) {
  // Function to select a trigger type
  const selectTriggerType = (triggerType: string) => {
    form.setValue("trigger.type", triggerType);
    form.setValue("trigger.config", {});

    if (onTriggerTypeChange) {
      onTriggerTypeChange(triggerType);
    }
  };

  // Trigger categories for better organization
  const triggerCategories: TriggerCategory[] = [
    {
      id: "application",
      title: "Application Triggers",
      description: "Events based on applicant activity",
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "job",
      title: "Job Triggers",
      description: "Events related to job postings",
      icon: Briefcase,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      id: "communication",
      title: "Communication Triggers",
      description: "Email and messaging events",
      icon: Mail,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      id: "schedule",
      title: "Scheduled Triggers",
      description: "Time-based recurring events",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  // All available triggers
  const allTriggers = [
    {
      type: "application_created",
      label: "New Application",
      description: "When a candidate applies to a job",
      icon: <UserCheck className="h-5 w-5" />,
      category: "application",
      color: "bg-blue-500",
      iconBg: "bg-blue-100",
    },
    {
      type: "application_status_changed",
      label: "Application Status Change",
      description: "When an application's status is updated",
      icon: <FileCheck className="h-5 w-5" />,
      category: "application",
      color: "bg-indigo-500",
      iconBg: "bg-indigo-100",
    },
    {
      type: "resume_score_updated",
      label: "Resume Score Updated",
      description: "When a candidate's resume score changes",
      icon: <CheckCircle2 className="h-5 w-5" />,
      category: "application",
      color: "bg-green-500",
      iconBg: "bg-green-100",
    },
    {
      type: "job_created",
      label: "Job Created",
      description: "When a new job is created in the system",
      icon: <Briefcase className="h-5 w-5" />,
      category: "job",
      color: "bg-amber-500",
      iconBg: "bg-amber-100",
    },
    {
      type: "job_published",
      label: "Job Published",
      description: "When a job posting goes live publicly",
      icon: <Briefcase className="h-5 w-5" />,
      category: "job",
      color: "bg-emerald-500",
      iconBg: "bg-emerald-100",
    },
    {
      type: "job_expired",
      label: "Job Expired",
      description: "When a job posting reaches its expiration date",
      icon: <AlertCircle className="h-5 w-5" />,
      category: "job",
      color: "bg-red-500",
      iconBg: "bg-red-100",
    },
    {
      type: "candidate_matched",
      label: "Candidate Match",
      description: "When a candidate is matched to a job",
      icon: <UserCheck className="h-5 w-5" />,
      category: "application",
      color: "bg-violet-500",
      iconBg: "bg-violet-100",
    },
    {
      type: "email_received",
      label: "Email Received",
      description: "When an email is received in the system",
      icon: <Mail className="h-5 w-5" />,
      category: "communication",
      color: "bg-blue-500",
      iconBg: "bg-blue-100",
    },
    {
      type: "cron",
      label: "Scheduled Time",
      description: "Recurring time-based trigger (daily, weekly, monthly)",
      icon: <Calendar className="h-5 w-5" />,
      category: "schedule",
      color: "bg-purple-500",
      iconBg: "bg-purple-100",
    },
  ];

  const selectedTriggerType = form.watch("trigger.type");

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        Choose when your automation should run by selecting a trigger event
        below
      </p>

      <div className="bg-gray-50/50 p-0.5 rounded-xl">
        <FormField
          control={form.control}
          name="trigger.type"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    selectTriggerType(value);
                    field.onChange(value);
                  }}
                  value={field.value}
                  className="space-y-6"
                >
                  {triggerCategories.map((category) => {
                    const CategoryIcon = category.icon;
                    const categoryTriggers = allTriggers.filter(
                      (t) => t.category === category.id
                    );

                    return (
                      <div key={category.id} className="space-y-3">
                        <div
                          className={cn(
                            "p-3 rounded-lg flex items-center gap-3",
                            category.bgColor
                          )}
                        >
                          <div
                            className={cn(
                              "p-1.5 rounded-md",
                              category.color,
                              "bg-white/80"
                            )}
                          >
                            <CategoryIcon
                              className={cn("h-5 w-5", category.color)}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {category.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {category.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-2">
                          {categoryTriggers.map((trigger) => (
                            <div key={trigger.type} className="relative">
                              <RadioGroupItem
                                value={trigger.type}
                                id={trigger.type}
                                className="peer sr-only"
                              />
                              <label
                                htmlFor={trigger.type}
                                className={cn(
                                  "flex h-full cursor-pointer rounded-lg p-4 border border-gray-200",
                                  "transition-all duration-150 hover:border-gray-300 hover:bg-white",
                                  "peer-data-[state=checked]:border-primary/60 peer-data-[state=checked]:bg-primary/5",
                                  "peer-focus-visible:outline-none peer-focus-visible:ring-1 peer-focus-visible:ring-primary"
                                )}
                              >
                                <div className="flex items-start w-full">
                                  <div
                                    className={cn(
                                      "mt-0.5 p-1.5 rounded-md mr-3 flex-shrink-0",
                                      trigger.iconBg
                                    )}
                                  >
                                    <div className="text-primary">
                                      {trigger.icon}
                                    </div>
                                  </div>
                                  <div className="flex-grow min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium text-sm text-gray-800 truncate pr-2">
                                        {trigger.label}
                                      </p>
                                      {field.value === trigger.type && (
                                        <div
                                          className={cn("text-primary h-4 w-4")}
                                        >
                                          <CheckCircle2 className="h-full w-full" />
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                      {trigger.description}
                                    </p>
                                  </div>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Removed the Dynamic configuration section for triggers */}
    </div>
  );
}
