"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { JobFormData } from "@/interfaces";
import {
  AlertTriangle,
  Briefcase,
  Building,
  Calendar,
  CalendarClock,
  Clock,
  FileText,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AutomationReview } from "./AutomationReview";
import { AvailabilityReview } from "./AvailabilityReview";
import { ComplianceReview } from "./ComplianceReview";
import { HoursScheduleReview } from "./HoursScheduleReview";
import { JobAdReview } from "./JobAdReview";
import { PositionDetailsReview } from "./PositionDetailsReview";
import { PostingScheduleReview } from "./PostingScheduleReview";
import { QualificationsReview } from "./QualificationsReview";
import { ApplicantsSection } from "./applicants-section";

interface ReviewPublishStepProps {
  mode?: "review" | "edit" | "publish";
  onSave?: () => void;
  isSubmitting?: boolean;
  showHeader?: boolean;
  jobId?: string;
  jobViews?: number;
}

export function ReviewPublishStep({
  mode = "publish",
  onSave,
  isSubmitting = false,
  showHeader = true,
  jobId,
  jobViews = 0,
}: ReviewPublishStepProps) {
  const { watch } = useFormContext<JobFormData>();
  const formData = watch();
  const [activeTab, setActiveTab] = useState(
    mode === "review" ? "applicants" : "job-ad"
  );

  // Tab configuration
  const tabs = [
    { id: "job-ad", label: "Overview", icon: FileText },
    { id: "position", label: "Position", icon: Briefcase },
    { id: "schedule", label: "Schedule", icon: Clock },
    { id: "compliance", label: "Compliance", icon: Building },
    { id: "qualifications", label: "Qualifications", icon: Users },
    { id: "posting", label: "Posting", icon: Calendar },
    { id: "automation", label: "Automation", icon: Zap },
    { id: "availability", label: "Availability", icon: CalendarClock },
    ...(mode === "review"
      ? [{ id: "applicants", label: "Applicants", icon: UserCheck }]
      : []),
  ];

  const getValidationStatus = () => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Required field checks
    if (!formData.jobTitle) issues.push("Internal job title is required");
    if (!formData.jobBoardTitle) issues.push("Job board title is required");
    if (!formData.jobDescription) issues.push("Job description is required");
    if (!formData.positionsToHire)
      issues.push("Number of positions is required");
    if (!formData.payRate) issues.push("Pay rate is required");
    if (!formData.startDate) issues.push("Start date is required");
    if (!formData.endDate) issues.push("End date is required");
    if (!formData.availabilityId)
      issues.push(
        "Availability template selection is required for interview scheduling"
      );

    // Content quality checks
    if (formData.jobBoardTitle && formData.jobBoardTitle.length > 60) {
      warnings.push("Job board title is longer than recommended (60 chars)");
    }

    if (formData.jobDescription && formData.jobDescription.length < 100) {
      warnings.push("Job description is shorter than recommended (100+ chars)");
    }

    if (formData.jobDescription && formData.jobDescription.length > 3500) {
      warnings.push(
        "Job description is longer than recommended (3500 chars max)"
      );
    }

    // Custom questions validation
    if (
      formData.customQuestions?.some(
        (q) => q.type === "select" && (!q.options || q.options.length < 2)
      )
    ) {
      issues.push("Some multiple choice questions need at least 2 options");
    }

    return { issues, warnings };
  };

  const { issues, warnings } = getValidationStatus();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      {showHeader && (
        <div className="bg-white border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {mode === "edit"
                  ? "Review & Update Job"
                  : "Review & Publish Job"}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Review all job details before{" "}
                {mode === "edit" ? "updating" : "publishing"}
              </p>
            </div>
            {mode === "edit" && (
              <Button
                variant="outline"
                onClick={onSave}
                disabled={isSubmitting}
                size="lg"
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Validation Alerts */}
      {(issues.length > 0 || warnings.length > 0) && (
        <div className="space-y-4">
          {issues.length > 0 && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription>
                <div className="font-semibold mb-3 text-red-900">
                  Issues that must be resolved:
                </div>
                <ul className="list-disc list-inside space-y-2">
                  {issues.map((issue, index) => (
                    <li key={index} className="text-red-800">
                      {issue}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <AlertDescription>
                <div className="font-semibold mb-3 text-yellow-900">
                  Recommendations:
                </div>
                <ul className="list-disc list-inside space-y-2">
                  {warnings.map((warning, index) => (
                    <li key={index} className="text-yellow-800">
                      {warning}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Clean Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm mb-8 border border-gray-200">
        <nav className="flex space-x-8 px-8 pt-4 pb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 font-medium text-sm transition-all duration-200 cursor-pointer border-b-2 relative",
                  isActive
                    ? "border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:via-purple-500 after:to-pink-500"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                )}
              >
                <IconComponent
                  className={cn(
                    "w-4 h-4",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-none">
        <div className="p-8">
          {activeTab === "job-ad" && <JobAdReview formData={formData} />}
          {activeTab === "position" && (
            <PositionDetailsReview formData={formData} />
          )}
          {activeTab === "schedule" && (
            <HoursScheduleReview formData={formData} />
          )}
          {activeTab === "compliance" && (
            <ComplianceReview formData={formData} />
          )}
          {activeTab === "qualifications" && (
            <QualificationsReview formData={formData} />
          )}
          {activeTab === "posting" && (
            <PostingScheduleReview formData={formData} />
          )}
          {activeTab === "automation" && (
            <AutomationReview formData={formData} />
          )}
          {activeTab === "availability" && (
            <AvailabilityReview formData={formData} />
          )}
          {activeTab === "applicants" && mode === "review" && jobId && (
            <ApplicantsSection jobId={jobId} jobViews={jobViews} />
          )}
        </div>
      </div>
    </div>
  );
}
