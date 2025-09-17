"use client";

import PaginationButton from "@/components/common/PaginationButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ROUTES } from "@/constants";
import { PERMISSIONS } from "@/constants/permissions";
import API from "@/http";
import type { JobFormDataWithId } from "@/interfaces";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { usePaginationQuery } from "@/lib/hooks/usePaginateQuery";
import usePermission from "@/lib/hooks/usePermission";
import { errorResolver } from "@/lib/utils";
import { Briefcase, Grid3X3, List, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { DeleteJobModal } from "./delete-job-modal";
import { EmptyJobsState } from "./empty-jobs-state";
import { JobsGridSkeleton } from "./job-card-skeleton";
import { JobsListSkeleton } from "./job-list-item-skeleton";
import { JobsGrid } from "./jobs-grid";
import { JobsList } from "./jobs-list";
import { SearchBar } from "./search-bar";

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
  const navigate = useNavigate();
  const { data: session } = useAuthSessionContext();
  const company = session?.user?.company;

  const {
    data: jobsData,
    loading,
    pageParams,
    refetch,
    filters: { setSearchQuery, searchQuery },
  } = usePaginationQuery({
    key: "queryJobs",
    limit: 12,
    fetchFun: API.job.getJobs,
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

      // Refetch the jobs list to update the UI
      await refetch();

      // Close the modal
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
    if (isDeleting) return; // Prevent closing while deleting
    setShowDeleteModal(false);
    setJobToDelete(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Get jobs array from pagination data
  const jobs = jobsData || [];
  const hasJobs = jobs.length > 0;
  const hasSearchQuery = searchQuery !== "";

  // Compute location string for each job
  const jobsWithLocation = jobs.map((job) => ({
    ...job,
    location: job.jobLocation
      ? `${job.jobLocation.city}, ${job.jobLocation.state}`
      : "Location not specified",
  }));

  return (
    <div className="min-h-full">
      <div className="space-y-4 sm:space-y-6">
        {/* Enhanced Header - Mobile Optimized */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col gap-4">
              {/* Title and Description */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 sm:p-3 bg-gray-100 rounded-xl flex-shrink-0">
                  <Briefcase className="h-5 sm:h-6 w-5 sm:w-6 text-gray-600" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    Job Postings
                  </h1>
                  <div className="text-gray-600 flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm">Manage and track your job postings</span>
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 text-xs"
                    >
                      {jobs.length} active
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full">
                <Button
                  onClick={() => navigate(`/company/${company?.slug}`)}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 gap-2 px-3 sm:px-4 font-medium transition-all duration-200 text-sm shadow-sm flex-1 sm:flex-initial"
                >
                  <span className="hidden sm:inline">Website View</span>
                  <span className="sm:hidden">View Site</span>
                </Button>
                {canCreateJob && (
                  <Button
                    onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 gap-2 px-3 sm:px-4 flex-1 sm:flex-initial"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create Job</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Section - Mobile Optimized */}
        <div className="px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Active Jobs Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    Active Jobs
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {jobs.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Currently posted</p>
                </div>
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Applications Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    Total Applications
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {jobs.reduce(
                      (total, job) => total + (job.applicantsCount || 0),
                      0
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Across all jobs</p>
                </div>
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Recent Views Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    Recent Views
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {jobs.reduce((total, job) => total + (job.views || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Average Applications Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    Avg Applications
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {jobs.length > 0
                      ? Math.round(
                          jobs.reduce(
                            (total, job) => total + (job.applicantsCount || 0),
                            0
                          ) / jobs.length
                        )
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Per job posting</p>
                </div>
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="h-5 sm:h-6 w-5 sm:w-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6">
          {/* Search and Controls Section - Mobile Optimized */}
          <div className="mb-6 sm:mb-8">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "grid" | "list")}
            >
              {/* Enhanced Search and View Controls */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  {/* Search Bar */}
                  <div className="flex-1 max-w-full sm:max-w-lg">
                    <SearchBar
                      placeholder="Search jobs..."
                      onSearch={handleSearch}
                      onClear={handleClearSearch}
                      searchQuery={searchQuery as string}
                    />
                  </div>

                  {/* View Mode Tabs */}
                  <div className="flex items-center justify-center sm:justify-end">
                    <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-all duration-300 ease-in-out ${
                          viewMode === "grid"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-all duration-300 ease-in-out ${
                          viewMode === "list"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <TabsContent value="grid" className="space-y-6">
                {loading ? (
                  <JobsGridSkeleton />
                ) : hasJobs ? (
                  <JobsGrid
                    jobs={jobsWithLocation}
                    onEdit={handleJobEdit}
                    onDelete={handleJobDelete}
                  />
                ) : (
                  <EmptyJobsState
                    onClearFilters={handleClearSearch}
                    hasFilters={hasSearchQuery}
                  />
                )}
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                {loading ? (
                  <JobsListSkeleton />
                ) : hasJobs ? (
                  <JobsList
                    jobs={jobsWithLocation}
                    onEdit={handleJobEdit}
                    onDelete={handleJobDelete}
                  />
                ) : (
                  <EmptyJobsState
                    onClearFilters={handleClearSearch}
                    hasFilters={hasSearchQuery}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Pagination - Only show when not loading and has jobs */}
          {!loading && hasJobs && <PaginationButton {...pageParams} />}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
