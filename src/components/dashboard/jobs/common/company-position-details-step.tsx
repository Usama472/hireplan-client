"use client";

import { InputField } from "@/components/common/InputField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HIRING_TIMELINE } from "@/constants";
import { INPUT_TYPES } from "@/interfaces";
import {
  AlertCircle,
  Building,
  CheckCircle,
  DollarSign,
  Info,
} from "lucide-react";
import { useFormContext } from "react-hook-form";

export function CompanyPositionDetailsStep() {
  const { watch, formState } = useFormContext();
  const { errors } = formState;

  const payRateType = watch("payRate.type") || "range";
  const hiringTimeline = watch("hiringTimeline");
  const positionsToHire = watch("positionsToHire") || 1;
  const jobTitle = watch("jobTitle") || "";
  const jobBoardTitle = watch("jobBoardTitle") || "";
  const employmentType = watch("employmentType");

  const getTitleValidation = (title: string, isMobile = false) => {
    const maxLength = isMobile ? 35 : 60;
    const length = title.length;

    // Show validation error if it exists in the form state
    if (errors.jobTitle && !isMobile) {
      return { status: "error", message: "Job title is required" };
    }

    if (errors.jobBoardTitle && isMobile) {
      return { status: "error", message: "Job board title is required" };
    }

    if (length === 0)
      return { status: "neutral", message: "Enter a job title" };
    if (length > maxLength)
      return { status: "error", message: `Too long (${length}/${maxLength})` };
    if (length <= maxLength * 0.8)
      return {
        status: "success",
        message: `Good length (${length}/${maxLength})`,
      };
    return {
      status: "warning",
      message: `Getting long (${length}/${maxLength})`,
    };
  };

  const titleValidation = getTitleValidation(jobTitle);
  const boardTitleValidation = getTitleValidation(jobBoardTitle);
  const mobileValidation = getTitleValidation(jobBoardTitle, true);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getTimelinePriority = (timeline: string) => {
    const item = HIRING_TIMELINE.find((t) => t.value === timeline);
    return item?.priority || "medium";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const priority = getTimelinePriority(hiringTimeline);

  // Get job type guidance based on selected employment type
  const getJobTypeGuidance = () => {
    if (!employmentType) return null;

    const guidance = {
      "full-time": {
        title: "Full-time Employment",
        paymentGuidance:
          "Typically paid as salary ($50K-$70K/year) or hourly rate ($25-$35/hour). Usually includes benefits. Use salary ranges for professional roles.",
        typicalHours: "40 hrs/week",
        benefits: "Health insurance, PTO, retirement plans",
        bestPractices: [
          "Use salary ranges for growth potential",
          "Specify benefits inclusion",
        ],
      },
      "part-time": {
        title: "Part-time Employment",
        paymentGuidance:
          "Usually hourly rate ($18-$22/hour). Typically under 30 hours/week. Limited benefits. Weekly or bi-weekly pay.",
        typicalHours: "15-30 hrs/week",
        benefits: "Limited or pro-rated benefits",
        bestPractices: ["Specify weekly hours", "Use hourly rates for clarity"],
      },
      contract: {
        title: "Contract Work",
        paymentGuidance:
          "Paid as project fee ($5K-$10K) or hourly rate ($75-$125/hour). Payment upon completion or milestones. No benefits.",
        typicalHours: "Varies",
        benefits: "No benefits",
        bestPractices: [
          "Specify duration or hourly commitment",
          "Clarify payment terms",
        ],
      },
      temporary: {
        title: "Temporary Position",
        paymentGuidance:
          "Usually hourly ($20-$28/hour) for short-term assignments (weeks to months). No benefits. Weekly or bi-weekly pay.",
        typicalHours: "20-40 hrs/week",
        benefits: "No benefits typically",
        bestPractices: [
          "State duration clearly",
          "Mention conversion possibility",
        ],
      },
      internship: {
        title: "Internship",
        paymentGuidance:
          "Paid hourly ($15-$25/hour) or stipend ($3K-$5K/semester). Some unpaid for academic credit. Be transparent about compensation.",
        typicalHours: "15-30 hrs/week",
        benefits: "Academic credit possible",
        bestPractices: [
          "Specify paid/unpaid status",
          "Use hourly or stipend amounts",
        ],
      },
    };

    return guidance[employmentType as keyof typeof guidance] || null;
  };

  const jobTypeGuidance = getJobTypeGuidance();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Company & Position Details
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Define job titles, company, openings, compensation, and hiring
          timeline
        </p>
      </div>

      {/* Job Titles Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Internal Job Title */}
        <Card className="shadow-none border border-gray-200 rounded-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              Internal Job Title
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              For internal use - include location, department, or other
              identifiers <span className="text-red-500">*</span>
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <InputField
                name="jobTitle"
                placeholder="e.g., Senior Frontend Developer - SF Office"
              />
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon(titleValidation.status)}
                <span className={getStatusColor(titleValidation.status)}>
                  {titleValidation.message}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Job Board Title */}
        <Card className="shadow-none border border-gray-200 rounded-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">
              Job Board Title
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              Public-facing title that appears on job boards{" "}
              <span className="text-red-500">*</span>
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <InputField
                name="jobBoardTitle"
                placeholder="e.g., Senior Frontend Developer"
              />
              <div className="space-y-2">
                <div className="hidden items-center gap-2 text-sm md:flex">
                  {getStatusIcon(boardTitleValidation.status)}
                  <span className={getStatusColor(boardTitleValidation.status)}>
                    Desktop: {boardTitleValidation.message}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm md:hidden">
                  {getStatusIcon(mobileValidation.status)}
                  <span className={getStatusColor(mobileValidation.status)}>
                    Mobile: {mobileValidation.message}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 1st Card - Company & Position Info */}
        <Card className="border border-gray-200 shadow-none rounded-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-medium text-blue-600">
              <Building className="w-4 h-4 sm:w-5 sm:h-5" />
              Company & Position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 pt-0">
            {/* Company Selection */}
            {/* <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                Company for This Position
              </Label>
              <InputField
                name="company"
                type={INPUT_TYPES.SELECT}
                placeholder="Select company"
                selectOptions={[
                  { value: "company-1", label: "Acme Corporation" },
                  { value: "company-2", label: "TechStart Inc." },
                  { value: "company-3", label: "Global Solutions LLC" },
                  { value: "company-4", label: "Innovation Labs" },
                ]}
              />
            </div> */}

            {/* Number of Openings */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                Number of Openings
              </Label>
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
                <p className="text-xs text-red-600">
                  Maximum 10 openings allowed
                </p>
              )}
            </div>

            {/* Work Setting */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                Work Setting
              </Label>
              <InputField
                name="workSetting"
                placeholder="e.g., Office, Remote, Hospital, Hybrid"
              />
              <p className="text-xs text-gray-500">
                Describe the work environment (Office, Remote, Hospital, Hybrid,
                etc.)
              </p>
            </div>

            {/* Hiring Timeline */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">
                Hiring Timeline
              </Label>
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
                    Internal Priority:{" "}
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Badge>
                  {priority === "urgent" && (
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
        <Card className="border border-gray-200 shadow-none rounded-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-medium text-green-600">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              Compensation & Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 pt-0">
            {/* Pay Structure */}
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium">Pay</Label>

              {/* Pay Rate Type Selection */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs text-gray-600">Pay Structure</Label>
                <InputField
                  name="payRate.type"
                  type={INPUT_TYPES.SELECT}
                  placeholder="Select pay type"
                  selectOptions={[
                    { value: "range", label: "Range" },
                    { value: "starting-amount", label: "Starting Amount" },
                    { value: "maximum-amount", label: "Maximum Amount" },
                    { value: "exact-amount", label: "Exact Amount" },
                  ]}
                />
              </div>

              {/* Pay Amount Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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

                {(payRateType === "starting-amount" ||
                  payRateType === "maximum-amount" ||
                  payRateType === "exact-amount") && (
                  <div className="col-span-1 sm:col-span-2 space-y-1">
                    <Label className="text-xs text-gray-600">
                      {payRateType === "starting-amount"
                        ? "Starting Amount"
                        : payRateType === "maximum-amount"
                        ? "Maximum Amount"
                        : "Amount"}
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
              <div className="space-y-1.5 sm:space-y-2">
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
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm font-medium">Job Type</Label>
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

              {/* Job Type Guidance */}
              {jobTypeGuidance && (
                <div className="mt-2.5 p-2.5 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1.5">
                      <h4 className="text-xs sm:text-sm font-semibold text-blue-900">
                        {jobTypeGuidance.title}
                      </h4>
                      <p className="text-xs text-blue-800 leading-snug">
                        {jobTypeGuidance.paymentGuidance}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-blue-700 pt-1 border-t border-blue-200">
                        <span>
                          <span className="font-medium">Hours:</span>{" "}
                          {jobTypeGuidance.typicalHours}
                        </span>
                        <span>•</span>
                        <span>
                          <span className="font-medium">Benefits:</span>{" "}
                          {jobTypeGuidance.benefits}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
