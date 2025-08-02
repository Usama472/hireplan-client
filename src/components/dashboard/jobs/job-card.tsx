"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { JobFormDataWithId } from "@/interfaces";
import {
  cn,
  getPriorityColor,
  getStatusColor,
  getWorkplaceTypeColor,
} from "@/lib/utils";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  GraduationCap,
  MapPin,
  MoreVertical,
  Trash2,
  Users,
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
  if (!job.payRate) return "Not specified";

  if (job.payRate.type === "fixed") {
    return `${job.payRate.amount} $ ${
      job.payType === "hourly" ? "/ hour" : "/ year"
    }`;
  } else {
    return `$${job.payRate.min} - $${job.payRate.max} ${
      job.payType === "hourly" ? "/hour" : "/year"
    }`;
  }
};

const formatLocation = (job: JobFormDataWithId) => {
  if (job.jobLocation) {
    const { city, state } = job.jobLocation;
    return `${city}${state ? `, ${state}` : ""}`;
  }
  return "Location not specified";
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

export function JobCard({
  job,
  onEdit,
  onDelete,
  onViewDetails,
}: JobCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const salary = formatSalary(job);
  const location = formatLocation(job);
  const daysLeft = job.endDate ? getDaysUntilDeadline(job.endDate) : null;

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
      <Card className="group relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white hover:scale-[1.02]">
        {/* Status indicator */}
        <div
          className={cn(
            "absolute top-0 left-0 w-1 h-full",
            job.status === "active"
              ? "bg-green-500"
              : job.status === "draft"
              ? "bg-gray-400"
              : job.status === "paused"
              ? "bg-yellow-500"
              : "bg-red-500"
          )}
        />

        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Status and Priority Badges */}
              <div className="flex items-center gap-2 mb-3">
                <Badge
                  className={cn(
                    "text-xs font-medium cursor-pointer",
                    getStatusColor(job.status || "")
                  )}
                >
                  {job.status &&
                    job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                </Badge>
                {job.jobStatus && (
                  <Badge
                    className={cn(
                      "text-xs font-medium cursor-pointer",
                      getPriorityColor(job.jobStatus)
                    )}
                  >
                    {job.jobStatus.charAt(0).toUpperCase() +
                      job.jobStatus.slice(1)}{" "}
                    Priority
                  </Badge>
                )}
              </div>

              {/* Job Title */}
              <h3 className="font-semibold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {job.jobTitle || job.jobBoardTitle}
              </h3>

              {/* Location and Workplace Type */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{location}</span>
                </div>
                <Badge
                  className={cn(
                    "text-xs cursor-pointer",
                    getWorkplaceTypeColor(job.workplaceType)
                  )}
                >
                  {job.workplaceType?.charAt(0).toUpperCase() +
                    job.workplaceType?.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Salary and Employment Details */}
          <div className="flex items-center text-green-600 font-semibold">
            <span>{salary}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
              >
                {job.employmentType
                  ?.replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Badge>
              {job.positionsToHire && job.positionsToHire > 1 && (
                <Badge
                  variant="outline"
                  className="text-xs hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <Briefcase className="w-3 h-3 mr-1" />
                  {job.positionsToHire} positions
                </Badge>
              )}
            </div>
          </div>

          {/* Education Requirement */}
          {job.educationRequirement && (
            <div className="flex items-center text-sm text-gray-600">
              <GraduationCap className="w-4 h-4 mr-2" />
              <span>
                {job.educationRequirement
                  .replace("-", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                required
              </span>
            </div>
          )}

          {/* Job Description Preview */}
          {job.jobDescription && (
            <div className="text-sm text-gray-600">
              <p className="line-clamp-2">
                {job.jobDescription.length > 120
                  ? job.jobDescription.substring(0, 120) + "..."
                  : job.jobDescription}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              <span>{job.applicantsCount || 0} applicants</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Created {formatDate(job.createdAt)}</span>
            </div>
            {daysLeft !== null && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span
                  className={cn(
                    daysLeft <= 7 && daysLeft > 0 && "text-orange-600",
                    daysLeft <= 0 && "text-red-600"
                  )}
                >
                  {daysLeft > 0
                    ? `${daysLeft} days left`
                    : daysLeft === 0
                    ? "Expires today"
                    : "Expired"}
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Action Button */}
          <div className="pt-4">
            <Button
              onClick={() => onViewDetails?.(job)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 group/btn"
              size="sm"
            >
              <span className="flex items-center justify-center">
                View Full Details
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
              </span>
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
