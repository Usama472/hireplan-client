"use client";

import PaginationButton from "@/components/common/PaginationButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ROUTES } from "@/constants";
import API from "@/http";
import type { JobFormDataWithId } from "@/interfaces";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { usePaginationQuery } from "@/lib/hooks/usePaginateQuery";
import { errorResolver } from "@/lib/utils";
import { Plus, Briefcase, Grid3X3, List } from "lucide-react";
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
      <div className="space-y-6">
        {/* Enhanced Header - Matching Navbar Style */}
        <div className="bg-primary border-b border-primary/20 px-6 py-4 relative overflow-hidden max-h-[80px]">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-white">Job Postings</h1>
                  <p className="text-sm text-white/80 flex items-center gap-3">
                    Manage and track your job postings and applications
                    <Badge
                      variant="secondary"
                      className="bg-white/20 text-white border-white/20 text-xs"
                    >
                      {jobs.length} active
                    </Badge>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate(`/company/${company?.slug}`)}
                  variant="outline"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/20 gap-2 px-5 font-medium backdrop-blur-sm transition-all duration-200 text-sm"
                >
                  Website View
                </Button>
                <Button
                  onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
                  variant="secondary"
                  className="border border-secondary shadow-none "
                >
                  <Plus className="w-4 h-4" />
                  Create Job
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Active Jobs Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Active Jobs
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {jobs.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Currently posted</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Total Applications Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Applications
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {jobs.reduce(
                      (total, job) => total + (job.applicantsCount || 0),
                      0
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Across all jobs</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-blue-600"
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
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Recent Views
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {jobs.reduce((total, job) => total + (job.views || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
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
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Avg Applications
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
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
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-orange-600"
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

        <div className="px-6">
          {/* Search and Controls Section */}
          <div className="mb-8">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "grid" | "list")}
            >
              {/* Enhanced Search and View Controls */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Search Bar */}
                  <div className="flex-1 max-w-lg">
                    <SearchBar
                      placeholder="Search jobs by title, company, or location..."
                      onSearch={handleSearch}
                      onClear={handleClearSearch}
                      searchQuery={searchQuery as string}
                    />
                  </div>

                  {/* View Mode Tabs */}
                  <div className="flex items-center justify-between lg:justify-end">
                    <div className="flex bg-white border border-gray-200 rounded-lg p-1 gap-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-all duration-300 ease-in-out transform ${
                          viewMode === "grid"
                            ? "bg-primary text-white scale-105"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-105"
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4 transition-transform duration-300" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-all duration-300 ease-in-out transform ${
                          viewMode === "list"
                            ? "bg-primary text-white shadow-sm scale-105"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-105"
                        }`}
                      >
                        <List className="w-4 h-4 transition-transform duration-300" />
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
