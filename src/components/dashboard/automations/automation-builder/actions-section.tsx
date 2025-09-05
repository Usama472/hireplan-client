import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Mail, MessageSquare, Plus, Trash2, Webhook } from "lucide-react";
import { useState } from "react";

interface ActionsSectionProps {
  form: any; // Using any temporarily to avoid TypeScript errors with form types
}

export default function ActionsSection({ form }: ActionsSectionProps) {
  const actions = form.watch("actions") || [];
  const [tempActionType, setTempActionType] = useState<string>("send_email");

  // Email templates (mock data)
  const emailTemplates = [
    { id: "welcome-template", name: "Welcome Template" },
    { id: "rejection-standard", name: "Rejection - Standard" },
    { id: "qualified-followup", name: "Qualified Candidate Follow-up" },
    { id: "interview-invitation", name: "Interview Invitation" },
    { id: "onboarding", name: "Onboarding" },
  ];

  // Timezone options
  const timezoneOptions = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)" },
    { value: "America/New_York", label: "Eastern Time (US & Canada)" },
    { value: "America/Chicago", label: "Central Time (US & Canada)" },
    { value: "America/Denver", label: "Mountain Time (US & Canada)" },
    { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
    { value: "Europe/London", label: "London" },
    { value: "Asia/Tokyo", label: "Tokyo" },
    { value: "Asia/Karachi", label: "Karachi" },
    { value: "Australia/Sydney", label: "Sydney" },
  ];

  // HTTP method options
  const httpMethods = [
    { value: "GET", label: "GET" },
    { value: "POST", label: "POST" },
    { value: "PUT", label: "PUT" },
    { value: "PATCH", label: "PATCH" },
    { value: "DELETE", label: "DELETE" },
  ];

  const addAction = () => {
    const currentActions = form.getValues("actions") || [];

    let newAction;

    switch (tempActionType) {
      case "send_email":
        newAction = {
          type: "send_email",
          config: {
            templateId: "",
            delay: {
              value: 0,
              unit: "days",
            },
            timezone: "UTC",
          },
        };
        break;

      case "webhook":
        newAction = {
          type: "webhook",
          config: {
            url: "",
            method: "POST",
            headers: {},
          },
        };
        break;

      case "slack":
        newAction = {
          type: "slack",
          config: {
            channel: "recruitment",
          },
        };
        break;

      case "custom":
      default:
        newAction = {
          type: "custom",
          config: {
            customType: "",
            data: {},
          },
        };
    }

    form.setValue("actions", [...currentActions, newAction]);
  };

  const removeAction = (index: number) => {
    const currentActions = form.getValues("actions") || [];
    form.setValue(
      "actions",
      currentActions.filter((_: any, i: number) => i !== index)
    );
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case "send_email":
        return <Mail className="h-5 w-5 text-blue-600" />;
      case "webhook":
        return <Webhook className="h-5 w-5 text-purple-600" />;
      case "slack":
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case "custom":
      default:
        return <Code className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderActionContent = (action: any, index: number) => {
    switch (action.type) {
      case "send_email":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`actions.${index}.config.templateId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Template</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Delay</Label>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name={`actions.${index}.config.delay.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`actions.${index}.config.delay.unit`}
                  render={({ field }) => (
                    <FormItem className="w-36">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-xs text-gray-500">
                Delay is relative to the trigger time
              </p>
            </div>

            <FormField
              control={form.control}
              name={`actions.${index}.config.timezone`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timezoneOptions.map((timezone) => (
                        <SelectItem key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button variant="outline" size="sm">
                Test Send
              </Button>
            </div>
          </div>
        );

      case "webhook":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`actions.${index}.config.url`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`actions.${index}.config.method`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTTP Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {httpMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Headers</FormLabel>
              <div className="p-4 bg-gray-50 rounded-md shadow-none">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {`{
  "Content-Type": "application/json",
  "Authorization": "Bearer XXXX"
}`}
                </pre>
              </div>
            </div>

            <div>
              <FormLabel>Sample Payload</FormLabel>
              <div className="p-4 bg-gray-50 rounded-md shadow-none">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {`{
  "event": "${action.type}",
  "automationId": "...",
  "applicationId": "...",
  "data": {
    "candidateName": "...",
    "jobTitle": "..."
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        );

      case "slack":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`actions.${index}.config.channel`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slack Channel</FormLabel>
                  <FormControl>
                    <Input placeholder="recruitment" {...field} />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Enter the channel name without the # symbol
                  </p>
                </FormItem>
              )}
            />

            <div className="p-4 bg-gray-50 rounded-md shadow-none">
              <p className="text-sm mb-2">Message Format</p>
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {`New {{event}} for {{jobTitle}}:
Candidate: {{candidateName}}
Email: {{candidateEmail}}
Status: {{status}}`}
              </pre>
              <p className="text-xs mt-2 text-gray-500">
                You can use candidate and job variables in the message format.
              </p>
            </div>
          </div>
        );

      case "custom":
      default:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`actions.${index}.config.customType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Action Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="p-4 bg-gray-50 rounded-md shadow-none">
              <p className="text-sm mb-2">
                Custom actions require developer configuration.
              </p>
              <p className="text-xs text-gray-500">
                Contact your administrator to set up custom automation actions.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Actions</h3>

        {actions.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-md bg-gray-50 shadow-none">
            <p className="text-gray-500 mb-4">No actions added</p>
            <p className="text-gray-400 text-sm mb-6">
              Add an action to perform when the automation is triggered
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {actions.map((action: any, index: number) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-gray-100">
                      {getActionIcon(action.type)}
                    </div>
                    <h3 className="font-medium capitalize">
                      {action.type.replace("_", " ")}
                    </h3>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAction(index)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {renderActionContent(action, index)}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium mb-3">Add Action</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Tabs
              value={tempActionType}
              onValueChange={setTempActionType}
              className="flex-1"
            >
              <TabsList className="grid grid-cols-4 w-full bg-transparent p-0 rounded-none border-0 shadow-none">
                <TabsTrigger
                  value="send_email"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent text-gray-500 hover:text-gray-700 rounded-none transition-all duration-200 py-3 text-sm font-medium border-0 border-b-2 border-transparent shadow-none"
                >
                  Email
                </TabsTrigger>
                <TabsTrigger
                  value="webhook"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent text-gray-500 hover:text-gray-700 rounded-none transition-all duration-200 py-3 text-sm font-medium border-0 border-b-2 border-transparent shadow-none"
                >
                  Webhook
                </TabsTrigger>
                <TabsTrigger
                  value="slack"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent text-gray-500 hover:text-gray-700 rounded-none transition-all duration-200 py-3 text-sm font-medium border-0 border-b-2 border-transparent shadow-none"
                >
                  Slack
                </TabsTrigger>
                <TabsTrigger
                  value="custom"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none bg-transparent text-gray-500 hover:text-gray-700 rounded-none transition-all duration-200 py-3 text-sm font-medium border-0 border-b-2 border-transparent shadow-none"
                >
                  Custom
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              type="button"
              onClick={addAction}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
