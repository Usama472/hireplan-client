"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { JobFormDataWithId } from "@/interfaces";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Briefcase,
  Clock,
  Edit3,
  GraduationCap,
  MapPin,
  Star,
  Users,
  Zap,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import { DeleteJobModal } from "./delete-job-modal";

interface JobCardProps {
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

export function JobCard({
  job,
  onEdit,
  onDelete,
  onViewDetails,
}: JobCardProps) {
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

  return (
    <>
      <Card className="group bg-white border border-gray-100 hover:border-primary/20 transition-all duration-200 rounded-lg overflow-hidden shadow-none">
        <CardContent className="p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Badge */}
              <Badge
                variant="outline"
                className={cn(
                  "px-2 sm:px-2.5 py-1 rounded-md border text-xs font-medium",
                  statusConfig.bg,
                  statusConfig.text,
                  statusConfig.border
                )}
              >
                <StatusIcon
                  className={cn("w-3 h-3 mr-1 sm:mr-1.5", statusConfig.iconColor)}
                />
                <span className="capitalize">{job.status}</span>
              </Badge>

              {/* Priority Badge */}
              {priorityConfig && (
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2 py-1 rounded-md border text-xs font-medium",
                    priorityConfig.bg,
                    priorityConfig.text,
                    priorityConfig.border
                  )}
                >
                  {formatText(job.jobStatus)}
                </Badge>
              )}
            </div>

            {/* Deadline Indicator */}
            {daysLeft !== null && (
              <div
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
                  daysLeft <= 7 &&
                    daysLeft > 0 &&
                    "bg-amber-50 text-amber-700 border border-amber-200",
                  daysLeft <= 0 &&
                    "bg-red-50 text-red-700 border border-red-200",
                  daysLeft > 7 &&
                    "bg-gray-50 text-gray-700 border border-gray-200"
                )}
              >
                <Clock
                  className={cn(
                    "w-3.5 h-3.5",
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

          {/* Job Title */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
              {job.jobTitle || job.jobBoardTitle}
            </h3>

            {/* Location & Workplace Type */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
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

          {/* Salary Section */}
          <div className="bg-secondary/5 rounded-md p-3 border border-secondary/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-primary">
                  {salary}
                </div>
                <div className="text-xs text-primary/70 font-medium">
                  {salaryPeriod}
                </div>
              </div>
              <div className="p-2 bg-green-500/10 border border-green-500/20 rounded-md">
                <DollarSign className="w-4 h-4 text-green-700" />
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="flex items-center p-2 sm:p-2.5 bg-gray-50 rounded-md">
              <div className="p-1 sm:p-1.5 mr-2 sm:mr-2.5 bg-primary/10 rounded-md flex-shrink-0">
                <Briefcase className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Type
                </div>
                <div className="text-sm font-medium text-gray-800 truncate">
                  {job.employmentType
                    ?.replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              </div>
            </div>

            <div className="flex items-center p-2 sm:p-2.5 bg-gray-50 rounded-md">
              <div className="p-1 sm:p-1.5 mr-2 sm:mr-2.5 bg-primary/10 rounded-md flex-shrink-0">
                <Users className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Positions
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {job.positionsToHire || 1}
                </div>
              </div>
            </div>

            <div className="flex items-center p-2 sm:p-2.5 bg-gray-50 rounded-md">
              <div className="p-1 sm:p-1.5 mr-2 sm:mr-2.5 bg-primary/10 rounded-md flex-shrink-0">
                <Users className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Applicants
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {job.applicantsCount || 0}
                </div>
              </div>
            </div>

            <div className="flex items-center p-2 sm:p-2.5 bg-gray-50 rounded-md">
              <div className="p-1 sm:p-1.5 mr-2 sm:mr-2.5 bg-primary/10 rounded-md flex-shrink-0">
                <Calendar className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Posted
                </div>
                <div className="text-sm font-medium text-gray-800 truncate">
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                      })
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Education Requirement */}
          {job.educationRequirement && (
            <div className="flex items-center p-2.5 rounded-md">
              <div className="p-1.5 mr-2.5 bg-secondary/10 rounded-md">
                <GraduationCap className="w-3.5 h-3.5 text-secondary" />
              </div>
              <div>
                <div className="text-xs text-primary font-medium uppercase tracking-wide">
                  Education
                </div>
                <div className="text-sm font-medium text-secondary">
                  {job.educationRequirement
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              </div>
            </div>
          )}

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

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 pt-3">
            <Button
              variant="outline-primary"
              size="lg"
              className="flex-1 border-primary/40"
              onClick={() => onEdit?.(job)}
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
              Edit
            </Button>
            <Button
              size="lg"
              onClick={() => onViewDetails?.(job)}
              variant="secondary"
              className="flex-1"
            >
              View Details
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
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
