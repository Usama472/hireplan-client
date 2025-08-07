"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Download,
  Eye,
  MapPin,
  Search,
  Star,
  Users,
  Clock,
  UserCheck,
  X,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
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
}

interface ApplicantsResponse {
  applicants: Applicant[];
  total: number;
  stats: {
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    rejected: number;
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
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Applicant Card Component
const ApplicantCard = ({
  applicant,
  onClick,
}: {
  applicant: Applicant;
  onClick: () => void;
}) => (
  <Card
    className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
    onClick={onClick}
  >
    <CardContent className="p-6">
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
              <p className="text-sm text-muted-foreground">{applicant.email}</p>
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="truncate">
                  {applicant.city && applicant.state
                    ? `${applicant.city}, ${applicant.state}`
                    : applicant.city || applicant.state}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Applied {formatDate(applicant.createdAt)}</span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex justify-end items-center">
            <div className="flex items-center gap-2">
              {applicant.aiScore && (
                <Badge
                  className={`text-xs font-medium ${getScoreColor(
                    applicant.aiScore
                  )}`}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {applicant.aiScore}%
                </Badge>
              )}
              <Badge
                className={`text-xs font-medium ${getStatusColor(
                  applicant.status
                )}`}
              >
                {applicant.status || "pending"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Loading Skeleton (same as before)
const ApplicantsLoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
          </CardContent>
        </Card>
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
        <Card key={i}>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export function ApplicantsSection({
  jobId,
  jobViews = 0,
}: ApplicantsSectionProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

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
        pending: applicantsData.filter((a: Applicant) => a.status === "pending" || !a.status).length,
        reviewed: applicantsData.filter((a: Applicant) => a.status === "reviewed").length,
        shortlisted: applicantsData.filter((a: Applicant) => a.status === "shortlisted").length,
        rejected: applicantsData.filter((a: Applicant) => a.status === "rejected").length,
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

  const handleStatusUpdate = async (applicantId: string, newStatus: string) => {
    try {
      // await API.job.updateApplicantStatus(applicantId, newStatus)
      // Update local state
      setApplicants((prev) =>
        prev.map((applicant) =>
          applicant.id === applicantId
            ? { ...applicant, status: newStatus as Applicant["status"] }
            : applicant
        )
      );
      // Refresh stats
      await fetchApplicants();
      toast.success("Applicant status updated successfully");
    } catch (err) {
      const errorMessage = errorResolver(err);
      toast.error(`Failed to update status: ${errorMessage}`);
    }
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
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to Load Applicants
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchApplicants} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Applicant Overview
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage and review job applications
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>{jobViews} job views</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="text-sm"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Applicants List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Applicants ({filteredApplicants.length})
          </h3>
        </div>

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
          <div className="divide-y divide-gray-200">
            {filteredApplicants.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                onClick={() => {
                  setSelectedApplicant(applicant);
                  setShowDetailModal(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
