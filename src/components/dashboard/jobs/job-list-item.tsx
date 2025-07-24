"use client";

import { Badge } from "@/components/ui/badge";
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
  Trash2,
  Users,
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
  if (job.payRate?.amount) {
    const amount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(job.payRate.amount);
    return `${amount}${job.payType === "hourly" ? "/hr" : "/year"}`;
  }
  return "Salary not specified";
};

const formatLocation = (job: Job) => {
  if (job.jobLocation) {
    const { city, state } = job.jobLocation;
    return `${city}${state ? `, ${state}` : ""}`;
  }
  return "Location not specified";
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    case "paused":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
    case "closed":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
  }
};

const getWorkplaceTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case "remote":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
    case "hybrid":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200";
    case "onsite":
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
  }
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
  const location = formatLocation(job);
  const daysLeft = job.endDate ? getDaysUntilDeadline(job.endDate) : null;

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

  return (
    <>
      <Card className="group relative border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
        {/* Status indicator */}
        <div
          className={cn(
            "absolute left-0 top-0 w-1 h-full rounded-l-lg",
            job.status === "active"
              ? "bg-green-500"
              : job.status === "draft"
              ? "bg-gray-400"
              : job.status === "paused"
              ? "bg-yellow-500"
              : "bg-red-500"
          )}
        />

        <CardContent className="p-6 pl-8">
          <div className="flex items-start justify-between">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header Section */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  {/* Title and Badges */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                      {job.jobTitle || job.jobBoardTitle}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "text-xs font-medium cursor-pointer",
                          getStatusColor(job.status)
                        )}
                      >
                        {job.status?.charAt(0).toUpperCase() +
                          job.status?.slice(1)}
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
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{location}</span>
                    </div>
                    <div className="flex items-center text-green-600 font-semibold">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>{salary}</span>
                    </div>
                  </div>

                  {/* Employment Details */}
                  <div className="flex items-center gap-4 mb-4">
                    <Badge
                      variant="outline"
                      className="text-xs hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                    >
                      {job.employmentType
                        ?.replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                    <Badge
                      className={cn(
                        "text-xs cursor-pointer",
                        getWorkplaceTypeColor(job.workplaceType)
                      )}
                    >
                      {job.workplaceType?.charAt(0).toUpperCase() +
                        job.workplaceType?.slice(1)}
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
                    {job.educationRequirement && (
                      <Badge
                        variant="outline"
                        className="text-xs hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                      >
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {job.educationRequirement
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    )}
                  </div>

                  {/* Job Description Preview */}
                  {job.jobDescription && (
                    <div className="text-sm text-gray-600 mb-4">
                      <p className="line-clamp-2">
                        {job.jobDescription.length > 150
                          ? job.jobDescription.substring(0, 150) + "..."
                          : job.jobDescription}
                      </p>
                    </div>
                  )}

                  {/* Stats and Timeline */}
                  <div className="flex items-center justify-between">
                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                        <Users className="w-4 h-4 mr-1" />
                        <span className="font-medium">
                          {job.applicants || 0}
                        </span>
                        <span className="text-gray-500 ml-1">applicants</span>
                      </div>
                      <div className="flex items-center text-purple-600 hover:text-purple-700 transition-colors cursor-pointer">
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="font-medium">{job.views || 0}</span>
                        <span className="text-gray-500 ml-1">views</span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>Created {formatDate(job.createdAt)}</span>
                      </div>
                      {daysLeft !== null && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span
                            className={cn(
                              daysLeft <= 7 &&
                                daysLeft > 0 &&
                                "text-orange-600",
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
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-3 ml-6">
              {/* View Details Button */}
              <Button
                onClick={() => onViewDetails?.(job)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm shadow-md hover:shadow-lg transition-all duration-200"
                size="sm"
              >
                <span className="flex items-center">
                  View Details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </Button>

              {/* Actions Menu */}
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-transparent transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => onEdit?.(job)}
                    className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Job
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDeleteClick}
                    className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
