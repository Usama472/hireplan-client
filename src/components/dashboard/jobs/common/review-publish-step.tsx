"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QUESTION_TYPE_INFO } from "@/constants";
import type { CustomQuestion, JobFormData } from "@/interfaces";
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  HelpCircle,
  MapPin,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import { useFormContext } from "react-hook-form";

interface ReviewPublishStepProps {
  isEditMode?: boolean;
}

export function ReviewPublishStep({
  isEditMode = false,
}: ReviewPublishStepProps) {
  const { watch } = useFormContext<JobFormData>();
  const formData = watch();
  const customQuestions: CustomQuestion[] = watch("customQuestions") || [];

  const getValidationStatus = () => {
    const issues = [];
    const warnings = [];

    // Required field checks
    if (!formData.jobTitle) issues.push("Internal job title is required");
    if (!formData.jobBoardTitle) issues.push("Job board title is required");
    if (!formData.jobDescription) issues.push("Job description is required");
    if (!formData.jobLocation?.city) issues.push("Job location is required");
    if (!formData.payRate?.amount && !formData.payRate?.min)
      issues.push("Pay rate is required");
    if (!formData.department) issues.push("Department is required");

    // Content quality checks
    if (formData.jobBoardTitle && formData.jobBoardTitle.length > 60) {
      warnings.push("Job board title is longer than recommended (60 chars)");
    }

    if (
      formData.jobDescription &&
      (formData.jobDescription.length < 100 ||
        formData.jobDescription.length > 2000)
    ) {
      warnings.push(
        "Job description length is outside optimal range (100-2000 chars)"
      );
    }

    // Custom questions validation
    if (
      customQuestions.some(
        (q) => q.type === "select" && (!q.options || q.options.length < 2)
      )
    ) {
      issues.push("Some multiple choice questions need at least 2 options");
    }

    return { issues, warnings };
  };

  const { issues, warnings } = getValidationStatus();
  const canPublish = issues.length === 0;

  const formatPayRate = () => {
    if (!formData.payRate) return "Not specified";

    const currency = "$";
    const period = formData.payType === "hourly" ? "/hour" : "/year";

    if (formData.payRate.type === "fixed") {
      return `${currency}${formData.payRate.amount?.toLocaleString()} ${period}`;
    } else {
      return `${currency}${formData.payRate.min?.toLocaleString()} - ${currency}${formData.payRate.max?.toLocaleString()} ${period}`;
    }
  };

  const getQuestionTypeInfo = (type: string) => {
    return QUESTION_TYPE_INFO[type as keyof typeof QUESTION_TYPE_INFO];
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "Not set";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDuration = () => {
    if (!formData.startDate || !formData.endDate) return null;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  const getScoringTotal = () => {
    if (!formData.automation?.scoringWeights) return 0;
    return Object.values(formData.automation.scoringWeights).reduce(
      (sum, weight) => sum + weight,
      0
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className=" pb-6 border-b border-slate-200">
        <h2 className="text-3xl font-bold text-slate-900">
          {isEditMode ? "Review & Update" : "Review & Publish"}
        </h2>
        <p className="text-slate-600 mt-2 text-lg">
          {isEditMode
            ? "Review your changes before updating the job posting"
            : "Review your job posting before publishing"}
        </p>
      </div>

      {/* Validation Status */}
      <Card
        className={`border-2 ${
          canPublish
            ? "border-emerald-200 bg-emerald-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                canPublish ? "bg-emerald-100" : "bg-red-100"
              }`}
            >
              {canPublish ? (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <h3
                className={`text-xl font-semibold ${
                  canPublish ? "text-emerald-900" : "text-red-900"
                }`}
              >
                {canPublish
                  ? isEditMode
                    ? "Ready to Update"
                    : "Ready to Publish"
                  : "Issues Found"}
              </h3>
              <p
                className={`text-sm mt-1 ${
                  canPublish ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {canPublish
                  ? isEditMode
                    ? "Your job posting changes meet all requirements and are ready to update"
                    : "Your job posting meets all requirements and is ready to publish"
                  : `${issues.length} issue${
                      issues.length > 1 ? "s" : ""
                    } must be resolved before ${
                      isEditMode ? "updating" : "publishing"
                    }`}
              </p>

              {issues.length > 0 && (
                <div className="mt-4 p-4 bg-red-100 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">
                    Issues to resolve:
                  </h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    {issues.map((issue, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-2">
                    Recommendations:
                  </h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {warnings.map((warning, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Job Preview */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-blue-600" />
                </div>
                {isEditMode ? "Updated Job Preview" : "Job Posting Preview"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {formData.jobBoardTitle || "Job Title"}
                </h3>

                <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>Your Company</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {formData.jobLocation?.city},{" "}
                      {formData.jobLocation?.state}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-slate-100 text-slate-700 border-slate-300">
                    {formData.employmentType?.replace("-", " ")}
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-700 border-slate-300">
                    {formData.workplaceType}
                  </Badge>
                  {formData.jobStatus && (
                    <Badge
                      className={`capitalize ${
                        formData.jobStatus === "high"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : formData.jobStatus === "medium"
                          ? "bg-amber-100 text-amber-700 border-amber-300"
                          : "bg-green-100 text-green-700 border-green-300"
                      }`}
                    >
                      {formData.jobStatus} Priority
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-emerald-600 mb-6">
                  <span className="text-lg font-semibold">
                    {formatPayRate()}
                  </span>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {formData.jobDescription ||
                      "Job description will appear here..."}
                  </p>
                </div>

                {formData.jobRequirements &&
                  formData.jobRequirements.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-slate-900 mb-3">
                        Requirements:
                      </h4>
                      <ul className="space-y-2">
                        {formData.jobRequirements.map((req, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-slate-700"
                          >
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Custom Questions */}
          {customQuestions.length > 0 && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  Custom Questions
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                    {customQuestions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-red-100 text-red-700 border-red-300">
                    {customQuestions.filter((q) => q.required).length} required
                  </Badge>
                  <Badge className="bg-slate-100 text-slate-700 border-slate-300">
                    {customQuestions.filter((q) => !q.required).length} optional
                  </Badge>
                </div>

                <div className="space-y-4">
                  {customQuestions.map((question, index) => {
                    const typeInfo = getQuestionTypeInfo(question.type);
                    const Icon = typeInfo?.icon || HelpCircle;

                    return (
                      <div
                        key={question.id}
                        className="p-4 border border-slate-200 rounded-xl bg-slate-50"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-2 flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                typeInfo?.color || "bg-slate-100"
                              }`}
                            >
                              <Icon
                                className={`w-5 h-5 ${
                                  typeInfo?.iconColor || "text-slate-600"
                                }`}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                              #{index + 1}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge
                                className={`text-xs ${
                                  typeInfo?.color ||
                                  "bg-slate-100 text-slate-700"
                                } border-0`}
                              >
                                {typeInfo?.label || question.type}
                              </Badge>
                              {question.required && (
                                <Badge className="text-xs bg-red-100 text-red-700 border-0">
                                  Required
                                </Badge>
                              )}
                            </div>

                            <h4 className="font-medium text-slate-900 mb-3 leading-relaxed">
                              {question.question}
                            </h4>

                            {question.type === "select" && question.options && (
                              <div>
                                <p className="text-xs text-slate-500 mb-2">
                                  Options:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {question.options
                                    .slice(0, 3)
                                    .map((option, optIndex) => (
                                      <Badge
                                        key={optIndex}
                                        variant="outline"
                                        className="text-xs bg-white border-slate-300"
                                      >
                                        {option}
                                      </Badge>
                                    ))}
                                  {question.options.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-white border-slate-300"
                                    >
                                      +{question.options.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {question.placeholder &&
                              question.type === "string" && (
                                <p className="text-xs text-slate-500 mt-2">
                                  Placeholder: "{question.placeholder}"
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Job Details Summary */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                {isEditMode ? "Updated Job Details" : "Job Details Summary"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">
                    Internal Title:
                  </span>
                  <span className="font-medium text-slate-900">
                    {formData.jobTitle || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Department:</span>
                  <span className="font-medium text-slate-900">
                    {formData.department || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">
                    Employment Type:
                  </span>
                  <span className="font-medium text-slate-900 capitalize">
                    {formData.employmentType?.replace("-", " ") || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Workplace:</span>
                  <span className="font-medium text-slate-900 capitalize">
                    {formData.workplaceType || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Education:</span>
                  <span className="font-medium text-slate-900">
                    {formData.educationRequirement || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Positions:</span>
                  <span className="font-medium text-slate-900">
                    {formData.positionsToHire || 1}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Timeline */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                Schedule & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Start Date:</span>
                <span className="font-medium text-slate-900">
                  {formatDate(formData.startDate)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">End Date:</span>
                <span className="font-medium text-slate-900">
                  {formatDate(formData.endDate)}
                </span>
              </div>
              {getDuration() && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Duration:</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-900">
                      {getDuration()} days
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Automation Settings */}
          {formData.automation && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  AI Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">
                    Acceptance Threshold:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-600">
                      {formData.automation.acceptanceThreshold || 70}%
                    </span>
                    <Badge
                      className={`text-xs ${
                        (formData.automation.acceptanceThreshold || 70) >= 80
                          ? "bg-red-100 text-red-700"
                          : (formData.automation.acceptanceThreshold || 70) >=
                            60
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {(formData.automation.acceptanceThreshold || 70) >= 80
                        ? "High"
                        : (formData.automation.acceptanceThreshold || 70) >= 60
                        ? "Medium"
                        : "Low"}
                    </Badge>
                  </div>
                </div>

                {formData.automation.scoringWeights && (
                  <div>
                    <div className="flex justify-between items-center py-2 mb-3">
                      <span className="text-sm text-slate-600">
                        Scoring Weights:
                      </span>
                      <span className="font-medium text-slate-900">
                        {getScoringTotal()}%
                      </span>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(formData.automation.scoringWeights).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <span className="text-xs text-slate-600 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <div className="flex items-center gap-2">
                              <Progress value={value} className="h-2 w-16" />
                              <span className="text-xs font-medium text-slate-900 min-w-[2rem]">
                                {value}%
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Active Rules:</span>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                    {formData.automation.enabledRules?.length || 0} enabled
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Statistics */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Target className="w-4 h-4 text-amber-600" />
                </div>
                Content Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {formData.jobBoardTitle?.length || 0}
                  </div>
                  <div className="text-xs text-slate-600">Title Characters</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {formData.jobDescription?.length || 0}
                  </div>
                  <div className="text-xs text-slate-600">
                    Description Characters
                  </div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {formData.jobRequirements?.length || 0}
                  </div>
                  <div className="text-xs text-slate-600">Requirements</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {customQuestions.length}
                  </div>
                  <div className="text-xs text-slate-600">Custom Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Application Setup */}
          {(formData.externalApplicationSetup?.customFields?.length > 0 ||
            formData.externalApplicationSetup?.redirectUrl) && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-indigo-600" />
                  </div>
                  Application Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.externalApplicationSetup?.redirectUrl && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">
                      Custom Application URL
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <a
                        href={formData.externalApplicationSetup.redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-sm break-all"
                      >
                        {formData.externalApplicationSetup.redirectUrl}
                      </a>
                    </div>
                  </div>
                )}

                {formData.externalApplicationSetup?.customFields?.length >
                  0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">
                      Custom Fields (
                      {formData.externalApplicationSetup.customFields.length})
                    </h4>
                    <div className="space-y-2">
                      {formData.externalApplicationSetup.customFields.map(
                        (field, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-slate-400 rounded-full" />
                            <span className="text-sm text-slate-700">
                              {field}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
