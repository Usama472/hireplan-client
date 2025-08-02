"use client";

import { DeleteJobModal } from "@/components/dashboard/jobs/delete-job-modal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import API from "@/http";
import type { JobFormData } from "@/interfaces";
import { errorResolver } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  FileText,
  MapPin,
  RefreshCw,
  Settings,
  Share2,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ApplicantsSection } from "./applicants-section";
import { ROUTES } from "@/constants";

interface JobDetailsResponse {
  job: JobFormData & {
    id: string;
    createdAt: string;
    updatedAt: string;
    applicantsCount: number;
    views?: number;
  };
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isRetrying: boolean;
}

const formatSalary = (job: JobFormData) => {
  if (!job.payType) return "Not specified";

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

const formatDate = (dateString: Date) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDaysUntilDeadline = (endDate: Date) => {
  const today = new Date();
  const deadline = new Date(endDate);
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getPriorityLabel = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "High Priority";
    case "medium":
      return "Medium Priority";
    case "low":
      return "Low Priority";
    default:
      return "Standard";
  }
};

const getWorkplaceLabel = (type: string) => {
  switch (type?.toLowerCase()) {
    case "remote":
      return "Remote";
    case "hybrid":
      return "Hybrid";
    case "onsite":
      return "On-site";
    default:
      return type;
  }
};

