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
    <div className="min-h-full bg-gray-50/30">
      <div className="space-y-6 sm:space-y-8">
        {/* Enhanced Header - Professional Mobile UI */}
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Title Section - Improved Visual Hierarchy */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-3 sm:p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex-shrink-0 border border-primary/10">
                  <Briefcase className="h-5 sm:h-5 lg:h-6 w-5 sm:w-5 lg:w-6 text-primary" />
                </div>
                <div className="flex flex-col min-w-0 flex-1 justify-center">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-1">
                    Job Postings
                  </h1>
                  <div className="flex items-center gap-3">
                    <span className="text-sm sm:text-sm text-gray-600">
                      Manage and track your postings
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary font-medium text-xs px-2 py-0.5 rounded-full border border-primary/20"
                    >
                      {jobs.length} active
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Professional Touch Targets */}
              <div className="flex items-center gap-3 w-full">
                <Button
                  onClick={() => navigate(`/company/${company?.slug}`)}
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 gap-2 px-4 sm:px-6 font-medium transition-all duration-200 text-sm flex-1 sm:flex-initial h-11 sm:h-10 rounded-md shadow-none"
                >
                  <span className="hidden sm:inline">Website View</span>
                  <span className="sm:hidden">View Site</span>
                </Button>
                {canCreateJob && (
                  <Button
                    onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
                    variant="secondary"
                    className="text-white border-0 transition-all duration-200 gap-2 px-4 sm:px-6 font-medium flex-1 sm:flex-initial h-11 sm:h-10 rounded-md shadow-none"
                  >
                    <Plus className="w-4 sm:w-4 h-4 sm:h-4" />
                    <span className="hidden sm:inline">Create Job</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Section - Professional Mobile Design */}
        <div className="px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-6 mb-6 sm:mb-8">
            {/* Active Jobs Card */}
            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1">
                    Active Jobs
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {jobs.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                    Currently posted
                  </p>
                </div>
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 self-end sm:self-auto">
                  <Briefcase className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Applications Card */}
            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1">
                    Applications
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {jobs.reduce(
                      (total, job) => total + (job.applicantsCount || 0),
                      0
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                    Across all jobs
                  </p>
                </div>
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 self-end sm:self-auto">
                  <svg
                    className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-blue-600"
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
            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1">
                    Views
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {jobs.reduce((total, job) => total + (job.views || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                    Last 30 days
                  </p>
                </div>
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 self-end sm:self-auto">
                  <svg
                    className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-purple-600"
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
            <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1">
                    Avg Apps
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {jobs.length > 0
                      ? Math.round(
                          jobs.reduce(
                            (total, job) => total + (job.applicantsCount || 0),
                            0
                          ) / jobs.length
                        )
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">
                    Per job posting
                  </p>
                </div>
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 self-end sm:self-auto">
                  <svg
                    className="h-4 sm:h-5 lg:h-6 w-4 sm:w-5 lg:w-6 text-orange-600"
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
          {/* Search and Controls Section - Professional Mobile UX */}
          <div className="mb-6 sm:mb-8">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "grid" | "list")}
            >
              {/* Enhanced Search and View Controls */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Search Bar */}
                  <div className="flex-1 max-w-full sm:max-w-lg">
                    <div className="relative">
                      <SearchBar
                        placeholder="Search jobs by title, location..."
                        onSearch={handleSearch}
                        onClear={handleClearSearch}
                        searchQuery={searchQuery as string}
                      />
                    </div>
                  </div>

                  {/* View Mode Tabs - Professional Design */}
                  <div className="flex items-center justify-center sm:justify-end">
                    <div className="inline-flex bg-gray-50 border border-gray-200 rounded-xl p-1 gap-1 shadow-sm">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[44px] h-10 ${
                          viewMode === "grid"
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">Grid</span>
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[44px] h-10 ${
                          viewMode === "list"
                            ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                        }`}
                      >
                        <List className="w-4 h-4" />
                        <span className="hidden sm:inline ml-2">List</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Additional Filters Row */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  {/* Filter Options */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed</option>
                    </select>
                    
                    <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">All Types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>

                    <select className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">Sort by</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="most-applicants">Most Applicants</option>
                      <option value="least-applicants">Least Applicants</option>
                      <option value="highest-salary">Highest Salary</option>
                      <option value="lowest-salary">Lowest Salary</option>
                    </select>
                  </div>

                  {/* Results Summary */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{hasSearchQuery && "Filtered:"}</span>
                    <span className="font-medium text-gray-900">{jobs.length}</span>
                    <span>job{jobs.length !== 1 ? 's' : ''}</span>
                    {hasSearchQuery && (
                      <button 
                        onClick={handleClearSearch}
                        className="text-primary hover:text-primary/80 font-medium ml-2"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <TabsContent value="grid" className="space-y-4 sm:space-y-6">
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

              <TabsContent value="list" className="space-y-2 sm:space-y-4">
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

          {/* Enhanced Pagination with Page Info */}
          {!loading && hasJobs && (
            <div className="mt-8 sm:mt-10 space-y-4">
              {/* Pagination Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    Showing
                  </span>
                  <span className="font-medium text-gray-900">
                    {Math.min((pageParams.currentPage - 1) * pageParams.pageSize + 1, pageParams.totalRows || 0)}
                  </span>
                  to 
                  <span className="font-medium text-gray-900">
                    {Math.min(pageParams.currentPage * pageParams.pageSize, pageParams.totalRows || 0)}
                  </span>
                  of 
                  <span className="font-medium text-gray-900">
                    {pageParams.totalRows || 0}
                  </span>
                  jobs
                </div>
                
                {/* Page size selector for larger screens */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <span>Jobs per page:</span>
                  <select 
                    value={pageParams.pageSize}
                    onChange={(e) => {
                      // This would need to be implemented in the pagination hook
                      console.log('Page size changed to:', e.target.value);
                    }}
                    className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={36}>36</option>
                  </select>
                </div>
              </div>
              
              {/* Pagination Controls */}
              <div className="flex justify-center">
                <PaginationButton {...pageParams} className="bg-white rounded-lg border border-gray-100 px-4 py-3" />
              </div>
            </div>
          )}
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
