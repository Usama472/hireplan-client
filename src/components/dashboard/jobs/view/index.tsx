"use client";

import { DeleteJobModal } from "@/components/dashboard/jobs/delete-job-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants";
import API from "@/http";
import type { JobFormDataWithId } from "@/interfaces";
import { errorResolver } from "@/lib/utils";
import { AlertCircle, ArrowLeft, Edit, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ReviewPublishStep } from "@/components/dashboard/jobs/common/review-publish-step";
import { FormProvider, useForm } from "react-hook-form";
import { type JobFormSchema } from "@/lib/validations/forms/job-form-schema";
import { JOB_FORM_DEFAULT_VALUES } from "@/constants/job-form-defaults";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface JobDetailsResponse {
  job: JobFormDataWithId;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isRetrying: boolean;
}

// Loading skeleton for the review component
const ReviewSkeleton = () => (
  <div className="max-w-7xl mx-auto px-6 pb-8">
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <Skeleton className="h-32 w-full" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  </div>
);

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [job, setJob] = useState<JobFormDataWithId | null>(null);

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
    isRetrying: false,
  });

  // Set up form with job data
  const form = useForm<JobFormSchema>({
    defaultValues: job ? job : JOB_FORM_DEFAULT_VALUES,
    mode: "onChange",
  });

  // Update form values when job data is loaded
  useEffect(() => {
    if (job) {
      Object.keys(job).forEach((key) => {
        form.setValue(key as keyof JobFormSchema, (job as any)[key]);
      });
    }
  }, [job, form]);

  const fetchJobDetails = useCallback(
    async (showRetryIndicator = false) => {
      if (!id) {
        setLoadingState({
          isLoading: false,
          error: "Job ID is required",
          isRetrying: false,
        });
        return;
      }

      try {
        setLoadingState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
          isRetrying: showRetryIndicator,
        }));

        const response: JobDetailsResponse = await API.job.getJobDetails(id);

        if (!response?.job) {
          throw new Error("Job not found");
        }

        const jobData = {
          ...response.job,
          startDate: new Date(response.job.startDate),
          endDate: new Date(response.job.endDate),
        };

        setJob(jobData);
        setLoadingState({
          isLoading: false,
          error: null,
          isRetrying: false,
        });
      } catch (error) {
        const errorMessage = errorResolver(error);
        console.error("Error fetching job details:", error);

        setLoadingState({
          isLoading: false,
          error: errorMessage,
          isRetrying: false,
        });

        toast.error(`Failed to load job details: ${errorMessage}`);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const handleRetry = () => {
    fetchJobDetails(true);
  };

  const handleEdit = () => {
    if (!job?.id) return;
    navigate(`${ROUTES.DASHBOARD.EDIT_JOB}/${job.id}`);
  };

  const handleDelete = async (jobToDelete: JobFormDataWithId) => {
    if (!jobToDelete?.id) return;

    setIsDeleting(true);
    try {
      await API.job.deleteJob(jobToDelete.id);
      toast.success("Job deleted successfully");
      navigate("/dashboard/jobs");
    } catch (error) {
      const errorMessage = errorResolver(error);
      console.error("Error deleting job:", error);
      toast.error(`Failed to delete job: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Loading state
  if (loadingState.isLoading && !loadingState.isRetrying) {
    return (
      <div className="min-h-screen">
        <ReviewSkeleton />
      </div>
    );
  }

  // Error state
  if (loadingState.error && !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/jobs")}
            className="mb-4 sm:mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Jobs</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md shadow-none">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Failed to Load Job
                </h3>
                <p className="text-gray-600 mb-4">{loadingState.error}</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleRetry}
                    disabled={loadingState.isRetrying}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loadingState.isRetrying ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {loadingState.isRetrying ? "Retrying..." : "Try Again"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard/jobs")}
                  >
                    Back to Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/jobs")}
            className="mb-4 sm:mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Jobs</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md shadow-none">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Job Not Found
                </h3>
                <p className="text-gray-600 mb-4">
                  The job you're looking for doesn't exist or has been removed.
                </p>
                <Button
                  onClick={() => navigate("/dashboard/jobs")}
                  className="bg-primary hover:bg-primary/90"
                >
                  Back to Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen">
        {/* Retry indicator */}
        {loadingState.isRetrying && (
          <Alert className="mb-4 border-blue-200 bg-blue-50 rounded-lg">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-800">
              Refreshing job details...
            </AlertDescription>
          </Alert>
        )}

        {/* Professional Header - Mobile Optimized */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden mb-4 sm:mb-6">
          <div className="relative z-10">
            {/* Mobile Header */}
            <div className="block sm:hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <Edit className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="text-base font-semibold text-gray-900 leading-tight truncate">
                    {job.jobTitle || "Job Review"}
                  </h1>
                  <span className="text-xs text-gray-600">
                    Review and manage job details
                  </span>
                </div>
              </div>
              
              {/* Mobile Action Buttons */}
              <div className="flex items-center gap-2 w-full">
                <Button
                  onClick={handleEdit}
                  className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 gap-2 px-3 py-2 font-medium transition-all duration-200 text-sm flex-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Job</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-50 text-red-600 border border-red-200 hover:border-red-300 gap-2 px-3 py-2 font-medium transition-all duration-200 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <Edit className="h-4 w-4 text-gray-600" />
                </div>

                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                    {job.jobTitle || "Job Review"}
                  </h1>
                  <span className="text-xs text-gray-600 mt-0.5">
                    Review and manage job details
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleEdit}
                      className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300 gap-2 px-4 py-2 font-medium transition-all duration-200 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Job
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit job posting</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-50 text-red-600 border border-red-200 hover:border-red-300 gap-2 px-4 py-2 font-medium transition-all duration-200 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete job posting</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Mobile Optimized */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <FormProvider {...form}>
            <ReviewPublishStep
              mode="review"
              showHeader={false}
              isSubmitting={false}
              jobId={job.id}
              jobViews={job.views || 0}
              onSave={() => {
                toast.success("Job updated successfully!");
                navigate("/dashboard/jobs");
              }}
            />
          </FormProvider>
        </div>

        {job && (
          <DeleteJobModal
            job={job}
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
