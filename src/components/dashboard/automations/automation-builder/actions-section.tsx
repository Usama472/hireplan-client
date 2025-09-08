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
import { Code, Mail, MessageSquare, Plus, Trash2, Webhook, Briefcase, UserCheck, Brain } from "lucide-react";
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

      case "update_job_status":
        newAction = {
          type: "update_job_status",
          config: {
            status: "active",
          },
        };
        break;

      case "assign_recruiter":
        newAction = {
          type: "assign_recruiter",
          config: {
            recruiterId: "",
            notify: true,
          },
        };
        break;

      case "ai_follow_up":
        newAction = {
          type: "ai_follow_up",
          config: {
            followUpType: "candidate_interview",
            questions: [
              "How did you feel about the interview process?",
              "What questions do you have about the role?",
              "What is your timeline for making a decision?"
            ],
            autoSend: false,
            delay: {
              value: 1,
              unit: "days"
            }
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
      case "update_job_status":
        return <Briefcase className="h-5 w-5 text-orange-600" />;
      case "assign_recruiter":
        return <UserCheck className="h-5 w-5 text-indigo-600" />;
      case "ai_follow_up":
        return <Brain className="h-5 w-5 text-purple-600" />;
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

      case "update_job_status":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`actions.${index}.config.status`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="p-4 bg-gray-50 rounded-md shadow-none">
              <p className="text-sm mb-2">Job Status Update</p>
              <p className="text-xs text-gray-500">
                This action will automatically update the job posting status when the automation is triggered.
              </p>
            </div>
          </div>
        );

      case "assign_recruiter":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`actions.${index}.config.recruiterId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Recruiter</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter recruiter email or ID" {...field} />
                  </FormControl>
                  <p className="text-xs text-gray-500">
                    Enter the recruiter's email address or user ID
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`actions.${index}.config.notify`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel className="text-sm font-medium">
                    Send notification email
                  </FormLabel>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="p-4 bg-gray-50 rounded-md shadow-none">
              <p className="text-sm mb-2">Recruiter Assignment</p>
              <p className="text-xs text-gray-500">
                This action will assign the job or application to the specified recruiter and optionally send them a notification.
              </p>
            </div>
          </div>
        );

      case "ai_follow_up":
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name={`actions.${index}.config.followUpType`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select follow-up type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="candidate_interview">Post-Interview Follow-up</SelectItem>
                      <SelectItem value="application_status">Application Status Check</SelectItem>
                      <SelectItem value="job_interest">Job Interest Survey</SelectItem>
                      <SelectItem value="feedback_request">Feedback Request</SelectItem>
                      <SelectItem value="custom">Custom Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>AI Follow-up Questions</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                >
                  + Add Question
                </Button>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input 
                    placeholder="Question 1: How did you feel about the interview process?"
                    className="text-sm pr-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </Button>
                </div>
                <div className="relative">
                  <Input 
                    placeholder="Question 2: What questions do you have about the role?"
                    className="text-sm pr-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </Button>
                </div>
                <div className="relative">
                  <Input 
                    placeholder="Question 3: What is your timeline for making a decision?"
                    className="text-sm pr-8"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500">AI will generate personalized questions based on the context and your selections</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Send Delay</FormLabel>
                <div className="flex items-center gap-2">
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
                      <FormItem className="w-20">
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
                            <SelectItem value="hours">Hours</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name={`actions.${index}.config.autoSend`}
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-sm font-medium">
                        Auto-send follow-up
                      </FormLabel>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </FormControl>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      If unchecked, generates draft for review
                    </p>
                  </FormItem>
                )}
              />
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-md border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-medium text-purple-800">AI Follow-up</p>
              </div>
              <p className="text-xs text-purple-700">
                AI will automatically generate personalized follow-up emails with your custom questions, tailored to each candidate's context and interview experience.
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
              <TabsList className="flex flex-wrap justify-start w-full bg-gray-100 p-1 rounded-lg border border-gray-200">
                <TabsTrigger
                  value="send_email"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Email
                </TabsTrigger>
                <TabsTrigger
                  value="webhook"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Webhook
                </TabsTrigger>
                <TabsTrigger
                  value="slack"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Slack
                </TabsTrigger>
                <TabsTrigger
                  value="update_job_status"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Job Status
                </TabsTrigger>
                <TabsTrigger
                  value="assign_recruiter"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Assign
                </TabsTrigger>
                <TabsTrigger
                  value="ai_follow_up"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  AI Follow-up
                </TabsTrigger>
                <TabsTrigger
                  value="custom"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
                >
                  Custom
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              type="button"
              onClick={addAction}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-blue-600/25 transition-all duration-300 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Action
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
