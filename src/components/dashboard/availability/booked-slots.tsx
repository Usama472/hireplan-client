import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import API from "@/http";
import { format, parseISO } from "date-fns";
import {
  Building,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  User,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Interview {
  id: string;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
    id: string;
  };
  job: {
    jobTitle: string;
    id: string;
  };
  startTime: string;
  endTime: string;
  scheduledDate: string;
  meetingLink: string;
  timezone: string;
  meetingSource: string;
  status: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface InterviewsResponse {
  success: boolean;
  interviews: {
    results: Interview[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

interface BookedSlotsProps {
  className?: string;
}

export function BookedSlots({ className }: BookedSlotsProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const limit = 10;

  const fetchInterviews = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const response: InterviewsResponse = await API.interview.getInterviews({
        page,
        limit,
      });

      if (response.success) {
        setInterviews(response.interviews.results);
        setTotalPages(response.interviews.totalPages);
        setTotalResults(response.interviews.totalResults);
      }
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
      setError("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews(currentPage);
  }, [currentPage]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatInterviewTime = (startTime: string, endTime: string) => {
    const start = format(parseISO(startTime), "h:mm a");
    const end = format(parseISO(endTime), "h:mm a");
    return `${start} - ${end}`;
  };

  const formatInterviewDate = (dateString: string) => {
    return format(parseISO(dateString), "EEEE, MMMM d, yyyy");
  };

  const getMeetingSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "google":
        return "🔵";
      case "zoom":
        return "🔵";
      case "teams":
        return "🔵";
      default:
        return "🎥";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
            <CalendarCheck className="h-5 w-5" />
            Booked Interviews
          </h3>
          <p className="text-gray-600 text-sm">
            Manage your upcoming interviews and appointments.
          </p>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-48 mb-3" />
              <Separator className="my-2" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="mb-6">
          <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
            <CalendarCheck className="h-5 w-5" />
            Booked Interviews
          </h3>
        </div>
        <div className="text-center py-8">
          <CalendarCheck className="h-12 w-12 text-red-300 mx-auto mb-2" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => fetchInterviews(currentPage)}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Mobile-First Header */}
      <div className="mb-4 sm:mb-6">
        {/* Mobile Layout */}
        <div className="block sm:hidden space-y-3">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Booked Interviews
          </h3>
          <p className="text-gray-600 text-sm">
            {totalResults} total interviews
          </p>
          <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-lg p-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={currentPage === 1}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm font-medium px-2">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="flex-1"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              Booked Interviews
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            {totalResults} total interviews • Manage your upcoming interviews
            and appointments.
          </p>
        </div>
      </div>
      <div>
        <ScrollArea className="h-[400px] pr-4">
          {interviews.length > 0 ? (
            <>
              {/* Mobile: Flowing Interview Cards */}
              <div className="block sm:hidden space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                  >
                    {/* Status accent bar */}
                    <div
                      className={`absolute top-0 left-0 right-0 h-1 ${
                        interview.status === "scheduled"
                          ? "bg-gradient-to-r from-blue-400 to-blue-600"
                          : interview.status === "completed"
                          ? "bg-gradient-to-r from-green-400 to-green-600"
                          : "bg-gradient-to-r from-red-400 to-red-600"
                      }`}
                    />

                    <div className="p-4">
                      {/* Header with avatar placeholder */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                          {interview.applicant.firstName.charAt(0)}
                          {interview.applicant.lastName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate text-base">
                            {interview.applicant.firstName}{" "}
                            {interview.applicant.lastName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {interview.job.jobTitle}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Date and Time in a flowing card */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {formatInterviewDate(interview.scheduledDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg shadow-sm">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">
                              {formatInterviewTime(
                                interview.startTime,
                                interview.endTime
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Meeting details and contact */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
                          <Video className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-700">
                            {interview.meetingSource}
                          </span>
                        </div>
                        <div
                          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                            interview.status === "scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : interview.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {interview.status.charAt(0).toUpperCase() +
                            interview.status.slice(1)}
                        </div>
                      </div>

                      {/* Contact and location info */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">
                            {interview.applicant.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{interview.timezone}</span>
                        </div>
                      </div>

                      {/* Meeting link */}
                      {interview.meetingLink && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium text-sm hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Traditional Layout */}
              <div className="hidden sm:block space-y-4">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="bg-gray-50 rounded-md p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {interview.applicant.firstName}{" "}
                          {interview.applicant.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Building className="h-4 w-4" />
                          <span>{interview.job.jobTitle}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(interview.status)}`}
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          {formatInterviewTime(
                            interview.startTime,
                            interview.endTime
                          )}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {getMeetingSourceIcon(interview.meetingSource)}{" "}
                          {interview.meetingSource}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <CalendarCheck className="h-4 w-4" />
                      <span>
                        {formatInterviewDate(interview.scheduledDate)}
                      </span>
                      <span>•</span>
                      <MapPin className="h-4 w-4" />
                      <span>{interview.timezone}</span>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="flex items-center mr-4">
                          <User className="mr-1 h-3.5 w-3.5" />
                          {interview.applicant.firstName}{" "}
                          {interview.applicant.lastName}
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-1 h-3.5 w-3.5" />
                          {interview.applicant.email}
                        </div>
                      </div>

                      {interview.meetingLink && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                        >
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Join Meeting
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <CalendarCheck className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No interviews scheduled.</p>
              <p className="text-sm text-gray-400 mt-1">
                Interviews will appear here once scheduled.
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Pagination Info */}
        {totalResults > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, totalResults)} of {totalResults}{" "}
                interviews
              </span>
              <span>
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
