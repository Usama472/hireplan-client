"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicantDetailModal } from "@/components/dashboard/jobs/common/review-publish-step/applicant-detail-modal";
import API from "@/http";
import {
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface AIEvaluation {
  autoReject: boolean;
  autoRejectReason?: string;
  qualificationsScore: number;
  qualificationsJustification: string;
  resumeScore: number;
  resumeJustification: string;
  customQuestionsScore: number;
  customQuestionsJustification: string;
  totalScore: number;
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  recommendationLevel: "Strong No" | "No" | "Maybe" | "Yes" | "Strong Yes";
}

interface Job {
  id: string;
  jobTitle: string;
  companyName?: string;
  status?: string;
  createdAt?: string;
}

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  resume?: string;
  createdAt: string;
  aiEvaluation?: AIEvaluation;
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "draft";
  job?: Job;
  interviewScheduled?: boolean;
  invitationSent?: boolean;
  isPartial?: boolean;
}

interface ApplicantsResponse {
  success: boolean;
  results: Applicant[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [aiScoreFilter, setAiScoreFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Available filter options
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  const fetchApplicants = async (page = 1) => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (searchTerm.trim()) params.append("search", searchTerm.trim());
      if (statusFilter && statusFilter !== "all")
        params.append("status", statusFilter);
      if (jobFilter && jobFilter !== "all") params.append("jobId", jobFilter);
      if (aiScoreFilter && aiScoreFilter !== "all")
        params.append("aiScoreRange", aiScoreFilter);
      if (locationFilter && locationFilter !== "all")
        params.append("location", locationFilter);

      const response: ApplicantsResponse = await API.applicant.getAllApplicants(
        `?${params.toString()}`
      );

      if (response.success) {
        setApplicants(response.results);
        setCurrentPage(response.page);
        setTotalPages(response.totalPages);
        setTotalResults(response.totalResults);

        // Extract unique jobs for filter dropdown - handle undefined jobs
        const jobs = response.results
          .map((a) => a.job)
          .filter(
            (job): job is Job => job !== undefined && job.jobTitle !== undefined
          ) // Filter out undefined jobs
          .filter(
            (job, index, self) =>
              index === self.findIndex((j) => j.id === job.id)
          );
        setAvailableJobs(jobs);

        // Extract unique locations for filter dropdown
        const locations = response.results
          .map((a) => [a.city, a.state].filter(Boolean).join(", "))
          .filter((location) => location.length > 0)
          .filter((location, index, self) => self.indexOf(location) === index)
          .sort();
        setAvailableLocations(locations);
      }
    } catch (error) {
      console.error("Error fetching applicants:", error);
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, jobFilter, aiScoreFilter, locationFilter]);

