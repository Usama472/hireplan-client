"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/constants";
import API from "@/http";
import type { Job } from "@/interfaces";
import { usePaginationQuery } from "@/lib/hooks/usePaginateQuery";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { EmptyJobsState } from "./empty-jobs-state";
import { JobsGrid } from "./jobs-grid";
import { JobsList } from "./jobs-list";
import { SearchBar } from "./search-bar";
import PaginationButton from "@/components/common/PaginationButton";
import { JobsGridSkeleton } from "./job-card-skeleton";
import { JobsListSkeleton } from "./job-list-item-skeleton";

interface JobsResponse {
  jobs: {
    results: Job[];
    limit: number;
    page: number;
    totalPages: number;
    totalResults: number;
  };
}

export default function JobsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();

  const {
    data: jobsData,
    loading,
    pageParams,
    filters: { setSearchQuery, searchQuery },
  } = usePaginationQuery({
    key: "queryJobs",
    limit: 1,
    fetchFun: API.job.getJobs,
    parseResponse: (data: JobsResponse) => data.jobs,
  });

  const handleJobEdit = (job: Job) => {
    console.log("Edit job:", job.id);
  };

  const handleJobDelete = (job: Job) => {
    console.log("Delete job:", job.id);
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
    <div className="min-h-screen bg-gray-50">
      <main className="pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Job Postings
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and track your job postings and applications
                </p>
              </div>
              <Button
                onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
                className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            </div>

            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "grid" | "list")}
            >
              {/* Search and View Controls */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Search Bar */}
                  <div className="flex-1 max-w-md">
                    <SearchBar
                      placeholder="Search jobs by title, company, or location..."
                      onSearch={handleSearch}
                      onClear={handleClearSearch}
                      initialValue={searchQuery || ""}
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
      </main>
    </div>
  );
}
