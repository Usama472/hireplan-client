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
import { QUESTION_TYPE_INFO, ROUTES } from "@/constants";
import API from "@/http";
import type { JobFormData } from "@/interfaces";
import { errorResolver } from "@/lib/utils";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  FileText,
  HelpCircle,
  MapPin,
  RefreshCw,
  Settings,
  Share2,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { ApplicantsSection } from "./applicants-section";
import { Progress } from "@/components/ui/progress";

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
    customQuestions: job.customQuestions || [],
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

  const getQuestionTypeInfo = (type: string) => {
    return QUESTION_TYPE_INFO[type as keyof typeof QUESTION_TYPE_INFO];
  };

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

  const getScoringTotal = () => {
    if (!job) return;
    if (!job.automation?.scoringWeights) return 0;
    return Object.values(job.automation.scoringWeights).reduce(
      (sum, weight) => sum + weight,
      0
    );
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

                  {/* Custom Questions */}
                  {safeJob.customQuestions.length > 0 && (
                    <Card className="border-slate-200 shadow-sm">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-purple-600" />
                          </div>
                          Custom Questions
                          <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                            {safeJob.customQuestions.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-red-100 text-red-700 border-red-300">
                            {
                              safeJob.customQuestions.filter((q) => q.required)
                                .length
                            }{" "}
                            required
                          </Badge>
                          <Badge className="bg-slate-100 text-slate-700 border-slate-300">
                            {
                              safeJob.customQuestions.filter((q) => !q.required)
                                .length
                            }{" "}
                            optional
                          </Badge>
                        </div>

                        <div className="space-y-4">
                          {safeJob.customQuestions.map((question, index) => {
                            const typeInfo = getQuestionTypeInfo(question.type);
                            const Icon = typeInfo?.icon || HelpCircle;

                            return (
                              <div
                                key={question.id}
                                className="p-4 border border-slate-200 rounded-xl bg-slate-50"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        typeInfo?.color || "bg-slate-100"
                                      }`}
                                    >
                                      <Icon
                                        className={`w-5 h-5 ${
                                          typeInfo?.iconColor ||
                                          "text-slate-600"
                                        }`}
                                      />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                                      #{index + 1}
                                    </span>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Badge
                                        className={`text-xs ${
                                          typeInfo?.color ||
                                          "bg-slate-100 text-slate-700"
                                        } border-0`}
                                      >
                                        {typeInfo?.label || question.type}
                                      </Badge>
                                      {question.required && (
                                        <Badge className="text-xs bg-red-100 text-red-700 border-0">
                                          Required
                                        </Badge>
                                      )}
                                    </div>

                                    <h4 className="font-medium text-slate-900 mb-3 leading-relaxed">
                                      {question.question}
                                    </h4>

                                    {question.type === "select" &&
                                      question.options && (
                                        <div>
                                          <p className="text-xs text-slate-500 mb-2">
                                            Options:
                                          </p>
                                          <div className="flex flex-wrap gap-2">
                                            {question.options
                                              .slice(0, 3)
                                              .map((option, optIndex) => (
                                                <Badge
                                                  key={optIndex}
                                                  variant="outline"
                                                  className="text-xs bg-white border-slate-300"
                                                >
                                                  {option}
                                                </Badge>
                                              ))}
                                            {question.options.length > 3 && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-white border-slate-300"
                                              >
                                                +{question.options.length - 3}{" "}
                                                more
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {question.placeholder &&
                                      question.type === "string" && (
                                        <p className="text-xs text-slate-500 mt-2">
                                          Placeholder: "{question.placeholder}"
                                        </p>
                                      )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

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
              {safeJob.automation && (
                <Card className="border-slate-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </div>
                      AI Automation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">
                        Acceptance Threshold:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-600">
                          {safeJob.automation.acceptanceThreshold || 70}%
                        </span>
                        <Badge
                          className={`text-xs ${
                            (safeJob.automation.acceptanceThreshold || 70) >= 80
                              ? "bg-red-100 text-red-700"
                              : (safeJob.automation.acceptanceThreshold ||
                                  70) >= 60
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {(safeJob.automation.acceptanceThreshold || 70) >= 80
                            ? "High"
                            : (safeJob.automation.acceptanceThreshold || 70) >=
                              60
                            ? "Medium"
                            : "Low"}
                        </Badge>
                      </div>
                    </div>

                    {safeJob.automation.scoringWeights && (
                      <div>
                        <div className="flex justify-between items-center py-2 mb-3">
                          <span className="text-sm text-slate-600">
                            Scoring Weights:
                          </span>
                          <span className="font-medium text-slate-900">
                            {getScoringTotal()}%
                          </span>
                        </div>
                        <div className="space-y-3">
                          {Object.entries(
                            safeJob.automation.scoringWeights
                          ).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <span className="text-xs text-slate-600 capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <div className="flex items-center gap-2">
                                <Progress value={value} className="h-2 w-16" />
                                <span className="text-xs font-medium text-slate-900 min-w-[2rem]">
                                  {value}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-600">
                        Active Rules:
                      </span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                        {safeJob.automation.enabledRules?.length || 0} enabled
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Automation & Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  {safeJob.automation?.aiRules?.length > 0 ||
                  safeJob.automation?.enabledRules?.length > 0 ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {[
                          {
                            id: "accept-notification",
                            label: "Accept Notification",
                            desc: "Send congratulatory email",
                            icon: CheckCircle,
                            color: "text-green-600",
                          },
                          {
                            id: "rejection-notification",
                            label: "Rejection Notification",
                            desc: "Send polite rejection email",
                            icon: X,
                            color: "text-red-600",
                          },
                          {
                            id: "interview-notification",
                            label: "Interview Scheduling",
                            desc: "Auto schedule interviews",
                            icon: Calendar,
                            color: "text-blue-600",
                          },
                        ].map((rule) => (
                          <div
                            key={rule.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <rule.icon className={`w-4 h-4 ${rule.color}`} />
                              <div>
                                <p className="text-sm font-medium">
                                  {rule.label}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {rule.desc}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {safeJob.automation.enabledRules.includes(
                                rule.id
                              ) && (
                                <Badge variant="secondary" className="text-xs">
                                  Active
                                </Badge>
                              )}
                              <Switch
                                checked={safeJob.automation.enabledRules.includes(
                                  rule.id
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
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
