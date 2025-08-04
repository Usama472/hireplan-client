"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import API from "@/http";
import { errorResolver } from "@/lib/utils";
import { City, State } from "country-state-city";
import {
  Briefcase,
  Building2,
  Calendar,
  Download,
  Eye,
  Filter,
  MapPin,
  Search,
  Star,
  TrendingUp,
  Users,
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
  experienceYears?: number;
  currentJobTitle?: string;
  currentSalary?: string;
  expectedSalary?: string;
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

const stateOptions = State.getStatesOfCountry("US").map((state) => ({
  value: state.isoCode,
  label: state.name,
}));

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

            {applicant.experienceYears && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span>{applicant.experienceYears} years exp.</span>
              </div>
            )}

            {applicant.currentJobTitle && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span className="truncate">{applicant.currentJobTitle}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Applied {formatDate(applicant.createdAt)}</span>
            </div>
          </div>

          {/* Salary Info and Status Badges */}
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-4 text-sm">
              {applicant.currentSalary && (
                <span className="text-green-600 font-medium">
                  Current: ${applicant.currentSalary}
                </span>
              )}
              {applicant.expectedSalary && (
                <span className="text-blue-600 font-medium">
                  Expected: ${applicant.expectedSalary}
                </span>
              )}
              {!applicant.currentSalary && !applicant.expectedSalary && (
                <span className="text-muted-foreground">
                  No salary information
                </span>
              )}
            </div>

            {/* Status Badges - Moved to bottom right */}
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
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  const fetchApplicants = async () => {
    if (!jobId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response: ApplicantsResponse = await API.applicant.getApplicants(
        jobId
      );
      setApplicants(response.applicants || []);
      setStats(
        response.stats || {
          total: response.applicants?.length || 0,
          pending:
            response.applicants?.filter(
              (a) => a.status === "pending" || !a.status
            ).length || 0,
          reviewed:
            response.applicants?.filter((a) => a.status === "reviewed")
              .length || 0,
          shortlisted:
            response.applicants?.filter((a) => a.status === "shortlisted")
              .length || 0,
          rejected:
            response.applicants?.filter((a) => a.status === "rejected")
              .length || 0,
        }
      );
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
    setStateFilter("all");
    setCityFilter("all");
    setStatusFilter("all");
    setActiveTab("all");
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
      const query = searchQuery.toLowerCase();
      const fullName =
        `${applicant.firstName} ${applicant.lastName}`.toLowerCase();
      const email = applicant.email.toLowerCase();
      const jobTitle = applicant.currentJobTitle?.toLowerCase() || "";

      if (
        !fullName.includes(query) &&
        !email.includes(query) &&
        !jobTitle.includes(query)
      ) {
        return false;
      }
    }

    // Tab filter
    if (activeTab !== "all" && (applicant.status || "pending") !== activeTab) {
      return false;
    }

    // State filter
    if (stateFilter !== "all" && applicant.state !== stateFilter) {
      return false;
    }

    // City filter
    if (cityFilter !== "all" && applicant.city !== cityFilter) {
      return false;
    }

    // Status filter
    if (
      statusFilter !== "all" &&
      (applicant.status || "pending") !== statusFilter
    ) {
      return false;
    }

    return true;
  });

  const uniqueStates = new Set(applicants.map((a) => a.state).filter(Boolean));
  const cityOptions =
    stateFilter !== "all"
      ? City.getCitiesOfState("US", stateFilter).map((city) => ({
          value: city.name,
          label: city.name,
        }))
      : [];

  const applicationRate =
    jobViews && stats.total ? (stats.total / jobViews) * 100 : 0;

  if (isLoading) {
    return <ApplicantsLoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6 text-center">
          <div className="text-red-500 mb-4">
            <Users className="w-16 h-16 mx-auto mb-4 text-red-300" />
            <h3 className="text-xl font-semibold mb-2">
              Failed to Load Applicants
            </h3>
            <p className="text-sm text-red-600 mb-6">{error}</p>
          </div>
          <Button
            onClick={fetchApplicants}
            variant="outline"
            className="bg-white"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Users}
          title="Total Applicants"
          value={stats.total}
          color="bg-blue-100 text-blue-600"
        />

        <StatsCard
          icon={TrendingUp}
          title="Shortlisted"
          value={stats.shortlisted}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Application Rate */}
      {jobViews > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Application Rate</h3>
                <p className="text-sm text-muted-foreground">
                  {stats.total} applications from {jobViews} views
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {applicationRate.toFixed(1)}%
                </div>
              </div>
            </div>
            <Progress value={applicationRate} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search applicants by name, email, or job title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {stateOptions.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                      {uniqueStates.has(state.value) && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {
                            applicants.filter((a) => a.state === state.value)
                              .length
                          }
                        </Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {stateFilter !== "all" && cityOptions.length > 0 && (
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cityOptions.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {
                            applicants.filter((a) => a.city === city.value)
                              .length
                          }
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {/* <SelectItem value='pending'>
                    Pending ({stats.pending})
                  </SelectItem>
                  <SelectItem value='reviewed'>
                    Reviewed ({stats.reviewed})
                  </SelectItem> */}
                  <SelectItem value="shortlisted">
                    Shortlisted ({stats.shortlisted})
                  </SelectItem>
                  <SelectItem value="rejected">
                    Rejected ({stats.rejected})
                  </SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery ||
                stateFilter !== "all" ||
                cityFilter !== "all" ||
                statusFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="whitespace-nowrap bg-transparent"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="shortlisted">
            Shortlisted ({stats.shortlisted})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({stats.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredApplicants.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredApplicants.length} of {stats.total}{" "}
                  applicants
                </p>
              </div>

              <div className="grid gap-4">
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
            </div>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ||
                  stateFilter !== "all" ||
                  cityFilter !== "all" ||
                  statusFilter !== "all"
                    ? "No applicants match your filters"
                    : "No applicants yet"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery ||
                  stateFilter !== "all" ||
                  cityFilter !== "all" ||
                  statusFilter !== "all"
                    ? "Try adjusting your search or filters to see more applicants."
                    : "Once candidates start applying for this position, you'll see their profiles here."}
                </p>
                {(searchQuery ||
                  stateFilter !== "all" ||
                  cityFilter !== "all" ||
                  statusFilter !== "all") && (
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Applicant Detail Modal */}
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
