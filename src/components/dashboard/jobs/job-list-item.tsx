"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Job } from "@/interfaces";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Eye,
  GraduationCap,
  MapPin,
  MoreVertical,
  Star,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { DeleteJobModal } from "./delete-job-modal";

interface JobListItemProps {
  job: Job;
  onEdit?: (job: Job) => void;
  onDelete?: (job: Job) => void;
  onViewDetails?: (job: Job) => void;
}

// Helper functions to format data
const formatSalary = (job: Job) => {
  if (!job.payRate) return "Competitive Salary";
  if (job.payRate.type === "fixed") {
    return `$${job.payRate.amount.toLocaleString()}`;
  } else {
    return `$${job.payRate.min.toLocaleString()} - $${job.payRate.max.toLocaleString()}`;
  }
};

const formatSalaryPeriod = (job: Job) => {
  return job.payType === "hourly" ? "per hour" : "per year";
};

const formatLocation = (job: Job) => {
  if (job.jobLocation) {
    const { city, state } = job.jobLocation;
    return `${city}${state ? `, ${state}` : ""}`;
  }
  return "Remote";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDaysUntilDeadline = (endDate: string) => {
  const today = new Date();
  const deadline = new Date(endDate);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// --- Clean & Professional Configs ---
const getStatusConfig = (status: string) => {
  const configs = {
    active: {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      icon: Zap,
    },
    draft: {
      bg: "bg-slate-100",
      text: "text-slate-800",
      icon: Edit,
    },
    paused: {
      bg: "bg-amber-100",
      text: "text-amber-800",
      icon: Clock,
    },
    closed: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: Star,
    },
  };
  return (
    configs[status?.toLowerCase() as keyof typeof configs] || configs.draft
  );
};

const getPriorityConfig = (priority: string) => {
  const configs = {
    high: {
      bg: "bg-red-50",
      text: "text-red-700",
    },
    medium: {
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    low: {
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
  };
  return (
    configs[priority?.toLowerCase() as keyof typeof configs] || configs.medium
  );
};

const getWorkplaceTypeConfig = (type: string) => {
  const configs = {
    remote: {
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    hybrid: {
      bg: "bg-purple-50",
      text: "text-purple-700",
    },
    onsite: {
      bg: "bg-gray-50",
      text: "text-gray-700",
    },
  };
  return configs[type?.toLowerCase() as keyof typeof configs] || configs.onsite;
};

export function JobListItem({
  job,
  onEdit,
  onDelete,
  onViewDetails,
}: JobListItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const salary = formatSalary(job);
  const salaryPeriod = formatSalaryPeriod(job);
  const location = formatLocation(job);
  const daysLeft = job.endDate ? getDaysUntilDeadline(job.endDate) : null;

  const statusConfig = getStatusConfig(job.status || "draft");
  const priorityConfig = job.jobStatus
    ? getPriorityConfig(job.jobStatus)
    : null;
  const workplaceTypeConfig = getWorkplaceTypeConfig(
    job.workplaceType || "onsite"
  );
  const StatusIcon = statusConfig.icon;

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
    setIsDropdownOpen(false);
  };

  const handleDeleteConfirm = async (jobToDelete: Job) => {
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
        className={cn(
          "group relative overflow-hidden border border-gray-200 rounded-lg",
          "bg-white hover:bg-gray-50 transition-all duration-200 ease-out",
          "hover:shadow-sm hover:border-blue-300",
          "active:bg-gray-100 cursor-pointer"
        )}
      >
        {/* Status indicator bar */}

        <CardContent className="p-4 pl-5">
          <div className="flex items-start justify-between gap-4">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Top Row: Title, Status, Priority */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                  {job.jobTitle || job.jobBoardTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  <div
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium",
                      statusConfig.bg,
                      statusConfig.text
                    )}
                  >
                    <StatusIcon className="w-3 h-3" />
                    <span>
                      {job.status?.charAt(0).toUpperCase() +
                        job.status?.slice(1)}
                    </span>
                  </div>

                  {/* Priority Badge */}
                  {priorityConfig && (
                    <div
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium",
                        priorityConfig.bg,
                        priorityConfig.text
                      )}
                    >
                      {job.jobStatus?.charAt(0).toUpperCase() +
                        job.jobStatus?.slice(1)}
                    </div>
                  )}
                </div>
              </div>

              {/* Location & Salary */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium">
                    {salary}{" "}
                    <span className="text-gray-500 font-normal">
                      {salaryPeriod}
                    </span>
                  </span>
                </div>
              </div>

              {/* Employment Details */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                  <Briefcase className="w-3 h-3" />
                  <span>
                    {job.employmentType
                      ?.replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>

                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: workplaceTypeConfig.bg.replace("/80", ""),
                    color: workplaceTypeConfig.text,
                  }}
                >
                  <span>
                    {job.workplaceType?.charAt(0).toUpperCase() +
                      job.workplaceType?.slice(1)}
                  </span>
                </div>

                {job.positionsToHire && job.positionsToHire > 1 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                    <Users className="w-3 h-3" />
                    <span>{job.positionsToHire} positions</span>
                  </div>
                )}

                {job.educationRequirement && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium">
                    <GraduationCap className="w-3 h-3" />
                    <span>
                      {job.educationRequirement
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                )}
              </div>

              {/* Job Description Preview */}
              {job.jobDescription && (
                <div className="text-sm text-gray-600 line-clamp-2 pt-2">
                  <p>
                    {job.jobDescription.length > 150
                      ? job.jobDescription.substring(0, 150) + "..."
                      : job.jobDescription}
                  </p>
                </div>
              )}

              {/* Stats and Timeline */}
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100">
                {/* Applicants Count */}
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">
                    {job.applicantsCount || 0}
                  </span>
                  <span className="text-gray-500">applicants</span>
                </div>

                {/* Views Count */}
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Eye className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">{job.views || 0}</span>
                  <span className="text-gray-500">views</span>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {formatDate(job.createdAt)}
                  </span>
                </div>

                {/* Deadline */}
                {daysLeft !== null && (
                  <div className="flex items-center gap-1.5 text-sm">
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
                        "font-medium",
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
            </div>

            {/* Actions Section (Dropdown) */}
            <div className="flex-shrink-0">
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(job);
                    }}
                    className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Hover Indicator */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
              Click for details
              <ArrowRight className="w-3 h-3 ml-1" />
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
