"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import API from "@/http";
import { errorResolver } from "@/lib/utils";
import {
  Calendar,
  CalendarCheck,
  Clock,
  Download,
  Eye,
  MapPin,
  Search,
  Star,
  UserCheck,
  Users,
  Video,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ApplicantDetailModal } from "./applicant-detail-modal";

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  resume?: string;
  coverLetter?: string;
  createdAt: string;
  aiScore?: number;
  status?: "pending" | "reviewed" | "shortlisted" | "rejected";
  interviewScheduled?: boolean;
  invitationSent?: boolean;
  invitationSentAt?: string;
  interview?: {
    id: string;
    applicant: string;
    job: string;
    startTime: string;
    endTime: string;
    scheduledDate: string;
    meetingLink: string;
    timezone: string;
    meetingSource: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface ApplicantsSectionProps {
  jobId: string;
  jobViews?: number;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatInterviewTime = (dateString: string, timezone: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
};

const formatInvitationDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "shortlisted":
      return "bg-green-50 text-green-700 border-green-200";
    case "reviewed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "bg-green-100 text-green-800 border-green-300";
  if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-300";
  return "bg-red-100 text-red-800 border-red-300";
};

// Stats Card Component
const StatsCard = ({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: any;
  title: string;
  value: number;
  color: string;
}) => (
  <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} mx-auto mb-3`}>
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
      {title}
    </p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

// Applicant Card Component
const ApplicantCard = ({
  applicant,
  onClick,
}: {
  applicant: Applicant;
  onClick: () => void;
}) => (
  <div
    className="p-6 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 cursor-pointer group"
    onClick={onClick}
  >
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
        {applicant.firstName[0]}
        {applicant.lastName[0]}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {applicant.firstName} {applicant.lastName}
            </h3>
            <p className="text-sm text-gray-600">{applicant.email}</p>
          </div>

          {/* Action Buttons - Moved to top right */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1 bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              View
            </Button>

            {applicant.resume && (
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1 bg-green-50 border-green-100 text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={applicant.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Resume
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {(applicant.city || applicant.state) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">
                {applicant.city && applicant.state
                  ? `${applicant.city}, ${applicant.state}`
                  : applicant.city || applicant.state}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Applied {formatDate(applicant.createdAt)}</span>
          </div>

          {applicant.interviewScheduled && applicant.interview && (
            <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
              <CalendarCheck className="w-4 h-4" />
              <span>
                Interview:{" "}
                {formatInterviewTime(
                  applicant.interview.scheduledDate,
                  applicant.interview.timezone
                )}
              </span>
            </div>
          )}

          {applicant.invitationSent && !applicant.interviewScheduled && (
            <div className="flex items-center gap-2 text-sm text-orange-600 font-medium">
              <Calendar className="w-4 h-4" />
              <span>
                Invitation sent:{" "}
                {formatInvitationDate(applicant.invitationSentAt || "")}
              </span>
            </div>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-2">
            {applicant.aiScore && (
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(
                  applicant.aiScore
                )}`}
              >
                <Star className="w-3 h-3" />
                {applicant.aiScore}%
              </div>
            )}
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                applicant.status
              )}`}
            >
              {applicant.status || "pending"}
            </div>
            {applicant.interviewScheduled && applicant.interview && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
                <Video className="w-3 h-3" />
                Interview Scheduled
              </div>
            )}
            {applicant.invitationSent && !applicant.interviewScheduled && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-medium">
                <Calendar className="w-3 h-3" />
                Invited
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Loading Skeleton (same as before)
const ApplicantsLoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="p-6 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="w-12 h-12 rounded-xl" />
          </div>
        </div>
      ))}
    </div>

    {/* Filters and Search Skeleton */}
    <div className="flex flex-col lg:flex-row gap-4">
      <Skeleton className="h-10 w-full lg:w-80" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Applicants List Skeleton */}
    <div className="grid gap-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="p-6 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export function ApplicantsSection({
  jobId,
  jobViews = 0,
}: ApplicantsSectionProps) {
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchApplicants = async () => {
    if (!jobId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response: any = await API.applicant.getApplicants(jobId);
      const applicantsData = response.applicants || [];
      const statsData = response.stats || {
        total: applicantsData.length,
        pending: applicantsData.filter(
          (a: Applicant) => a.status === "pending" || !a.status
        ).length,
        reviewed: applicantsData.filter(
          (a: Applicant) => a.status === "reviewed"
        ).length,
        shortlisted: applicantsData.filter(
          (a: Applicant) => a.status === "shortlisted"
        ).length,
        rejected: applicantsData.filter(
          (a: Applicant) => a.status === "rejected"
        ).length,
      };

      setApplicants(applicantsData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = errorResolver(err);
      setError(errorMessage);
      toast.error(`Failed to load applicants: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  const handleViewApplicant = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const filteredApplicants = applicants.filter((applicant) => {
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const fullName =
        `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
      const email = applicant.email.toLowerCase();
      if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "all" && applicant.status !== statusFilter) {
      return false;
    }

    return true;
  });

  if (isLoading) {
    return <ApplicantsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full shadow-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-sm font-medium text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Applicants</h2>
        <p className="text-gray-600">
          Review and manage job applications, track candidate progress, and
          schedule interviews.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Applicant Overview
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>{jobViews} job views</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <StatsCard
            icon={Users}
            title="Total Applicants"
            value={stats.total}
            color="bg-blue-100 text-blue-700"
          />
          <StatsCard
            icon={Clock}
            title="Pending Review"
            value={stats.pending}
            color="bg-yellow-100 text-yellow-700"
          />
          <StatsCard
            icon={UserCheck}
            title="Shortlisted"
            value={stats.shortlisted}
            color="bg-green-100 text-green-700"
          />
          <StatsCard
            icon={X}
            title="Rejected"
            value={stats.rejected}
            color="bg-red-100 text-red-700"
          />
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4 w-full">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Search & Filters
        </h3>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg w-full">
          <div className="flex flex-wrap gap-4 items-center w-full">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline-destructive"
              onClick={handleClearFilters}
              className="text-sm h-10 px-4 whitespace-nowrap"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Applicants List */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Applicants ({filteredApplicants.length})
        </h3>

        {filteredApplicants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No applicants found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No applications have been submitted yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onClick={() => handleViewApplicant(applicant)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedApplicant(null);
          }}
          onStatusUpdate={(applicantId: string, status: string) => {
            // Handle status update
            setApplicants(prev => 
              prev.map(app => 
                app.id === applicantId 
                  ? { ...app, status } 
                  : app
              )
            );
            // Refresh data
            fetchApplicants();
          }}
        />
      )}
    </div>
  );
}