  const handleStatusUpdate = async (applicantId: string, newStatus: string) => {
    try {
      await API.applicant.updateApplicantStatusDirect(applicantId, newStatus);
      toast.success("Applicant status updated successfully");
      fetchApplicants(currentPage);
    } catch {
      toast.error("Failed to update applicant status");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedApplicants.length === 0) {
      toast.error("Please select applicants first");
      return;
    }

    try {
      if (action === "shortlist") {
        await Promise.all(
          selectedApplicants.map((id) =>
            API.applicant.updateApplicantStatusDirect(id, "shortlisted")
          )
        );
        toast.success(`${selectedApplicants.length} applicants shortlisted`);
      } else if (action === "reject") {
        await Promise.all(
          selectedApplicants.map((id) =>
            API.applicant.updateApplicantStatusDirect(id, "rejected")
          )
        );
        toast.success(`${selectedApplicants.length} applicants rejected`);
      }

      setSelectedApplicants([]);
      fetchApplicants(currentPage);
    } catch {
      toast.error(`Failed to ${action} applicants`);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      reviewed: { className: "bg-blue-50 text-blue-700 border-blue-200" },
      shortlisted: { className: "bg-green-50 text-green-700 border-green-200" },
      rejected: { className: "bg-red-50 text-red-700 border-red-200" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant="outline" className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getAIScoreBadge = (score?: number, applicant?: Applicant) => {
    // Don't show AI score badge for draft/partial applications
    if (applicant && (applicant.status === "draft" || applicant.isPartial)) {
      return null;
    }

    if (!score)
      return (
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-gray-400 bg-gray-50 border border-gray-200 md:px-4 md:py-2">
          <span className="w-2 h-2 rounded-full bg-gray-300 md:w-3 md:h-3"></span>
          <span className="md:text-sm">No AI Score</span>
        </div>
      );

    const getScoreConfig = (score: number) => {
      if (score >= 80)
        return {
          gradient: "bg-gradient-to-r from-green-500 to-emerald-600",
          textColor: "text-white",
          glowColor: "shadow-green-500/25",
          ringColor: "ring-green-500/20",
        };
      if (score >= 60)
        return {
          gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500", // HirePlan signature gradient
          textColor: "text-white",
          glowColor: "shadow-purple-500/25",
          ringColor: "ring-purple-500/20",
        };
      if (score >= 40)
        return {
          gradient: "bg-gradient-to-r from-amber-500 to-orange-500",
          textColor: "text-white",
          glowColor: "shadow-amber-500/25",
          ringColor: "ring-amber-500/20",
        };
      return {
        gradient: "bg-gradient-to-r from-red-500 to-rose-600",
        textColor: "text-white",
        glowColor: "shadow-red-500/25",
        ringColor: "ring-red-500/20",
      };
    };

    const config = getScoreConfig(score);

    return (
      <div
        className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
        ${config.gradient} ${config.textColor}
        md:gap-1.5 md:px-3 md:py-1.5 md:text-sm md:font-semibold md:shadow-md md:${config.glowColor} 
        md:ring-2 md:${config.ringColor} md:hover:shadow-lg
        backdrop-blur-sm
      `}
      >
        <div className="flex items-center justify-center w-2.5 h-2.5 bg-white/20 rounded-full md:w-3 md:h-3">
          <div className="w-1 h-1 bg-white rounded-full md:w-1.5 md:h-1.5"></div>
        </div>
        <span className="font-bold">AI Score {score}%</span>
      </div>
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setJobFilter("all");
    setAiScoreFilter("all");
    setLocationFilter("all");
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Applicants</h1>
                <p className="text-sm text-gray-600">
                  Manage and review all job applicants
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
              >
                {totalResults} Total
              </Badge>
              <Button variant="outline" size="default">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-md border border-gray-200 p-3 flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-md flex-shrink-0">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 mb-0.5">
                Pending Review
              </p>
              <p className="text-xl font-bold text-gray-900">
                {applicants.filter((a) => a.status === "pending").length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-3 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-md flex-shrink-0">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 mb-0.5">
                Shortlisted
              </p>
              <p className="text-xl font-bold text-gray-900">
                {applicants.filter((a) => a.status === "shortlisted").length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-3 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-md flex-shrink-0">
              <Brain className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 mb-0.5">
                AI Evaluated
              </p>
              <p className="text-xl font-bold text-gray-900">
                {applicants.filter((a) => a.aiEvaluation?.totalScore).length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-md border border-gray-200 p-3 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-md flex-shrink-0">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 mb-0.5">
                Interviews Scheduled
              </p>
              <p className="text-xl font-bold text-gray-900">
                {applicants.filter((a) => a.interviewScheduled).length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="w-4 h-4" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Job Filter */}
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {availableJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* AI Score Filter */}
              <Select value={aiScoreFilter} onValueChange={setAiScoreFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All AI Scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="80-100">Excellent (80-100%)</SelectItem>
                  <SelectItem value="60-79">Good (60-79%)</SelectItem>
                  <SelectItem value="40-59">Average (40-59%)</SelectItem>
                  <SelectItem value="0-39">Below Average (0-39%)</SelectItem>
                  <SelectItem value="no-score">No AI Score</SelectItem>
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {availableLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {(searchTerm ||
                  (statusFilter && statusFilter !== "all") ||
                  (jobFilter && jobFilter !== "all") ||
                  (aiScoreFilter && aiScoreFilter !== "all") ||
                  (locationFilter && locationFilter !== "all")) && (
                  <>
                    <span className="text-sm text-gray-500 font-medium">
                      Active filters:
                    </span>
                    {searchTerm && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5 text-xs py-1 px-2.5"
                      >
                        Search: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm("")}
                          className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {statusFilter && statusFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5 text-xs py-1 px-2.5"
                      >
                        Status: {statusFilter}
                        <button
                          onClick={() => setStatusFilter("all")}
                          className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {jobFilter && jobFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5 text-xs py-1 px-2.5"
                      >
                        Job:{" "}
                        {availableJobs.find((j) => j && j.id === jobFilter)
                          ?.jobTitle || "Unknown Job"}
                        <button
                          onClick={() => setJobFilter("all")}
                          className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {aiScoreFilter && aiScoreFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5 text-xs py-1 px-2.5"
                      >
                        AI Score: {aiScoreFilter}
                        <button
                          onClick={() => setAiScoreFilter("all")}
                          className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {locationFilter && locationFilter !== "all" && (
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1.5 text-xs py-1 px-2.5"
                      >
                        Location: {locationFilter}
                        <button
                          onClick={() => setLocationFilter("all")}
                          className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Clear all
                    </Button>
                  </>
                )}
              </div>

              {/* Bulk Actions */}
              {selectedApplicants.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 font-medium">
                    {selectedApplicants.length} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("shortlist")}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 h-8"
                  >
                    Shortlist
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("reject")}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 h-8"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Applicants List */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="w-5 h-5" />
              All Applicants
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                ))}
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applicants found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter || jobFilter || aiScoreFilter
                    ? "Try adjusting your filters to see more results"
                    : "No applicants have applied yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All Header */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <Checkbox
                    checked={selectedApplicants.length === applicants.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedApplicants(applicants.map((a) => a.id));
                      } else {
                        setSelectedApplicants([]);
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({applicants.length} applicants)
                  </span>
                </div>

                {/* Applicant Cards */}
                {applicants.map((applicant) => (
                  <Card
                    key={applicant.id}
                    className="hover:border-blue-300 transition-colors border-gray-200"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedApplicants.includes(applicant.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedApplicants([
                                  ...selectedApplicants,
                                  applicant.id,
                                ]);
                              } else {
                                setSelectedApplicants(
                                  selectedApplicants.filter(
                                    (id) => id !== applicant.id
                                  )
                                );
                              }
                            }}
                          />

                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {applicant.firstName.charAt(0)}
                              {applicant.lastName.charAt(0)}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {applicant.firstName} {applicant.lastName}
                              </h3>
                              {getStatusBadge(applicant.status)}
                              {getAIScoreBadge(
                                applicant.aiEvaluation?.totalScore,
                                applicant
                              )}
                              {applicant.aiEvaluation?.autoReject && (
                                <Badge
                                  variant="outline"
                                  className="bg-red-100 text-red-700 border-red-200"
                                >
                                  Auto-Rejected
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {applicant.email}
                              </div>
                              {applicant.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  {applicant.phone}
                                </div>
                              )}
                              {(applicant.city || applicant.state) && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {[applicant.city, applicant.state]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Job: </span>
                                <span className="font-medium text-gray-900">
                                  {applicant.job?.jobTitle || "Unknown Job"}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Applied: </span>
                                <span className="text-gray-700">
                                  {new Date(
                                    applicant.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              {applicant.interviewScheduled && (
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200"
                                >
                                  Interview Scheduled
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedApplicant(applicant);
                              setIsDetailModalOpen(true);
                            }}
                            className="h-9"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(
                                    applicant.id,
                                    "shortlisted"
                                  )
                                }
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Shortlist
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(applicant.id, "rejected")
                                }
                                className="text-red-600"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule Interview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download Resume
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {(currentPage - 1) * 20 + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-gray-900">
                    {Math.min(currentPage * 20, totalResults)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {totalResults}
                  </span>{" "}
                  applicants
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchApplicants(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 border-gray-300 hover:border-gray-400"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600 px-2">
                    Page{" "}
                    <span className="font-semibold text-gray-900">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {totalPages}
                    </span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchApplicants(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 border-gray-300 hover:border-gray-400"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applicant Detail Modal */}
        {selectedApplicant && (
          <ApplicantDetailModal
            applicant={selectedApplicant}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedApplicant(null);
            }}
            onStatusUpdate={(applicantId, status) => {
              handleStatusUpdate(applicantId, status);
              setIsDetailModalOpen(false);
              setSelectedApplicant(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
