import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookCopy, Clock, MessageSquare, RefreshCw } from "lucide-react";

interface TriggerSectionProps {
  form: any; // Using any temporarily to avoid TypeScript errors with form types
}

export default function TriggerSection({ form }: TriggerSectionProps) {
  const applicationStatuses = [
    { value: "applied", label: "Applied" },
    { value: "screening", label: "Screening" },
    { value: "interviewing", label: "Interviewing" },
    { value: "rejected", label: "Rejected" },
    { value: "offered", label: "Offered" },
    { value: "hired", label: "Hired" },
  ];

  // SIMPLIFY: Only check the current value directly from the form
  const currentValue = form.getValues("trigger.type") || "application_created";

  // Simple direct handler with no side effects
  const selectTriggerType = (type: string) => {
    // Don't do anything if already selected
    if (currentValue === type) return;

    // Update the form field directly
    form.setValue("trigger.type", type);

    // Reset config to empty object
    form.setValue("trigger.config", {});
  };

  return (
    <div className="space-y-6">
      {/* Hidden input to ensure trigger.type is registered with the form */}
      <input
        type="hidden"
        {...form.register("trigger.type")}
        value={currentValue}
      />

      <div>
        <h3 className="text-sm font-medium mb-3">Select Trigger Type</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Application Created */}
          <div
            className={`cursor-pointer transition-all duration-200 rounded-md border p-3 ${
              currentValue === "application_created"
                ? "border-indigo-500 bg-indigo-50 shadow-none"
                : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
            }`}
            onClick={() => selectTriggerType("application_created")}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`p-2 rounded-full ${
                  currentValue === "application_created"
                    ? "bg-indigo-100"
                    : "bg-gray-100"
                }`}
              >
                <BookCopy
                  className={`h-4 w-4 ${
                    currentValue === "application_created"
                      ? "text-indigo-600"
                      : "text-gray-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h4 className="block font-medium text-xs">
                  Application Created
                </h4>
                <p className="text-xs text-gray-500 leading-tight">
                  New application submitted
                </p>
              </div>
            </div>
          </div>

          {/* Application Status Changed */}
          <div
            className={`cursor-pointer transition-all duration-200 rounded-md border p-3 ${
              currentValue === "application_status_changed"
                ? "border-indigo-500 bg-indigo-50 shadow-none"
                : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
            }`}
            onClick={() => selectTriggerType("application_status_changed")}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`p-2 rounded-full ${
                  currentValue === "application_status_changed"
                    ? "bg-indigo-100"
                    : "bg-gray-100"
                }`}
              >
                <MessageSquare
                  className={`h-4 w-4 ${
                    currentValue === "application_status_changed"
                      ? "text-indigo-600"
                      : "text-gray-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h4 className="block font-medium text-xs">Status Changed</h4>
                <p className="text-xs text-gray-500 leading-tight">
                  Application status changes
                </p>
              </div>
            </div>
          </div>

          {/* Resume Score Updated */}
          <div
            className={`cursor-pointer transition-all duration-200 rounded-md border p-3 ${
              currentValue === "resume_score_updated"
                ? "border-indigo-500 bg-indigo-50 shadow-none"
                : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
            }`}
            onClick={() => selectTriggerType("resume_score_updated")}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`p-2 rounded-full ${
                  currentValue === "resume_score_updated"
                    ? "bg-indigo-100"
                    : "bg-gray-100"
                }`}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    currentValue === "resume_score_updated"
                      ? "text-indigo-600"
                      : "text-gray-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h4 className="block font-medium text-xs">
                  Resume Score Updated
                </h4>
                <p className="text-xs text-gray-500 leading-tight">
                  Resume score changes
                </p>
              </div>
            </div>
          </div>

          {/* Scheduled */}
          <div
            className={`cursor-pointer transition-all duration-200 rounded-md border p-3 ${
              currentValue === "cron"
                ? "border-indigo-500 bg-indigo-50 shadow-none"
                : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
            }`}
            onClick={() => selectTriggerType("cron")}
          >
            <div className="flex flex-col items-center text-center gap-2">
              <div
                className={`p-2 rounded-full ${
                  currentValue === "cron" ? "bg-indigo-100" : "bg-gray-100"
                }`}
              >
                <Clock
                  className={`h-4 w-4 ${
                    currentValue === "cron"
                      ? "text-indigo-600"
                      : "text-gray-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h4 className="block font-medium text-xs">Scheduled</h4>
                <p className="text-xs text-gray-500 leading-tight">
                  On a scheduled basis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional fields based on trigger type */}
      {currentValue === "application_status_changed" && (
        <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700">
            Status Change Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="trigger.config.from"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-600">
                    From Status (optional)
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      // Convert "any" to null for the form value
                      field.onChange(val === "any" ? null : val);
                    }}
                    value={
                      field.value === null || field.value === undefined
                        ? "any"
                        : field.value
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="shadow-none">
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any status</SelectItem>
                      {applicationStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trigger.config.to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-600">
                    To Status
                  </FormLabel>
                  <Select
                    onValueChange={(val) => {
                      // Convert "any" to null for the form value
                      field.onChange(val === "any" ? null : val);
                    }}
                    value={
                      field.value === null || field.value === undefined
                        ? "any"
                        : field.value
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="shadow-none">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any status</SelectItem>
                      {applicationStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {currentValue === "cron" && (
        <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700">
            Schedule Settings
          </h3>
          <FormField
            control={form.control}
            name="trigger.config.expression"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-gray-600">
                  CRON Expression
                </FormLabel>
                <FormControl>
                  <input
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 shadow-none"
                    placeholder="e.g., 0 9 * * *"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <p className="text-xs text-gray-500">
            Example: "0 9 * * *" runs daily at 9 AM
          </p>
        </div>
      )}
    </div>
  );
}