// Add default values helper function
const getJobDefaults = (job: JobDetailsResponse["job"] | null) => {
  if (!job) return null;

  return {
    ...job,
    applicantsCount: job.applicantsCount || 0,
    views: job.views || 0,
    automation: job.automation || {
      enabledRules: [],
      aiRules: [],
    },
    externalApplicationSetup: job.externalApplicationSetup || {
      customFields: [],
      redirectUrl: "",
    },
    jobRequirements: job.jobRequirements || [],
    payRate: job.payRate || {
      type: "fixed",
      amount: 0,
      min: 0,
      max: 0,
    },
    jobLocation: job.jobLocation || {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  };
};

// Simplified loading skeleton
const LoadingSkeleton = () => (
  <div className="max-w-6xl mx-auto space-y-8">
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-12 w-96" />
      <div className="flex gap-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-28" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  </div>
);

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [job, setJob] = useState<JobDetailsResponse["job"] | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
    isRetrying: false,
  });

  const fetchJobDetails = async (showRetryIndicator = false) => {
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

      setJob(response.job);
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
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const handleRetry = () => {
    fetchJobDetails(true);
  };

  const handleEdit = () => {
    if (!job?.id) return;
    navigate(`${ROUTES.DASHBOARD.EDIT_JOB}/${job.id}`);
  };

  const handleShare = () => {
    if (!job?.id) return;
    const url = `${window.location.origin}/jobs/${job.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Job link copied to clipboard!");
  };

  const handleDelete = async (jobToDelete: JobDetailsResponse["job"]) => {
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (loadingState.error && !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/jobs")}
            className="mb-8 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
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

  // Get safe job data with defaults
  const safeJob = getJobDefaults(job);

  if (!safeJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/jobs")}
            className="mb-8 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Job Not Found
                </h3>
                <p className="text-gray-600 mb-4">
                  The job you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => navigate("/dashboard/jobs")}>
                  Back to Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const salary = formatSalary(safeJob);
  const daysLeft = safeJob.endDate
    ? getDaysUntilDeadline(safeJob.endDate)
    : null;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Retry indicator */}
          {loadingState.isRetrying && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <AlertDescription className="text-blue-800">
                Refreshing job details...
              </AlertDescription>
            </Alert>
          )}

          {/* Navigation */}
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/jobs")}
            className="mb-8 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 mb-8">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="outline" className="text-sm">
                      {getPriorityLabel(safeJob.jobStatus)}
                    </Badge>
                    {daysLeft !== null && (
                      <Badge
                        variant={daysLeft <= 7 ? "destructive" : "secondary"}
                        className="text-sm"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                          ? "Expires today"
                          : "Expired"}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    {safeJob.jobTitle}
                  </h1>

                  <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{safeJob.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {safeJob.workplaceType === "remote"
                          ? "Remote"
                          : `${safeJob.jobLocation.city}, ${safeJob.jobLocation.state}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium text-gray-900">
                        {salary}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {safeJob.employmentType
                        ?.replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                    <Badge variant="secondary">
                      {getWorkplaceLabel(safeJob.workplaceType)}
                    </Badge>
                    {safeJob.positionsToHire && safeJob.positionsToHire > 1 && (
                      <Badge variant="secondary">
                        {safeJob.positionsToHire} positions
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-row gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={handleEdit}
                        className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit job</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleShare}
                        className="h-9 w-9 p-0 border-gray-300 hover:bg-gray-50 bg-transparent"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share job</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => setShowDeleteModal(true)}
                        variant="outline"
                        className="h-9 w-9 p-0 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete job</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-white border border-gray-200 p-1 rounded-lg">
              <TabsTrigger
                value="overview"
                className="rounded-md px-4 py-2 transition-all duration-200 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="applicants"
                className="rounded-md px-4 py-2 transition-all duration-200 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Applicants ({safeJob.applicantsCount || 0})
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-md px-4 py-2 transition-all duration-200 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Job Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none text-gray-700 leading-relaxed">
                        <div className="whitespace-pre-line">
                          {safeJob.jobDescription}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requirements */}
                  {safeJob.jobRequirements?.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {safeJob.jobRequirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* External Application Setup */}
                  {(safeJob.externalApplicationSetup?.customFields?.length >
                    0 ||
                    safeJob.externalApplicationSetup?.redirectUrl) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Application Setup</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {safeJob.externalApplicationSetup?.redirectUrl && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Custom Application URL
                            </h4>
                            <div className="p-3 bg-gray-50 rounded border">
                              <a
                                href={
                                  safeJob.externalApplicationSetup.redirectUrl
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                              >
                                {safeJob.externalApplicationSetup.redirectUrl}
                              </a>
                            </div>
                          </div>
                        )}
                        {safeJob.externalApplicationSetup?.customFields
                          ?.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Custom Fields
                            </h4>
                            <ul className="space-y-1">
                              {safeJob.externalApplicationSetup.customFields.map(
                                (field, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2 text-gray-700"
                                  >
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    {field}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Job Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Employment Type</span>
                          <span className="font-medium">
                            {safeJob.employmentType
                              ?.replace("-", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-gray-600">Workplace</span>
                          <span className="font-medium">
                            {getWorkplaceLabel(safeJob.workplaceType)}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-gray-600">Positions</span>
                          <span className="font-medium">
                            {safeJob.positionsToHire || 1}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-gray-600">Department</span>
                          <span className="font-medium">
                            {safeJob.department}
                          </span>
                        </div>
                        {safeJob.educationRequirement && (
                          <>
                            <Separator />
                            <div className="flex justify-between">
                              <span className="text-gray-600">Education</span>
                              <span className="font-medium">
                                {safeJob.educationRequirement}
                              </span>
                            </div>
                          </>
                        )}
                        {safeJob.exemptStatus && (
                          <>
                            <Separator />
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Exempt Status
                              </span>
                              <span className="font-medium">
                                {safeJob.exemptStatus.charAt(0).toUpperCase() +
                                  safeJob.exemptStatus.slice(1)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location */}
                  {safeJob.workplaceType !== "remote" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Location</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-gray-700">
                          <div className="font-medium">
                            {safeJob.jobLocation.address}
                          </div>
                          <div>
                            {safeJob.jobLocation.city},{" "}
                            {safeJob.jobLocation.state}{" "}
                            {safeJob.jobLocation.zipCode}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Compensation */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Compensation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pay Type</span>
                        <span className="font-medium">
                          {safeJob.payType?.charAt(0).toUpperCase() +
                            safeJob.payType?.slice(1)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {safeJob.payRate?.type === "range"
                            ? "Range"
                            : "Amount"}
                        </span>
                        <span className="font-semibold text-green-600">
                          {salary}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Schedule */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date</span>
                        <span className="font-medium">
                          {formatDate(safeJob.startDate)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date</span>
                        <span className="font-medium">
                          {formatDate(safeJob.endDate)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Background Screening */}
                  {safeJob.backgroundScreeningDisclaimer && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Background Screening</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">
                            Background screening disclaimer included
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="applicants" className="space-y-6">
              <ApplicantsSection jobId={safeJob.id} jobViews={safeJob.views} />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automation & Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  {safeJob.automation?.aiRules?.length > 0 ||
                  safeJob.automation?.enabledRules?.length > 0 ? (
                    <div className="space-y-6">
                      {/* AI Rules */}
                      {safeJob.automation?.aiRules?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">
                            AI Scoring Rules
                          </h3>
                          <div className="space-y-3">
                            {safeJob.automation.aiRules.map((rule, index) => (
                              <div
                                key={rule.id}
                                className="p-4 bg-blue-50 rounded-lg border border-blue-100"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-blue-600 font-medium text-sm">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <span className="text-gray-800">
                                    {rule.text}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Enabled Rules */}
                      {safeJob.automation?.enabledRules?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3">
                            Active Automation Rules
                          </h3>
                          <div className="space-y-2">
                            {safeJob.automation.enabledRules.map(
                              (ruleId, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-3 bg-green-50 rounded border border-green-100"
                                >
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                  <span className="text-green-800">
                                    Rule "{ruleId}" is active
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Automation Rules
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Set up AI scoring and workflow automation to streamline
                        your hiring process.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Delete Confirmation Modal */}
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
