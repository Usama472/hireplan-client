"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

      {/* Review Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <Tabs
          defaultValue={mode === "review" ? "applicants" : "job-ad"}
          className="w-full"
        >
          <div className="border-b-2 border-gray-200">
            <TabsList
              className={`grid w-full ${
                mode === "review" ? "grid-cols-9" : "grid-cols-8"
              } h-16 bg-transparent border-0 p-0`}
            >
              <TabsTrigger
                value="job-ad"
                className="flex flex-col items-center gap-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all rounded-tl-md"
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs font-medium">Job Ad</span>
              </TabsTrigger>
              <TabsTrigger
                value="position"
                className="flex flex-col items-center gap-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all"
              >
                <Briefcase className="h-5 w-5" />
                <span className="text-xs font-medium">Position</span>
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="flex flex-col items-center gap-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all"
              >
                <Clock className="h-5 w-5" />
                <span className="text-xs font-medium">Schedule</span>
              </TabsTrigger>
              <TabsTrigger
                value="compliance"
                className="flex flex-col items-center gap-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all"
              >
                <Building className="h-5 w-5" />
                <span className="text-xs font-medium">Compliance</span>
              </TabsTrigger>
              <TabsTrigger
                value="qualifications"
                className="flex flex-col items-center gap-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs font-medium">Qualifications</span>
              </TabsTrigger>
              <TabsTrigger
                value="posting"
                className="flex flex-col items-center gap-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs font-medium">Posting</span>
              </TabsTrigger>
              <TabsTrigger
                value="automation"
                className="flex flex-col items-center gap-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all"
              >
                <Zap className="h-5 w-5" />
                <span className="text-xs font-medium">Automation</span>
              </TabsTrigger>
              <TabsTrigger
                value="availability"
                className={`flex flex-col items-center gap-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all ${
                  mode !== "review" ? "rounded-tr-md" : ""
                }`}
              >
                <CalendarClock className="h-5 w-5" />
                <span className="text-xs font-medium">Availability</span>
              </TabsTrigger>
              {mode === "review" && (
                <TabsTrigger
                  value="applicants"
                  className="flex flex-col items-center gap-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 hover:bg-gray-50 transition-all rounded-tr-md"
                >
                  <UserCheck className="h-5 w-5" />
                  <span className="text-xs font-medium">Applicants</span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="p-8">
            <TabsContent value="job-ad" className="mt-0">
              <JobAdReview formData={formData} />
            </TabsContent>

            <TabsContent value="position" className="mt-0">
              <PositionDetailsReview formData={formData} />
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <HoursScheduleReview formData={formData} />
            </TabsContent>

            <TabsContent value="compliance" className="mt-0">
              <ComplianceReview formData={formData} />
            </TabsContent>

            <TabsContent value="qualifications" className="mt-0">
              <QualificationsReview formData={formData} />
            </TabsContent>

            <TabsContent value="posting" className="mt-0">
              <PostingScheduleReview formData={formData} />
            </TabsContent>

            <TabsContent value="automation" className="mt-0">
              <AutomationReview formData={formData} />
            </TabsContent>

            <TabsContent value="availability" className="mt-0">
              <AvailabilityReview formData={formData} />
            </TabsContent>

            {mode === "review" && jobId && (
              <TabsContent value="applicants" className="mt-0">
                <ApplicantsSection jobId={jobId} jobViews={jobViews} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
