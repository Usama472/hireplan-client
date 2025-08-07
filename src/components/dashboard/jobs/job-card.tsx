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
  TrendingUp,
  Users,
  Zap,
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
const formatSalary = (job: JobFormDataWithId) => {
  if (!job.payRate) return "Competitive Salary";
  if (job.payRate.type === "fixed") {
    if (job.payRate.amount == null) return "Competitive Salary";
    return `$${job.payRate.amount.toLocaleString()}`;
  } else {
    if (job.payRate.min == null || job.payRate.max == null) return "Competitive Salary";
    return `$${job.payRate.min.toLocaleString()} - $${job.payRate.max.toLocaleString()}`;
  }
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
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      icon: Zap,
      iconColor: "text-emerald-600",
    },
    draft: {
      bg: "bg-slate-100",
      text: "text-slate-800",
      icon: Edit3,
      iconColor: "text-slate-600",
    },
    paused: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      icon: Clock,
      iconColor: "text-amber-600",
    },
    closed: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: Star,
      iconColor: "text-red-600",
    },
  };
  return configs[status as keyof typeof configs] || configs.draft;
};

const getPriorityConfig = (priority: string) => {
  const configs = {
    high: {
      bg: "bg-red-100",
      text: "text-red-800",
    },
    medium: {
      bg: "bg-amber-100",
      text: "text-amber-800",
    },
    low: {
      bg: "bg-blue-100",
      text: "text-blue-800",
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
      <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-5 space-y-5">
          {/* Header Section */}
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Badge */}
              <Badge
                className={cn(
                  "px-3 py-1.5 rounded-md",
                  statusConfig.bg,
                  statusConfig.text
                )}
              >
                <StatusIcon
                  className={cn("w-4 h-4 mr-1.5", statusConfig.iconColor)}
                />
                <span className="text-xs font-medium capitalize">
                  {job.status}
                </span>
              </Badge>

              {/* Priority Badge */}
              {priorityConfig && (
                <Badge
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium",
                    priorityConfig.bg,
                    priorityConfig.text
                  )}
                >
                  {job.jobStatus?.charAt(0).toUpperCase() +
                    job.jobStatus?.slice(1)}
                </Badge>
              )}
            </div>

            {daysLeft !== null && (
              <div className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 rounded-md">
                <Clock
                  className={cn(
                    "w-4 h-4",
                    daysLeft <= 7 && daysLeft > 0 && "text-amber-500",
                    daysLeft <= 0 && "text-red-500",
                    daysLeft > 7 && "text-gray-500"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    daysLeft <= 7 && daysLeft > 0 && "text-amber-700",
                    daysLeft <= 0 && "text-red-700",
                    daysLeft > 7 && "text-gray-700"
                  )}
                >
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
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-xl text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
              {job.jobTitle || job.jobBoardTitle}
            </h3>

            {/* Location & Workplace Type */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                <span>{location}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="font-medium text-gray-700">
                {job.workplaceType?.charAt(0).toUpperCase() +
                  job.workplaceType?.slice(1)}
              </span>
            </div>
          </div>

          {/* Salary Section */}
          <div className="flex items-center justify-between py-3 border-b border-t border-gray-100 my-3">
            <div>
              <div className="text-lg font-bold text-green-700">{salary}</div>
              <div className="text-sm text-green-600">{salaryPeriod}</div>
            </div>
            <div className="p-2 bg-blue-50 rounded-full">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="flex items-center">
              <div className="p-2 mr-2 bg-blue-50 rounded-full">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">EMPLOYMENT</div>
                <div className="font-medium text-gray-800">
                  {job.employmentType
                    ?.replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="p-2 mr-2 bg-purple-50 rounded-full">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">POSITIONS</div>
                <div className="font-medium text-gray-800">
                  {job.positionsToHire || 1}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="p-2 mr-2 bg-green-50 rounded-full">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">APPLICANTS</div>
                <div className="font-medium text-gray-800">
                  {job.applicantsCount || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Education Requirement */}
          {job.educationRequirement && (
            <div className="flex items-center text-sm pt-2">
              <div className="p-2 mr-2 bg-amber-50 rounded-full">
                <GraduationCap className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">EDUCATION</div>
                <div className="font-medium text-gray-800">
                  {job.educationRequirement
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
              </div>
            </div>
          )}

          {/* Job Description Preview */}
          {job.jobDescription && (
            <div className="pt-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {job.jobDescription.length > 120
                  ? job.jobDescription.substring(0, 120) + "..."
                  : job.jobDescription}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-5">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              onClick={() => onEdit?.(job)}
            >
              <Edit3 className="w-4 h-4 mr-2 text-gray-500" />
              Edit
            </Button>
            <Button
              onClick={() => onViewDetails?.(job)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
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
