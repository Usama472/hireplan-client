"use client";

import PaginationButton from "@/components/common/PaginationButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants";
import { PERMISSIONS } from "@/constants/permissions";
import API from "@/http";
import type { JobFormDataWithId } from "@/interfaces";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { usePaginationQuery } from "@/lib/hooks/usePaginateQuery";
import usePermission from "@/lib/hooks/usePermission";
import { errorResolver } from "@/lib/utils";
// Removed global DataLoadingManager import
import {
  Briefcase,
  Grid3X3,
  List,
  Plus,
  Search,
  Eye,
  Users,
  Target,
  Building2,
  AlertCircle,
  X as CloseIcon,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { DeleteJobModal } from "./delete-job-modal";
import { EmptyJobsState } from "./empty-jobs-state";
import { JobsGridSkeleton, JobsListViewSkeleton } from "@/components/common/skeleton-loader";
import { JobsGrid } from "./jobs-grid";
import { JobsList } from "./jobs-list";
import { useNotifications } from "@/lib/hooks/use-notifications";

interface JobsResponse {
  jobs: {
    results: JobFormDataWithId[];
    limit: number;
    page: number;
    totalPages: number;
    totalResults: number;
  };
}

export default function JobsPage() {
  const { hasPermission } = usePermission();
  const canCreateJob = hasPermission(PERMISSIONS.JOB_CREATE);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobFormDataWithId | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { data: session } = useAuthSessionContext();
  const company = session?.user?.company;
  
  // Simple loading state - no complex state management
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // TEMPORARILY DISABLED: Get expired job notifications from the notification system
  // const { expiredJobNotifications, refetch: refetchNotifications } =
  //   useNotifications();
  
  // Mock empty notifications for testing
  const expiredJobNotifications: any[] = [];
  const refetchNotifications = async () => {};

  const {
    data: jobsData,
    loading,
    pageParams,
    refetch,
    filters: { setSearchQuery, searchQuery },
  } = usePaginationQuery({
    key: "queryJobs",
    limit: 12,
    fetchFun: async (...args) => {
      const result = await API.job.getJobs(...args);
      // Mark as loaded on first successful fetch - no complex state updates
      if (!hasInitiallyLoaded) {
        setHasInitiallyLoaded(true);
      }
      return result;
    },
    parseResponse: (data: JobsResponse) => data.jobs,
  });

  const handleJobEdit = (job: JobFormDataWithId) => {
    navigate(`${ROUTES.DASHBOARD.EDIT_JOB}/${job.id}`);
  };

  const handleJobDelete = (job: JobFormDataWithId) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  const confirmDelete = async (job: JobFormDataWithId) => {
    if (!job?.id) return;

    setIsDeleting(true);
    try {
      await API.job.deleteJob(job.id);
      toast.success("Job deleted successfully");

      await refetch();
          setShowDeleteModal(false);
          setJobToDelete(null);
        } catch (error) {
          const errorMessage = errorResolver(error);
          console.error("Error deleting job:", error);
          toast.error(`Failed to delete job: ${errorMessage}`);
        } finally {
          setIsDeleting(false);
        }
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleCloseJob = async (jobId: string, notificationId?: string) => {
    if (!jobId) return;

    try {
      await API.job.updateJob(jobId, { status: "closed" } as any);

      // Dismiss the notification if provided
      if (notificationId) {
        await API.notification.dismissNotification(notificationId);
      }

          toast.success("Job closed successfully");
          await refetch();
          await refetchNotifications();
        } catch (error) {
          const errorMessage = errorResolver(error);
          console.error("Error closing job:", error);
          toast.error(`Failed to close job: ${errorMessage}`);
        }
  };

  const handleDismissNotification = async (notificationId: string) => {
    try {
      await API.notification.dismissNotification(notificationId);
      await refetchNotifications();
    } catch (error) {
      console.error("Error dismissing notification:", error);
      toast.error("Failed to dismiss notification");
    }
  };

  // Wrapper for job card close action (doesn't have notification context)
  const handleJobCardClose = async (job: JobFormDataWithId) => {
    await handleCloseJob(job.id);
  };

  const jobs = jobsData || [];
  const hasSearchQuery = searchQuery !== "";

  // Remove debug logging

  const jobsWithLocation = jobs.map((job) => ({
    ...job,
    location: job.jobLocation
      ? `${job.jobLocation.city}, ${job.jobLocation.state}`
      : "Remote",
  }));

  // Get unique departments for filter
  const uniqueDepartments = Array.from(
    new Set(
      jobsWithLocation
        .map((job) => job.department || job.customDepartment)
        .filter((dept) => dept && dept !== "")
    )
  ).sort();

  // Apply all filters
  let filteredJobs = jobsWithLocation;

  // Employment type filter
  if (typeFilter !== "all") {
    filteredJobs = filteredJobs.filter(
      (job) => job.employmentType === typeFilter
    );
  }

  // Status filter
  if (statusFilter !== "all") {
    filteredJobs = filteredJobs.filter(
      (job) =>
        (job.status || "active").toLowerCase() === statusFilter.toLowerCase()
    );
  }

  // Department filter
  if (departmentFilter !== "all") {
    filteredJobs = filteredJobs.filter(
      (job) =>
        job.department === departmentFilter ||
        job.customDepartment === departmentFilter
    );
  }

  // No sorting - keep jobs in original order
  const filteredJobsFinal = filteredJobs;

  const totalApplicants = filteredJobsFinal.reduce(
    (total, job) => total + (job.applicantsCount || 0),
    0
  );
  const totalViews = filteredJobsFinal.reduce(
    (total, job) => total + (job.views || 0),
    0
  );
  const avgApplicants =
    filteredJobsFinal.length > 0
      ? Math.round(totalApplicants / filteredJobsFinal.length)
      : 0;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Job Postings
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your active listings
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={async () => {
                  let slug = (company as any)?.slug;
                  if (!slug && (company as any)?._id) {
                    // Fallback: fetch company slug from API
                    try {
                      const response = await API.company.getCompanySlug(
                        (company as any)._id
                      );
                      slug = response?.slug;
                    } catch (error) {
                      console.error("Error fetching company slug:", error);
                    }
                  }
                  if (slug) {
                    navigate(`/company/${slug}`);
                  } else {
                    toast.error(
                      "Company career page not available. Please contact support."
                    );
                  }
                }}
                variant="outline"
                className="border-gray-300 hover:border-gray-400 gap-2 h-10 px-4 text-sm"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Career Page</span>
              </Button>
              {canCreateJob && (
                <Button onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}>
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Job</span>
                  <span className="sm:hidden">New</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Active Jobs */}
          <div className="bg-white rounded-md border border-gray-200 p-3 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-md flex-shrink-0">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 mb-0.5">
                Active Jobs
              </p>
              <p className="text-xl font-bold text-gray-900">
                {filteredJobsFinal.length}
              </p>
            </div>
          </div>

          {/* Total Applications */}
          <div className="bg-white rounded-md border border-gray-200 p-3 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-md flex-shrink-0">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 mb-0.5">
                Applications
              </p>
              <p className="text-xl font-bold text-gray-900">
                {totalApplicants}
              </p>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white rounded-md border border-gray-200 p-3 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-md flex-shrink-0">
              <Eye className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 mb-0.5">
                Job Views
              </p>
              <p className="text-xl font-bold text-gray-900">
                {totalViews.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Average Applications */}
          <div className="bg-white rounded-md border border-gray-200 p-3 flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-md flex-shrink-0">
              <Target className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 mb-0.5">
                Avg per Job
              </p>
              <p className="text-xl font-bold text-gray-900">{avgApplicants}</p>
            </div>
          </div>
        </div>

        {/* Expired Jobs Notifications */}
        {expiredJobNotifications.length > 0 && (
          <div className="space-y-3">
            {expiredJobNotifications.map((notification) => (
              <div
                key={notification._id}
                className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900">
                        Job Posting Expired
                      </h4>
                      <p className="text-sm text-amber-800 mt-1">
                        <span className="font-medium">
                          {notification.metadata?.jobTitle || "Job"}
                        </span>{" "}
                        ended on{" "}
                        {notification.metadata?.endDate &&
                          new Date(
                            notification.metadata.endDate
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        . Would you like to close this job posting?
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleDismissNotification(notification._id)
                      }
                      className="text-amber-600 hover:text-amber-800 transition-colors p-1"
                      aria-label="Dismiss notification"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleCloseJob(
                          notification.relatedJobId!,
                          notification._id
                        )
                      }
                      className="bg-amber-600 hover:bg-amber-700 text-white text-sm h-9 px-4"
                    >
                      Close Job
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleDismissNotification(notification._id)
                      }
                      className="border-amber-300 text-amber-700 hover:bg-amber-100 text-sm h-9 px-4"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-md border border-gray-200">
          <div className="p-4">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "grid" | "list")}
            >
              <div className="space-y-4">
                {/* Search Bar and View Toggle */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  {/* Search */}
                  <div className="flex-1 max-w-2xl">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                      <Input
                        placeholder="Search by job title, location..."
                        value={(searchQuery as string) || ""}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  {/* View Toggle */}
                  <div className="inline-flex bg-gray-100 rounded-md p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`inline-flex items-center justify-center px-4 py-2 rounded text-sm font-medium transition-all ${
                        viewMode === "grid"
                          ? "bg-white text-gray-900"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`inline-flex items-center justify-center px-4 py-2 rounded text-sm font-medium transition-all ${
                        viewMode === "list"
                          ? "bg-white text-gray-900"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <List className="w-4 h-4 mr-2" />
                      List
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Active/Closed Status Toggle */}
                    <div className="inline-flex bg-gray-100 rounded-md p-1 border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setStatusFilter("all")}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                          statusFilter === "all"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        All Jobs
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("active")}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                          statusFilter === "active"
                            ? "bg-green-50 text-green-700 shadow-sm border border-green-200"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusFilter("closed")}
                        className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                          statusFilter === "closed"
                            ? "bg-gray-50 text-gray-700 shadow-sm border border-gray-200"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Closed
                      </button>
                    </div>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[150px] h-10">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={departmentFilter}
                      onValueChange={setDepartmentFilter}
                    >
                      <SelectTrigger className="w-[160px] h-10">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {uniqueDepartments.map((department) => (
                          <SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Results */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {filteredJobsFinal.length}{" "}
                      {filteredJobsFinal.length === 1 ? "job" : "jobs"}
                    </Badge>
                    {(hasSearchQuery ||
                      typeFilter !== "all" ||
                      statusFilter !== "all" ||
                      departmentFilter !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleClearSearch();
                          setTypeFilter("all");
                          setStatusFilter("all");
                          setDepartmentFilter("all");
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm h-10"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <TabsContent value="grid" className="mt-6">
                {loading ? (
                  <JobsGridSkeleton />
                ) : filteredJobsFinal.length > 0 ? (
                  <JobsGrid
                    jobs={filteredJobsFinal}
                    onEdit={handleJobEdit}
                    onDelete={handleJobDelete}
                    onClose={handleJobCardClose}
                  />
                ) : (
                  <EmptyJobsState
                    onClearFilters={() => {
                      handleClearSearch();
                      setTypeFilter("all");
                      setStatusFilter("all");
                      setDepartmentFilter("all");
                    }}
                    hasFilters={
                      hasSearchQuery ||
                      typeFilter !== "all" ||
                      statusFilter !== "all" ||
                      departmentFilter !== "all"
                    }
                  />
                )}
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                {loading ? (
                  <JobsListViewSkeleton />
                ) : filteredJobsFinal.length > 0 ? (
                  <JobsList
                    jobs={filteredJobsFinal}
                    onEdit={handleJobEdit}
                    onDelete={handleJobDelete}
                    onClose={handleJobCardClose}
                  />
                ) : (
                  <EmptyJobsState
                    onClearFilters={() => {
                      handleClearSearch();
                      setTypeFilter("all");
                      setStatusFilter("all");
                      setDepartmentFilter("all");
                    }}
                    hasFilters={
                      hasSearchQuery ||
                      typeFilter !== "all" ||
                      statusFilter !== "all" ||
                      departmentFilter !== "all"
                    }
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Pagination */}
        {!loading && filteredJobs.length > 0 && pageParams.totalRows > 0 && (
          <div className="bg-white rounded-md border border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {pageParams.totalRows === 1 ? (
                  <>
                    <span>Showing</span>
                    <span className="font-semibold text-gray-900">1</span>
                    <span>result</span>
                  </>
                ) : (
                  <>
                    <span>Showing</span>
                    <span className="font-semibold text-gray-900">
                      {(pageParams.currentPage - 1) * pageParams.pageSize + 1}
                    </span>
                    <span>to</span>
                    <span className="font-semibold text-gray-900">
                      {Math.min(
                        pageParams.currentPage * pageParams.pageSize,
                        pageParams.totalRows
                      )}
                    </span>
                    <span>of</span>
                    <span className="font-semibold text-gray-900">
                      {pageParams.totalRows}
                    </span>
                    <span>results</span>
                  </>
                )}
              </div>

              <div className="ml-auto">
                <PaginationButton {...pageParams} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {jobToDelete && (
        <DeleteJobModal
          job={jobToDelete}
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
