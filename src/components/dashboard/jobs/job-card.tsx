"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { JobFormDataWithId } from "@/interfaces";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Briefcase,
  Clock,
  Edit3,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  X,
  MoreVertical,
} from "lucide-react";
import { useState } from "react";
import { DeleteJobModal } from "./delete-job-modal";

interface JobCardProps {
  job: JobFormDataWithId;
  onEdit?: (job: JobFormDataWithId) => void;
  onDelete?: (job: JobFormDataWithId) => void;
  onViewDetails?: (job: JobFormDataWithId) => void;
  onClose?: (job: JobFormDataWithId) => void;
}

const formatText = (
  text: string | undefined | null,
  fallback: string = "Unknown"
) => {
  if (!text) return fallback;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatSalary = (job: JobFormDataWithId) => {
  if (!job.payRate) return "Competitive";

  try {
    const payRate = job.payRate as any;

    if (payRate.type === "fixed" && payRate.amount != null) {
      return `$${payRate.amount.toLocaleString()}`;
    } else if (
      payRate.type === "range" &&
      payRate.min != null &&
      payRate.max != null
    ) {
      return `$${payRate.min.toLocaleString()}-${payRate.max.toLocaleString()}`;
    }
  } catch (error) {
    console.warn("Error formatting salary:", error);
  }

  return "Competitive";
};

const formatSalaryPeriod = (job: JobFormDataWithId) => {
  return job.payType === "hourly" ? "/hr" : "/yr";
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
      dot: "bg-emerald-500",
    },
    draft: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      dot: "bg-slate-400",
    },
    paused: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    closed: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
    },
  };
  return configs[status as keyof typeof configs] || configs.draft;
};

export function JobCard({
  job,
  onEdit,
  onDelete,
  onViewDetails,
  onClose,
}: JobCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const salary = formatSalary(job);
  const salaryPeriod = formatSalaryPeriod(job);
  const location = formatLocation(job);
  const daysLeft = job.endDate ? getDaysUntilDeadline(job.endDate) : null;
  const statusConfig = getStatusConfig(job.status || "draft");

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

  const handleCloseJob = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClosing(true);
    try {
      await onClose?.(job);
    } catch (error) {
      console.error("Error closing job:", error);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <>
      <Card className="group bg-white rounded-md border border-gray-200 hover:border-blue-300 transition-all duration-200">
        <CardContent className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium",
                  statusConfig.bg,
                  statusConfig.text,
                  statusConfig.border
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse",
                    statusConfig.dot
                  )}
                ></span>
                <span className="capitalize">{job.status}</span>
              </Badge>

              {daysLeft !== null && daysLeft <= 14 && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                    daysLeft <= 7 &&
                      daysLeft > 0 &&
                      "bg-amber-50 text-amber-700 border-amber-200",
                    daysLeft <= 0 && "bg-red-50 text-red-700 border-red-200",
                    daysLeft > 7 && "bg-blue-50 text-blue-700 border-blue-200"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {daysLeft > 0
                      ? `${daysLeft}d`
                      : daysLeft === 0
                      ? "Today"
                      : "Closed"}
                  </span>
                </div>
              )}
            </div>

            {/* Actions Dropdown */}
            {job.status !== "closed" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={handleCloseJob}
                    disabled={isClosing}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {isClosing ? "Closing..." : "Close Job"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Job Title */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed">
              {job.jobTitle || job.jobBoardTitle}
            </h3>

            {/* Location & Type */}
            <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{location}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <span className="font-medium text-blue-600">
                {formatText(job.workplaceType, "Remote")}
              </span>
              {job.employmentType && (
                <>
                  <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                  <span className="text-gray-600">
                    {job.employmentType
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Salary */}
          <div className="flex items-center gap-2.5 py-2.5 px-4 bg-emerald-50 rounded-md border border-emerald-100">
            <DollarSign className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-base font-bold text-gray-900">{salary}</span>
            <span className="text-sm text-gray-600 font-medium">
              {salaryPeriod}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex justify-center mb-2">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium">
                Pending
              </p>
              <p className="text-lg font-bold text-gray-900">
                {Math.floor((job.applicantsCount || 0) * 0.4)}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex justify-center mb-2">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium">
                Shortlist
              </p>
              <p className="text-lg font-bold text-gray-900">
                {Math.floor((job.applicantsCount || 0) * 0.3)}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-100">
              <div className="flex justify-center mb-2">
                <Briefcase className="w-4 h-4 text-red-600" />
              </div>
              <p className="text-xs text-gray-500 mb-1.5 font-medium">
                Rejected
              </p>
              <p className="text-lg font-bold text-gray-900">
                {Math.floor((job.applicantsCount || 0) * 0.3)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {job.createdAt
                  ? new Date(job.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="font-medium text-gray-700">
                {job.employmentType
                  ?.replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-300 hover:border-gray-400 hover:bg-gray-50 gap-2 text-sm h-9"
              onClick={() => onEdit?.(job)}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
            <Button className="flex-1" onClick={() => onViewDetails?.(job)}>
              View
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>

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
