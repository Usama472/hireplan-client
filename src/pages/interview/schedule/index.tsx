import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import API from "@/http";
import { useToast } from "@/lib/hooks/use-toast";
import { errorResolver } from "@/lib/utils";
import { format, isSameDay, parseISO } from "date-fns";
import {
  Building,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  day: string;
}

interface Job {
  id: string;
  jobTitle: string;
  jobBoardTitle: string;
  company: string;
}

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  interview: any;
}

interface InterviewData {
  success: boolean;
  job: Job;
  applicant: Applicant;
  availableSlots: AvailableSlot[];
  timezone: string;
}

const InterviewSchedulePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);

  useEffect(() => {
    if (token) {
      API.interview
        .getInterviewSchedule(token)
        .then((res) => {
          console.log(res);
          setInterviewData(res);

          if (res.availableSlots && res.availableSlots.length > 0) {
            const firstSlot = res.availableSlots[0];
            setSelectedDate(parseISO(firstSlot.date));
            setSelectedSlot(firstSlot);
          }
        })
        .catch((err) => {
          console.log(err);
          setError("Invalid or expired interview link");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError("Invalid interview link");
      setLoading(false);
    }
  }, [token]);

  const handleScheduleInterview = () => {
    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }
    setSubmitting(true);

    try {
      API.interview
        .confirmInterviewSchedule(
          {
            selectedSlot,
          },
          token as string
        )
        .then(() => {
          toast({
            title: "Interview scheduled successfully",
            description: "You will receive an email with the interview details",
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
        })
        .catch((err: any) => {
          const message = errorResolver(err);
          toast({
            title: "Error",
            description: message,
          });
        })
        .finally(() => {
          setSubmitting(false);
        });
    } catch (err) {
      console.log(err);
    }
  };

  const getAvailableSlotsForDate = (date: Date) => {
    if (!interviewData) return [];
    return interviewData.availableSlots.filter((slot) =>
      isSameDay(parseISO(slot.date), date)
    );
  };

  const formatTimeSlot = (startTime: string, endTime: string) => {
    const start = format(parseISO(startTime), "h:mm a");
    const end = format(parseISO(endTime), "h:mm a");
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (error || !interviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-lg shadow-sm border p-6 max-w-sm w-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Invalid Interview Link
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {error || "This interview link is no longer valid."}
            </p>
            <Button onClick={() => navigate("/")} size="sm" className="w-full">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4 sm:py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Schedule Your Interview
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Choose a convenient time for your interview
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Top Section - Job & Candidate Info */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Job Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Job Details
                  </h2>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  {interviewData.job.jobBoardTitle}
                </h3>
                <p className="text-blue-100 text-sm mb-2 sm:mb-3">
                  {interviewData.job.jobTitle}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-blue-100 text-sm">Remote</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/30 text-xs"
                  >
                    Full-time
                  </Badge>
                </div>
              </div>

              {/* Candidate Information */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Your Information
                  </h2>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  {interviewData.applicant.firstName}{" "}
                  {interviewData.applicant.lastName}
                </h3>
                <p className="text-blue-100 text-sm mb-2 sm:mb-3">
                  {interviewData.applicant.email}
                </p>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-blue-100 text-sm">
                    {interviewData.timezone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interview Details Bar */}
          <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
            <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Video Interview</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>60 minutes</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Technical Discussion</span>
              </div>
            </div>
          </div>

          {/* Main Content - Calendar & Time Selection */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Calendar Section */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                  Select Date
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-lg border border-gray-200 p-2 sm:p-4"
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  modifiers={{
                    available: (date) => {
                      const slotsForDate = getAvailableSlotsForDate(date);
                      return slotsForDate.length > 0;
                    },
                  }}
                  modifiersStyles={{
                    available: { backgroundColor: "#dbeafe", color: "#1e40af" },
                  }}
                />
              </div>

              {/* Time Selection Section */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                  {selectedDate
                    ? `Available Times for ${format(
                        selectedDate,
                        "EEEE, MMMM do"
                      )}`
                    : "Select a date to view available times"}
                </h3>

                {selectedDate && (
                  <div className="space-y-2 sm:space-y-3">
                    {getAvailableSlotsForDate(selectedDate).map(
                      (slot, index) => (
                        <Button
                          key={index}
                          variant={
                            selectedSlot === slot ? "default" : "outline"
                          }
                          onClick={() => setSelectedSlot(slot)}
                          className="w-full h-10 sm:h-12 justify-start text-left text-sm"
                          size="sm"
                        >
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" />
                          {formatTimeSlot(slot.startTime, slot.endTime)}
                        </Button>
                      )
                    )}
                    {getAvailableSlotsForDate(selectedDate).length === 0 && (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <CalendarIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                        <p className="text-sm">
                          No available slots for this date.
                        </p>
                        <p className="text-xs text-gray-400">
                          Please select another date.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!selectedDate && (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-sm">
                      Please select a date to view available time slots
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation Section */}
            {selectedSlot && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    <h3 className="text-lg sm:text-xl font-semibold text-green-800">
                      Interview Summary
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">
                        Date
                      </p>
                      <p className="text-green-800 font-semibold text-sm sm:text-base">
                        {format(parseISO(selectedSlot.date), "EEEE, MMMM do")}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">
                        Time
                      </p>
                      <p className="text-green-800 font-semibold text-sm sm:text-base">
                        {formatTimeSlot(
                          selectedSlot.startTime,
                          selectedSlot.endTime
                        )}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">
                        Timezone
                      </p>
                      <p className="text-green-800 font-semibold text-sm sm:text-base">
                        {interviewData.timezone}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleScheduleInterview}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 sm:py-3 text-sm sm:text-base"
                    size="sm"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirm Interview Schedule"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSchedulePage;
