"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomQuestion, JobFormData } from "@/interfaces";
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  CheckSquare,
  Eye,
  HelpCircle,
  List,
  MapPin,
  Type,
} from "lucide-react";
import { useFormContext } from "react-hook-form";

interface ReviewPublishStepProps {
  isEditMode?: boolean;
}

const QUESTION_TYPE_INFO = {
  boolean: {
    label: "Yes/No Question",
    icon: CheckSquare,
    color: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-600",
  },
  string: {
    label: "Text Input",
    icon: Type,
    color: "bg-blue-50 border-blue-200 text-blue-700",
    iconColor: "text-blue-600",
  },
  select: {
    label: "Multiple Choice",
    icon: List,
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconColor: "text-purple-600",
  },
};

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

    // Content quality checks
    if (formData.jobBoardTitle && formData.jobBoardTitle.length > 60) {
      warnings.push("Job board title is longer than recommended (60 chars)");
    }

    if (
      formData.jobDescription &&
      (formData.jobDescription.length < 700 ||
        formData.jobDescription.length > 2000)
    ) {
      warnings.push(
        "Job description length is outside optimal range (700-2000 chars)"
      );
    }

    return { issues, warnings };
  };

  const { issues, warnings } = getValidationStatus();
  const canPublish = issues.length === 0;

  const formatPayRate = () => {
    if (!formData.payRate) return "Not specified";

    if (formData.payRate.type === "fixed") {
      return `${formData.payRate.amount} $ ${
        formData.payType === "hourly" ? "/ hour" : "/ year"
      }`;
    } else {
      return `$${formData.payRate.min} - $${formData.payRate.max} ${
        formData.payType === "hourly" ? "/hour" : "/year"
      }`;
    }
  };

  const getQuestionTypeInfo = (type: string) => {
    return QUESTION_TYPE_INFO[type as keyof typeof QUESTION_TYPE_INFO];
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditMode ? "Review & Update" : "Review & Publish"}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditMode
            ? "Review your changes before updating the job posting"
            : "Review your job posting before publishing"}
        </p>
      </div>

      {/* Validation Status */}
      <Card
        className={`border-2 ${
          canPublish
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {canPublish ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <h3
                className={`font-semibold ${
                  canPublish ? "text-green-900" : "text-red-900"
                }`}
              >
                {canPublish
                  ? isEditMode
                    ? "Ready to Update"
                    : "Ready to Publish"
                  : "Issues Found"}
              </h3>
              <p
                className={`text-sm ${
                  canPublish ? "text-green-700" : "text-red-700"
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
            </div>
          </div>

          {issues.length > 0 && (
            <div className="mt-4 space-y-1">
              <h4 className="font-medium text-red-900">Issues to resolve:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="mt-4 space-y-1">
              <h4 className="font-medium text-yellow-900">Recommendations:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="columns-1 md:columns-2 gap-4 md:gap-6 space-y-0">
        {/* Job Preview */}
        <Card className="break-inside-avoid mb-4 md:mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {isEditMode ? "Updated Job Preview" : "Job Posting Preview"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {formData.jobBoardTitle || "Job Title"}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  <span>Your Company</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {formData.jobLocation?.city}, {formData.jobLocation?.state}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  {formData.employmentType?.replace("-", " ")}
                </Badge>
                <Badge variant="outline">{formData.workplaceType}</Badge>
                {formData.jobStatus && (
                  <Badge variant="outline" className="capitalize">
                    {formData.jobStatus} Priority
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-green-600">
                <span className="font-medium">{formatPayRate()}</span>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {formData.jobDescription ||
                    "Job description will appear here..."}
                </p>
              </div>

              {formData.jobRequirements &&
                formData.jobRequirements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Requirements:
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {formData.jobRequirements.map((req, index) => (
                        <li key={index}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Job Details Summary */}
        <Card className="break-inside-avoid mb-4 md:mb-6">
          <CardHeader>
            <CardTitle>
              {isEditMode ? "Updated Job Details" : "Job Details Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Internal Title:</span>
                <p className="font-medium">{formData.jobTitle || "Not set"}</p>
              </div>
              <div>
                <span className="text-gray-600">Department:</span>
                <p className="font-medium">
                  {formData.department || "Not set"}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Employment Type:</span>
                <p className="font-medium capitalize">
                  {formData.employmentType?.replace("-", " ") || "Not set"}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Workplace:</span>
                <p className="font-medium capitalize">
                  {formData.workplaceType || "Not set"}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Education:</span>
                <p className="font-medium">
                  {formData.educationRequirement || "Not set"}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Positions:</span>
                <p className="font-medium">{formData.positionsToHire || 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Settings */}
        <Card className="break-inside-avoid mb-4 md:mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Schedule & Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-600">Start Date:</span>
              <span className="font-medium">
                {formData.startDate
                  ? new Date(formData.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not set"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-600">End Date:</span>
              <span className="font-medium">
                {formData.endDate
                  ? new Date(formData.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not set"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Content Statistics */}
        <Card className="break-inside-avoid mb-4 md:mb-6">
          <CardHeader>
            <CardTitle>Content Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-600">Job Board Title:</span>
              <Badge variant="outline">
                {formData.jobBoardTitle?.length || 0} chars
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-600">Description:</span>
              <Badge variant="outline">
                {formData.jobDescription?.length || 0} chars
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-600">Requirements:</span>
              <Badge variant="outline">
                {formData.jobRequirements?.length || 0} items
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
              <span className="text-gray-600">Custom Questions:</span>
              <Badge variant="outline">
                {customQuestions.length} questions
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Custom Questions Summary */}
        {customQuestions.length > 0 && (
          <Card className="break-inside-avoid mb-4 md:mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Custom Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {customQuestions.filter((q) => q.required).length} required
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-gray-50 text-gray-700 border-gray-200"
                >
                  {customQuestions.filter((q) => !q.required).length} optional
                </Badge>
              </div>

              <div className="space-y-3">
                {customQuestions.map((question, index) => {
                  const typeInfo = getQuestionTypeInfo(question.type);
                  const Icon = typeInfo?.icon || HelpCircle;

                  return (
                    <div
                      key={question.id}
                      className="p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              typeInfo?.color || "bg-gray-100"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 ${
                                typeInfo?.iconColor || "text-gray-600"
                              }`}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            #{index + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {typeInfo?.label || question.type}
                            </Badge>
                            {question.required && (
                              <Badge
                                variant="destructive"
                                className="text-xs text-white"
                              >
                                Required
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm font-medium text-gray-900 mb-2">
                            {question.question}
                          </p>

                          {question.type === "select" && question.options && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500">Options:</p>
                              <div className="flex flex-wrap gap-1">
                                {question.options
                                  .slice(0, 3)
                                  .map((option, optIndex) => (
                                    <Badge
                                      key={optIndex}
                                      variant="outline"
                                      className="text-xs bg-white"
                                    >
                                      {option}
                                    </Badge>
                                  ))}
                                {question.options.length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-white"
                                  >
                                    +{question.options.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {question.placeholder &&
                            question.type === "string" && (
                              <p className="text-xs text-gray-500 mt-1">
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

        {/* External Application Setup */}
        {(formData.externalApplicationSetup?.customFields?.length > 0 ||
          formData.externalApplicationSetup?.redirectUrl) && (
          <Card className="break-inside-avoid mb-4 md:mb-6">
            <CardHeader>
              <CardTitle>Application Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.externalApplicationSetup?.redirectUrl && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Custom Application URL
                  </h4>
                  <div className="p-3 bg-gray-50 rounded border">
                    <a
                      href={formData.externalApplicationSetup.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                    >
                      {formData.externalApplicationSetup.redirectUrl}
                    </a>
                  </div>
                </div>
              )}

              {formData.externalApplicationSetup?.customFields?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Custom Fields
                  </h4>
                  <ul className="space-y-1">
                    {formData.externalApplicationSetup.customFields.map(
                      (field, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {field}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
