"use client";

import { InputField } from "@/components/common/InputField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HIRING_TIMELINE } from "@/constants";
import { INPUT_TYPES } from "@/interfaces";
import {
  Building,
  DollarSign,
} from "lucide-react";
import { useFormContext } from "react-hook-form";

export function CompanyPositionDetailsStep() {
  const { watch } = useFormContext();
  
  const payRateType = watch("payRate.type") || "range";
  const hiringTimeline = watch("hiringTimeline");
  const positionsToHire = watch("positionsToHire") || 1;

  const getTimelinePriority = (timeline: string) => {
    const item = HIRING_TIMELINE.find(t => t.value === timeline);
    return item?.priority || "medium";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const priority = getTimelinePriority(hiringTimeline);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Company & Position Details
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Define company, openings, compensation, and hiring timeline
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1st Card - Company & Position Info */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <Building className="w-5 h-5" />
              Company & Position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Company for This Position</Label>
              <InputField
                name="company"
                type={INPUT_TYPES.SELECT}
                placeholder="Select company"
                selectOptions={[
                  { value: "company-1", label: "🔧 TODO: Pull from Settings - Acme Corporation" },
                  { value: "company-2", label: "🔧 TODO: Pull from Settings - TechStart Inc." },
                  { value: "company-3", label: "🔧 TODO: Pull from Settings - Global Solutions LLC" },
                  { value: "company-4", label: "🔧 TODO: Pull from Settings - Innovation Labs" },
                ]}
              />
            </div>

            {/* Number of Openings */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Number of Openings</Label>
              <div className="relative">
                <InputField
                  name="positionsToHire"
                  type={INPUT_TYPES.NUMBER}
                  placeholder="1"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-gray-500">1-10</span>
                </div>
              </div>
              {positionsToHire > 10 && (
                <p className="text-xs text-red-600">Maximum 10 openings allowed</p>
              )}
            </div>

            {/* Work Setting */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Work Setting</Label>
              <InputField
                name="workSetting"
                placeholder="e.g., Office, Remote, Hospital, Hybrid"
              />
              <p className="text-xs text-gray-500">
                Describe the work environment (Office, Remote, Hospital, Hybrid, etc.)
              </p>
            </div>

            {/* Hiring Timeline */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hiring Timeline</Label>
              <InputField
                name="hiringTimeline"
                type={INPUT_TYPES.SELECT}
                placeholder="Select timeline"
                selectOptions={[
                  { value: "1-3-days", label: "1-3 Days" },
                  { value: "3-7-days", label: "3-7 Days" },
                  { value: "1-2-weeks", label: "1-2 Weeks" },
                  { value: "2-4-weeks", label: "2-4 Weeks" },
                  { value: "more-than-4-weeks", label: "More than 4 Weeks" },
                ]}
              />
              {hiringTimeline && (
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${getPriorityColor(priority)}`}>
                    Internal Priority: {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                  {(priority === "urgent") && (
                    <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                      Will show urgent label on career page
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2nd Card - Pay & Job Type */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-green-600">
              <DollarSign className="w-5 h-5" />
              Compensation & Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pay Structure */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Pay</Label>
              
              {/* Pay Rate Type Selection */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Pay Structure</Label>
                <InputField
                  name="payRate.type"
                  type={INPUT_TYPES.SELECT}
                  placeholder="Select pay type"
                  selectOptions={[
                    { value: "range", label: "Range (Write in Min. & Max.)" },
                    { value: "starting-amount", label: "Starting Amount (Write in Amount)" },
                    { value: "maximum-amount", label: "Maximum Amount (Write in Amount)" },
                    { value: "exact-amount", label: "Exact Amount (Write in Amount)" },
                  ]}
                />
              </div>

              {/* Pay Amount Inputs */}
              <div className="grid grid-cols-2 gap-3">
                {payRateType === "range" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Minimum</Label>
                      <InputField
                        name="payRate.min"
                        type={INPUT_TYPES.NUMBER}
                        placeholder="23.50"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Maximum</Label>
                      <InputField
                        name="payRate.max"
                        type={INPUT_TYPES.NUMBER}
                        placeholder="29.50"
                      />
                    </div>
                  </>
                )}
                
                {(payRateType === "starting-amount" || payRateType === "maximum-amount" || payRateType === "exact-amount") && (
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-gray-600">
                      {payRateType === "starting-amount" ? "Starting Amount" :
                       payRateType === "maximum-amount" ? "Maximum Amount" : "Amount"}
                    </Label>
                    <InputField
                      name="payRate.amount"
                      type={INPUT_TYPES.NUMBER}
                      placeholder="25.00"
                    />
                  </div>
                )}
              </div>

              {/* Pay Period */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Pay Period</Label>
                <InputField
                  name="payRate.period"
                  type={INPUT_TYPES.SELECT}
                  placeholder="Select period"
                  selectOptions={[
                    { value: "per-hour", label: "Per Hour" },
                    { value: "per-day", label: "Per Day" },
                    { value: "per-week", label: "Per Week" },
                    { value: "per-month", label: "Per Month" },
                    { value: "per-year", label: "Per Year" },
                  ]}
                />
              </div>

              {/* Example Display */}
              {payRateType === "range" && (
                <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                  Example: Range $23.50 – $29.50 Per Hour
                </div>
              )}
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Job Type</Label>
              <InputField
                name="employmentType"
                type={INPUT_TYPES.SELECT}
                placeholder="Select job type"
                selectOptions={[
                  { value: "full-time", label: "Full-time" },
                  { value: "part-time", label: "Part-time" },
                  { value: "contract", label: "Contract" },
                  { value: "temporary", label: "Temporary" },
                  { value: "internship", label: "Internship" },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}