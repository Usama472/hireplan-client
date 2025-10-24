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
import { 
  Briefcase, 
  Grid3X3, 
  List, 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Eye,
  Users,
  Target,
  Building2,
  ArrowUpRight,
  AlertCircle,
  X as CloseIcon
} from "lucide-react";
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
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { data: session } = useAuthSessionContext();
  const company = session?.user?.company;
  
  // Get expired job notifications from the notification system
  const { expiredJobNotifications, refetch: refetchNotifications } = useNotifications();

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

  const jobsWithLocation = jobs.map((job) => ({
    ...job,
    location: job.jobLocation
      ? `${job.jobLocation.city}, ${job.jobLocation.state}`
      : "Remote",
  }));

  // Get unique locations for filter
  const uniqueLocations = Array.from(
    new Set(
      jobsWithLocation
        .map((job) => job.location)
        .filter((loc) => loc !== "Location not specified")
    )
  ).sort();

  // Apply location filter
  const filteredJobs = locationFilter === "all" 
    ? jobsWithLocation 
    : jobsWithLocation.filter((job) => job.location === locationFilter);

  const totalApplicants = filteredJobs.reduce((total, job) => total + (job.applicantsCount || 0), 0);
  const totalViews = filteredJobs.reduce((total, job) => total + (job.views || 0), 0);
  const avgApplicants = filteredJobs.length > 0 ? Math.round(totalApplicants / filteredJobs.length) : 0;

  return (
    <div className="min-h-full bg-gray-50/50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Title Section */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg shadow-sm">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Job Postings
                </h1>
                <p className="text-gray-600 text-xs">
                  Manage your active listings
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5">
              <Button
                onClick={async () => {
                  let slug = (company as any)?.slug;
                  if (!slug && (company as any)?._id) {
                    // Fallback: fetch company slug from API
                    try {
                      const response = await API.company.getCompanySlug((company as any)._id);
                      slug = response?.slug;
                    } catch (error) {
                      console.error('Error fetching company slug:', error);
                    }
                  }
                  if (slug) {
                    navigate(`/company/${slug}`);
                  } else {
                    toast.error('Company career page not available. Please contact support.');
                  }
                }}
                variant="outline"
                className="hover:bg-gray-50 border-gray-300 gap-1.5 h-8 px-2.5 text-xs"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Career Page</span>
              </Button>
              {canCreateJob && (
                <Button
                  onClick={() => navigate(ROUTES.DASHBOARD.CREATE_JOB)}
                  className="bg-primary hover:bg-primary/90 gap-1.5 h-8 px-2.5 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Create Job</span>
                  <span className="sm:hidden">New</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 space-y-3">
        {/* Compact Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-2.5">
          {/* Active Jobs */}
          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300">
              <div className="p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-blue-50 rounded-md group-hover:bg-blue-100 transition-colors">
                  <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                </span>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-0.5">Active Jobs</p>
              <p className="text-xl font-bold text-gray-900">{filteredJobs.length}</p>
            </div>
          </div>

          {/* Total Applications */}
          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300">
            <div className="p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-purple-50 rounded-md group-hover:bg-purple-100 transition-colors">
                  <Users className="h-3.5 w-3.5 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-0.5">Applications</p>
              <p className="text-xl font-bold text-gray-900">{totalApplicants}</p>
            </div>
          </div>

          {/* Total Views */}
          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300">
            <div className="p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-emerald-50 rounded-md group-hover:bg-emerald-100 transition-colors">
                  <Eye className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                </span>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-0.5">Job Views</p>
              <p className="text-xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
            </div>
          </div>

          {/* Average Applications */}
          <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-300">
            <div className="p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="p-1.5 bg-amber-50 rounded-md group-hover:bg-amber-100 transition-colors">
                  <Target className="h-3.5 w-3.5 text-amber-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-0.5">Avg per Job</p>
              <p className="text-xl font-bold text-gray-900">{avgApplicants}</p>
            </div>
          </div>
        </div>

        {/* Expired Jobs Notifications */}
        {expiredJobNotifications.length > 0 && (
          <div className="space-y-2">
            {expiredJobNotifications.map((notification) => (
              <div
                key={notification._id}
                className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-amber-900">
                        Job Posting Expired
                      </h4>
                      <p className="text-sm text-amber-800 mt-0.5">
                        <span className="font-medium">{notification.metadata?.jobTitle || 'Job'}</span> ended on{" "}
                        {notification.metadata?.endDate && new Date(notification.metadata.endDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        . Would you like to close this job posting?
                      </p>
                    </div>
                    <button
                      onClick={() => handleDismissNotification(notification._id)}
                      className="text-amber-600 hover:text-amber-800 transition-colors p-1"
                      aria-label="Dismiss notification"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleCloseJob(notification.relatedJobId!, notification._id)}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7"
                    >
                      Close Job
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismissNotification(notification._id)}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs h-7"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compact Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-2.5">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "grid" | "list")}
            >
              <div className="space-y-2.5">
                {/* Search Bar and View Toggle */}
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                  {/* Search */}
                  <div className="flex-1 max-w-2xl">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <SearchBar
                        placeholder="Search by job title, location..."
                        onSearch={handleSearch}
                        onClear={handleClearSearch}
                        searchQuery={searchQuery as string}
                      />
                    </div>
                  </div>

                  {/* View Toggle */}
                  <div className="inline-flex bg-gray-100 rounded-md p-0.5">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        viewMode === "grid"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Grid3X3 className="w-3 h-3 mr-1" />
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <List className="w-3 h-3 mr-1" />
                      List
                    </button>
                  </div>
                </div>

                {/* Compact Filters */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 border-gray-300">
                      <Filter className="w-3.5 h-3.5" />
                      All Statuses
                    </Button>
                    <select className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all h-8">
                      <option value="">All Types</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                    <select 
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all h-8"
                    >
                      <option value="all">All Locations</option>
                      {uniqueLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <select className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all h-8">
                      <option value="">Sort: Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="most-applicants">Most Apps</option>
                      <option value="least-applicants">Least Apps</option>
                    </select>
                  </div>

                  {/* Results */}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                    </Badge>
                    {(hasSearchQuery || locationFilter !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleClearSearch();
                          setLocationFilter("all");
                        }}
                        className="text-primary hover:text-primary/80 text-xs h-7"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <TabsContent value="grid" className="mt-6">
                {loading ? (
                  <JobsGridSkeleton />
                ) : filteredJobs.length > 0 ? (
                  <JobsGrid
                    jobs={filteredJobs}
                    onEdit={handleJobEdit}
                    onDelete={handleJobDelete}
                    onClose={handleJobCardClose}
                  />
                ) : (
                  <EmptyJobsState
                    onClearFilters={() => {
                      handleClearSearch();
                      setLocationFilter("all");
                    }}
                    hasFilters={hasSearchQuery || locationFilter !== "all"}
                  />
                )}
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                {loading ? (
                  <JobsListSkeleton />
                ) : filteredJobs.length > 0 ? (
                  <JobsList
                    jobs={filteredJobs}
                    onEdit={handleJobEdit}
                    onDelete={handleJobDelete}
                    onClose={handleJobCardClose}
                  />
                ) : (
                  <EmptyJobsState
                    onClearFilters={() => {
                      handleClearSearch();
                      setLocationFilter("all");
                    }}
                    hasFilters={hasSearchQuery || locationFilter !== "all"}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Compact Pagination */}
        {!loading && filteredJobs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Showing</span>
                <span className="font-semibold text-gray-900">
                  {Math.min((pageParams.currentPage - 1) * pageParams.pageSize + 1, pageParams.totalRows || 0)}
                </span>
                to
                <span className="font-semibold text-gray-900">
                  {Math.min(pageParams.currentPage * pageParams.pageSize, pageParams.totalRows || 0)}
                </span>
                of
                <span className="font-semibold text-gray-900">{pageParams.totalRows || 0}</span>
              </div>

              <PaginationButton {...pageParams} />
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
