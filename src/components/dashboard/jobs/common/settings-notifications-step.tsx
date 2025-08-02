"use client";

import { InputField } from "@/components/common/InputField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INPUT_TYPES } from "@/interfaces";
import { Plus, Settings, X, Zap } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

const staticAutomationRules = [
  {
    id: "rule1",
    title: "Send Notification on Status Change",
    trigger: "When candidate status changes to 'Interview Scheduled'",
    action: "Send email notification to the candidate with interview details",
  },
  {
    id: "rule2",
    title: "Auto Schedule Interview",
    trigger: "When candidate is moved to 'Shortlisted'",
    action:
      "Automatically schedule an interview and notify both candidate and interviewer",
  },
  {
    id: "rule3",
    title: "Send Rejection Email",
    trigger: "When candidate status changes to 'Rejected'",
    action: "Send a polite rejection email to the candidate",
  },
  {
    id: "rule4",
    title: "Assign Reviewer",
    trigger: "When candidate status changes to 'Under Review'",
    action:
      "Assign a recruiter or reviewer automatically based on availability",
  },
  {
    id: "rule5",
    title: "Move to Archive",
    trigger:
      "When candidate has been in 'On Hold' status for more than 30 days",
    action: "Automatically move the candidate to the archive",
  },
];

export function SettingsNotificationsStep() {
  const { watch, setValue } = useFormContext();
  const [newCustomField, setNewCustomField] = useState("");
  const [newAIRule, setNewAIRule] = useState("");

  // Get values from form context with proper fallbacks
  const enabledRules = watch("automation.enabledRules") || [];
  const aiRules = watch("automation.aiRules") || [];
  const customFields = watch("externalApplicationSetup.customFields") || [];

  const addCustomField = () => {
    if (newCustomField.trim()) {
      const updatedFields = [...customFields, newCustomField.trim()];
      setValue("externalApplicationSetup.customFields", updatedFields);
      setNewCustomField("");
    }
  };

  const removeCustomField = (index: number) => {
    const updatedFields = customFields.filter(
      (_: any, i: number) => i !== index
    );
    setValue("externalApplicationSetup.customFields", updatedFields);
  };

  // Toggle rule selection
  const toggleRule = (ruleId: string) => {
    const newEnabledRules = enabledRules.includes(ruleId)
      ? enabledRules.filter((id: string) => id !== ruleId)
      : [...enabledRules, ruleId];
    setValue("automation.enabledRules", newEnabledRules);
  };

  // Add new AI rule
  const addAIRule = () => {
    if (newAIRule.trim()) {
      const newRule = {
        id: `ai-rule-${Date.now()}`,
        text: newAIRule.trim(),
      };
      setValue("automation.aiRules", [...aiRules, newRule]);
      setNewAIRule("");
    }
  };

  // Remove AI rule
  const removeAIRule = (ruleId: string) => {
    const updatedRules = aiRules.filter((rule: any) => rule.id !== ruleId);
    setValue("automation.aiRules", updatedRules);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Settings & Automation
        </h2>
        <p className="text-gray-600 mt-1">
          Configure posting schedule and automation rules
        </p>
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Posting Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  name="startDate"
                  type={INPUT_TYPES.DATE}
                  label="Start Date"
                  placeholder="YYYY-MM-DD"
                  showIsRequired
                  description="When the job posting should go live"
                />
                <InputField
                  name="endDate"
                  type={INPUT_TYPES.DATE}
                  label="End Date"
                  placeholder="YYYY-MM-DD"
                  showIsRequired
                  description="When the job posting should be removed"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>External Application Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InputField
                name="externalApplicationSetup.redirectUrl"
                label="Custom Application URL"
                placeholder="https://yourcompany.com/apply"
                description="Optional: Redirect applicants to your own application page"
              />
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Custom Application Fields
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom field (e.g., Portfolio URL)"
                    value={newCustomField}
                    onChange={(e) => setNewCustomField(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), addCustomField())
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addCustomField}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </div>
                {customFields.length > 0 && (
                  <div className="mt-3 space-y-2 pl-2 border-l-2 border-blue-100">
                    <p className="text-xs text-gray-500">Custom fields:</p>
                    <div className="flex flex-wrap gap-2">
                      {customFields.map((field: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 text-sm py-1 px-2"
                        >
                          <span>{field}</span>
                          <X
                            className="w-3 h-3 cursor-pointer ml-1"
                            onClick={() => removeCustomField(index)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      These fields will appear on your application form.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                AI & Automation Rules
              </CardTitle>
              <p className="text-sm text-gray-600">
                Set up automated actions based on AI scores and status changes
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Rules Input */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">AI Scoring Rules</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Automatically categorize candidates based on AI match scores
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add AI rule (e.g., If AI score > 80, mark as 'Top Candidate')"
                      value={newAIRule}
                      onChange={(e) => setNewAIRule(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addAIRule())
                      }
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addAIRule}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Rule
                    </Button>
                  </div>
                  {aiRules.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {aiRules.map((rule: any) => (
                        <div
                          key={rule.id}
                          className="border rounded-lg p-4 flex items-start justify-between transition-colors bg-blue-50 border-blue-200"
                        >
                          <span className="text-sm flex-1">{rule.text}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeAIRule(rule.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Change Automation */}
              <Card>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <h3 className="font-medium">Status Change Automation</h3>
                    <p className="text-sm text-gray-600">
                      Select rules to send templates or notifications when
                      status changes
                    </p>
                  </div>
                  <div className="space-y-3 mt-4">
                    {staticAutomationRules.map((rule) => (
                      <div
                        key={rule.id}
                        className={`border rounded-lg p-4 flex items-start gap-4 transition-colors ${
                          enabledRules.includes(rule.id)
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="mt-1">
                          <Switch
                            checked={enabledRules.includes(rule.id)}
                            onCheckedChange={() => toggleRule(rule.id)}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium">{rule.title}</h4>
                            <Badge
                              variant={
                                enabledRules.includes(rule.id)
                                  ? "default"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {enabledRules.includes(rule.id)
                                ? "Active"
                                : "Inactive"}
                            </Badge>
                          </div>
                          <div className="mt-2 text-sm space-y-1">
                            <p className="flex">
                              <span className="font-medium w-16">Trigger:</span>
                              <span>{rule.trigger}</span>
                            </p>
                            <p className="flex">
                              <span className="font-medium w-16">Action:</span>
                              <span>{rule.action}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
