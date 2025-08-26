"use client";

import PaginationButton from "@/components/common/PaginationButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants";
import API from "@/http";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { usePaginationQuery } from "@/lib/hooks/usePaginateQuery";
import { errorResolver } from "@/lib/utils";
import { Plus } from "lucide-react";
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
import type { JobFormDataWithId } from "@/interfaces";

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
    <div className="min-h-screen bg-white">
      <div className="space-y-6 px-6 py-4">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 px-6 py-6 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
              <p className="text-gray-600 flex items-center gap-2">
                Manage and track your job postings and applications
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {jobs.length} active
                </Badge>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl h-11 px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Create Job
            </Button>
            <Button
              onClick={() => navigate(`/company/${company?.slug}`)}
              variant="outline"
              className="bg-white border-gray-200 hover:bg-gray-50 gap-2 rounded-xl h-11 px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              Website View
            </Button>
          </div>
        </div>

        <div className="px-2">
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
                    <TabsList className="grid w-fit grid-cols-2">
                      <TabsTrigger value="grid">Grid</TabsTrigger>
                      <TabsTrigger value="list">List</TabsTrigger>
                    </TabsList>
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
