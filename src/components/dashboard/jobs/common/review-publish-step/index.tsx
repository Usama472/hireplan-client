"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { JobFormData } from "@/interfaces";
import {
  AlertTriangle,
  Brain,
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
import { AIAnalysisReview } from "./AIAnalysisReview";
import { AvailabilityReview } from "./AvailabilityReview";
import { ComplianceReview } from "./ComplianceReview";
import { HoursScheduleReview } from "./HoursScheduleReview";
import { JobAdReview } from "./JobAdReview";
import { PositionDetailsReview } from "./PositionDetailsReview";
import { PostingScheduleReview } from "./PostingScheduleReview";
import { QualificationsReview } from "./QualificationsReview";
import { SelectedAutomationsPreview } from "./SelectedAutomationsPreview";
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
    { id: "automation", label: "AI Analysis", icon: Brain },
    { id: "custom-automations", label: "Custom Automations", icon: Zap },
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
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      {showHeader && (
        <div className="bg-white border-b border-gray-200 z-10">
          <div className="max-w-7xl mx-auto md:px-6">
            <div className="flex items-center justify-between py-3 sm:py-4">
              <div className="flex items-start sm:items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  {formData.jobBoardTitle || "Job Details"}
                </h1>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-shrink-0">
                  <span className="hidden sm:inline">•</span>
                  <span>
                    {formData.positionsToHire || 1} position
                    {(formData.positionsToHire || 1) > 1 ? "s" : ""}
                  </span>
                  {jobViews > 0 && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{jobViews} views</span>
                    </>
                  )}
                </div>
              </div>
              {mode === "edit" && (
                <Button
                  onClick={onSave}
                  disabled={isSubmitting}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto md:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        {/* Validation Alerts - Mobile Optimized */}
        {(issues.length > 0 || warnings.length > 0) && (
          <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
            {issues.length > 0 && (
              <Alert variant="destructive" className="py-2.5 sm:py-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs sm:text-sm">
                  <span className="font-medium">
                    {issues.length} issue{issues.length > 1 ? "s" : ""} to
                    resolve
                  </span>
                  <div className="mt-1 text-xs sm:text-sm opacity-90">
                    {issues.slice(0, 2).join(", ")}
                    {issues.length > 2 && ` and ${issues.length - 2} more`}
                  </div>
                </AlertDescription>
              </Alert>
            )}
            {warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50 py-2.5 sm:py-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-xs sm:text-sm">
                  <span className="font-medium text-yellow-900">
                    {warnings.length} recommendation
                    {warnings.length > 1 ? "s" : ""}
                  </span>
                  <div className="mt-1 text-xs sm:text-sm text-yellow-800 opacity-90">
                    {warnings.slice(0, 2).join(", ")}
                    {warnings.length > 2 && ` and ${warnings.length - 2} more`}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Mobile-First Navigation Layout */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
          {/* Mobile/Tablet Horizontal Scroll Navigation */}
          <div className="lg:hidden">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-3 pb-0">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Sections
                </h3>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <nav className="flex gap-1 px-3 pb-3 min-w-max">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const IconComponent = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0",
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                        )}
                      >
                        <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Job Sections
                </h3>
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const IconComponent = tab.icon;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative",
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <IconComponent
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isActive ? "text-blue-600" : "text-gray-500"
                          )}
                        />
                        <span className="text-left">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content - Responsive */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-5 py-6 lg:p-6 w-full max-w-none mx-auto">
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
                  <AIAnalysisReview formData={formData} />
                )}
                {activeTab === "custom-automations" && (
                  <SelectedAutomationsPreview
                    automations={formData.automations || []}
                  />
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
        </div>
      </div>
    </div>
  );
}
