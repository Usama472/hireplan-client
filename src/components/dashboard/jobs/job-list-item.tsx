"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { JobFormDataWithId } from "@/interfaces";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Edit3,
  GraduationCap,
  MapPin,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { DeleteJobModal } from "./delete-job-modal";

interface JobListItemProps {
  job: JobFormDataWithId;
  onEdit?: (job: JobFormDataWithId) => void;
  onDelete?: (job: JobFormDataWithId) => void;
  onViewDetails?: (job: JobFormDataWithId) => void;
}

// Helper functions to format data
const formatText = (
  text: string | undefined | null,
  fallback: string = "Unknown"
) => {
  if (!text) return fallback;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatSalary = (job: JobFormDataWithId) => {
  if (!job.payRate) return "Competitive Salary";

  try {
    const payRate = job.payRate as any;

    if (payRate.type === "fixed" && payRate.amount != null) {
      return `$${payRate.amount.toLocaleString()}`;
    } else if (
      payRate.type === "range" &&
      payRate.min != null &&
      payRate.max != null
    ) {
      return `$${payRate.min.toLocaleString()} - $${payRate.max.toLocaleString()}`;
    }
  } catch (error) {
    console.warn("Error formatting salary:", error);
  }

  return "Competitive Salary";
};

const formatSalaryPeriod = (job: JobFormDataWithId) => {
  return job.payType === "hourly" ? "per hour" : "per year";
};

const formatLocation = (job: JobFormDataWithId) => {
  if (job.jobLocation) {
    const { city, state } = job.jobLocation;
    return `${city}${state ? `, ${state}` : ""}`;
  }
  return "Remote";
};

const getDaysUntilDeadline = (endDate: Date) => {
  const today = new Date();
  const deadline = new Date(endDate);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getStatusConfig = (status: string) => {
  const configs = {
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: Zap,
      iconColor: "text-emerald-600",
    },
    draft: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      icon: Edit3,
      iconColor: "text-slate-600",
    },
    paused: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock,
      iconColor: "text-amber-600",
    },
    closed: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: Star,
      iconColor: "text-red-600",
    },
  };
  return configs[status as keyof typeof configs] || configs.draft;
};

const getPriorityConfig = (priority: string) => {
  const configs = {
    high: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    medium: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    low: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
  };
  return configs[priority as keyof typeof configs] || configs.medium;
};

export function JobListItem({
  job,
  onEdit,
  onDelete,
  onViewDetails,
}: JobListItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const salary = formatSalary(job);
  const salaryPeriod = formatSalaryPeriod(job);
  const location = formatLocation(job);
  const daysLeft = job.endDate ? getDaysUntilDeadline(job.endDate) : null;
  const statusConfig = getStatusConfig(job.status || "draft");
  const priorityConfig = job.jobStatus
    ? getPriorityConfig(job.jobStatus)
    : null;
  const StatusIcon = statusConfig.icon;

  const handleDeleteConfirm = async (jobToDelete: JobFormDataWithId) => {
    setIsDeleting(true);
    try {
      await onDelete?.(jobToDelete);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    onViewDetails?.(job);
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className="group bg-white border border-gray-200 hover:border-primary/20 transition-all duration-200 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-50/50"
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-5">
            {/* Left Section - Main Content */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {job.jobTitle || job.jobBoardTitle}
                    </h3>

                    {/* Deadline Badge - Inline with Title */}
                    {daysLeft !== null && (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium flex-shrink-0",
                          daysLeft <= 7 &&
                            daysLeft > 0 &&
                            "bg-amber-50 text-amber-700 border-amber-200",
                          daysLeft <= 0 &&
                            "bg-red-50 text-red-700 border-red-200",
                          daysLeft > 7 &&
                            "bg-gray-50 text-gray-700 border-gray-200"
                        )}
                      >
                        <Clock
                          className={cn(
                            "w-3 h-3",
                            daysLeft <= 7 && daysLeft > 0 && "text-amber-600",
                            daysLeft <= 0 && "text-red-600",
                            daysLeft > 7 && "text-gray-600"
                          )}
                        />
                        <span>
                          {daysLeft > 0
                            ? `${daysLeft}d left`
                            : daysLeft === 0
                            ? "Today"
                            : "Expired"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Location & Workplace Type */}
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-primary mr-1.5" />
                      <span>{location}</span>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-gray-300" />
                    <span className="font-medium text-gray-700">
                      {formatText(job.workplaceType, "Remote")}
                    </span>
                  </div>
                </div>

                {/* Status & Priority Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={cn(
                      "px-2.5 py-1 rounded-md border text-xs font-medium",
                      statusConfig.bg,
                      statusConfig.text,
                      statusConfig.border
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <StatusIcon
                        className={cn("w-3 h-3", statusConfig.iconColor)}
                      />
                      <span className="capitalize">{job.status}</span>
                    </div>
                  </div>

                  {priorityConfig && (
                    <div
                      className={cn(
                        "px-2 py-1 rounded-md border text-xs font-medium",
                        priorityConfig.bg,
                        priorityConfig.text,
                        priorityConfig.border
                      )}
                    >
                      {formatText(job.jobStatus)}
                    </div>
                  )}
                </div>
              </div>

              {/* Key Information Row */}
              <div className="flex items-center gap-6 text-sm">
                {/* Salary */}
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-900">{salary}</span>
                  <span className="text-gray-500">{salaryPeriod}</span>
                </div>

                {/* Employment Type */}
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-gray-700">
                    {job.employmentType
                      ?.replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>

                {/* Positions */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-gray-700">
                    {job.positionsToHire || 1} position
                    {job.positionsToHire !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Applicants */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">
                    {job.applicantsCount || 0} applicant
                    {job.applicantsCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* Additional Details Row */}
              <div className="flex items-center gap-6 text-sm">
                {/* Posted Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    Posted{" "}
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                        })
                      : "N/A"}
                  </span>
                </div>

                {/* Education Requirement */}
                {job.educationRequirement && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                    <span className="text-gray-700">
                      {formatText(job.educationRequirement)}
                    </span>
                  </div>
                )}
              </div>

              {/* Job Description Preview */}
              {job.jobDescription && (
                <div className="pt-1">
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {job.jobDescription.length > 120
                      ? job.jobDescription.substring(0, 120) + "..."
                      : job.jobDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Right Section - Actions */}
            <div className="flex flex-col items-end gap-4 flex-shrink-0">
              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-32">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="w-full h-9 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(job);
                  }}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Job
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.(job);
                  }}
                  variant="secondary"
                  className="w-full h-9 font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>

              {/* Hover Indicator */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="flex items-center gap-1 text-xs text-primary font-medium bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  Click for details
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteJobModal
        job={job}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
