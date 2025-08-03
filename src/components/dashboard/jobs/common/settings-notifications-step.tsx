"use client";

import { InputField } from "@/components/common/InputField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INPUT_TYPES } from "@/interfaces";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Plus,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

const scoringCriteria = [
  { key: "skillsMatch", label: "Skills Match", icon: "🎯" },
  { key: "experienceRelevance", label: "Experience", icon: "💼" },
  { key: "educationQualifications", label: "Education", icon: "🎓" },
  { key: "culturalJobFit", label: "Culture Fit", icon: "🤝" },
];

export function SettingsNotificationsStep() {
  const { watch, setValue } = useFormContext();
  const [newCustomField, setNewCustomField] = useState("");

  const enabledRules = watch("automation.enabledRules") || [];
  const customFields = watch("externalApplicationSetup.customFields") || [];
  const acceptanceThreshold = watch("automation.acceptanceThreshold") || 70;
  const scoringWeights = watch("automation.scoringWeights") || {
    skillsMatch: 0,
    experienceRelevance: 0,
    educationQualifications: 0,
    culturalJobFit: 0,
  };

  const totalPercentage = Object.values(scoringWeights).reduce(
    (sum: number, value: any) => sum + (Number(value) || 0),
    0
  );
  const isValidTotal = totalPercentage <= 100;

  const addCustomField = () => {
    if (newCustomField.trim()) {
      setValue("externalApplicationSetup.customFields", [
        ...customFields,
        newCustomField.trim(),
      ]);
      setNewCustomField("");
    }
  };

  const removeCustomField = (index: number) => {
    setValue(
      "externalApplicationSetup.customFields",
      customFields.filter((_: any, i: number) => i !== index)
    );
  };

  const toggleRule = (ruleId: string) => {
    const newEnabledRules = enabledRules.includes(ruleId)
      ? enabledRules.filter((id: string) => id !== ruleId)
      : [...enabledRules, ruleId];
    setValue("automation.enabledRules", newEnabledRules);
  };

  const updateScoringWeight = (criteriaKey: string, value: number[]) => {
    setValue(`automation.scoringWeights.${criteriaKey}`, value[0]);
  };

  const resetWeights = () => {
    setValue("automation.scoringWeights", {
      skillsMatch: 0,
      experienceRelevance: 0,
      educationQualifications: 0,
      culturalJobFit: 0,
    });
  };

  const updateAcceptanceThreshold = (value: number[]) => {
    setValue("automation.acceptanceThreshold", value[0]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Settings & Automation
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure posting schedule and automation rules
        </p>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          {/* Posting Schedule */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">Posting Schedule</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Start Date</Label>
                <InputField
                  name="startDate"
                  type={INPUT_TYPES.DATE}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">End Date</Label>
                <InputField
                  name="endDate"
                  type={INPUT_TYPES.DATE}
                  placeholder="Select end date"
                />
              </div>
            </div>
          </div>

          {/* Application Setup */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Application Setup</h3>

            <div className="space-y-2">
              <Label className="text-sm">Custom Application URL</Label>
              <InputField
                name="externalApplicationSetup.redirectUrl"
                placeholder="https://yourcompany.com/apply"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm">Additional Fields</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Portfolio URL"
                  value={newCustomField}
                  onChange={(e) => setNewCustomField(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCustomField())
                  }
                  className="text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addCustomField}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {customFields.length > 0 && (
                <div className="space-y-2">
                  {customFields.map((field: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                    >
                      <span>{field}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomField(index)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          {/* Acceptance Threshold */}

          {/* AI Scoring */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">
                  AI Scoring Weights
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    isValidTotal ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {totalPercentage}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetWeights}
                >
                  Reset
                </Button>
              </div>
            </div>

            <Progress value={Math.min(totalPercentage, 100)} className="h-2" />

            {!isValidTotal && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Total cannot exceed 100%
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4">
              {scoringCriteria.map((criteria) => (
                <div
                  key={criteria.key}
                  className="p-4 bg-gray-50 rounded-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{criteria.icon}</span>
                      <Label className="text-sm font-medium">
                        {criteria.label}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-blue-600 min-w-[3rem] text-right">
                        {scoringWeights[criteria.key] || 0}%
                      </span>
                      <Progress
                        value={scoringWeights[criteria.key] || 0}
                        className="h-2 w-16"
                      />
                    </div>
                  </div>

                  <Slider
                    value={[scoringWeights[criteria.key] || 0]}
                    onValueChange={(value) =>
                      updateScoringWeight(criteria.key, value)
                    }
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">
                Acceptance Threshold
              </h3>
            </div>

            <div className="p-4 bg-gray-50 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">
                  Minimum score for auto-acceptance
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-blue-600">
                    {acceptanceThreshold}%
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {acceptanceThreshold >= 80
                      ? "High"
                      : acceptanceThreshold >= 60
                      ? "Medium"
                      : "Low"}
                  </Badge>
                </div>
              </div>

              <Slider
                value={[acceptanceThreshold]}
                onValueChange={updateAcceptanceThreshold}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>0% (Accept all)</span>
                <span>50% (Balanced)</span>
                <span>100% (Perfect only)</span>
              </div>

              <p className="text-xs text-gray-600">
                Candidates scoring {acceptanceThreshold}% or higher will be
                automatically moved to the next stage
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Notifications</h3>

            <div className="space-y-3">
              {[
                {
                  id: "accept-notification",
                  label: "Accept Notification",
                  desc: "Send congratulatory email",
                  icon: CheckCircle,
                  color: "text-green-600",
                },
                {
                  id: "rejection-notification",
                  label: "Rejection Notification",
                  desc: "Send polite rejection email",
                  icon: X,
                  color: "text-red-600",
                },
                {
                  id: "interview-notification",
                  label: "Interview Scheduling",
                  desc: "Auto schedule interviews",
                  icon: Calendar,
                  color: "text-blue-600",
                },
              ].map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <rule.icon className={`w-4 h-4 ${rule.color}`} />
                    <div>
                      <p className="text-sm font-medium">{rule.label}</p>
                      <p className="text-xs text-gray-600">{rule.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {enabledRules.includes(rule.id) && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                    <Switch
                      checked={enabledRules.includes(rule.id)}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
