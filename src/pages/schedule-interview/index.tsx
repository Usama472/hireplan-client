import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, MapPin, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/lib/hooks/use-toast';
import { getSchedulingData, scheduleInterview } from '@/http/interview/api';

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  interviewType: string;
  duration: number;
}

interface ApplicantDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ScheduleInterviewPage() {
  const { jobId, applicantId } = useParams<{ jobId: string; applicantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [applicantDetails, setApplicantDetails] = useState<ApplicantDetails | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !applicantId) {
      setError('Invalid scheduling link. Please contact the hiring team.');
      setLoading(false);
      return;
    }
    
    fetchSchedulingData();
  }, [jobId, applicantId]);

  const fetchSchedulingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real scheduling data from the API
      const response = await getSchedulingData(jobId!, applicantId!);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to load scheduling data');
      }
      
      // Map the API response to our component state
      const jobDetails: JobDetails = {
        id: response.data.job.id,
        title: response.data.job.title,
        company: response.data.job.company,
        location: response.data.job.location,
        interviewType: response.data.job.interviewType,
        duration: response.data.job.duration,
      };
      
      const applicantDetails: ApplicantDetails = {
        id: response.data.applicant.id,
        firstName: response.data.applicant.firstName,
        lastName: response.data.applicant.lastName,
        email: response.data.applicant.email,
      };
      
      // Filter only available slots
      const availableSlots = response.data.availableSlots.filter((slot: TimeSlot) => slot.available);
      
      setJobDetails(jobDetails);
      setApplicantDetails(applicantDetails);
      setAvailableSlots(availableSlots);
      
    } catch (err: any) {
      console.error('Error fetching scheduling data:', err);
      if (err.response?.status === 404) {
        setError('Interview link not found or has expired. Please contact the hiring team.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to access this interview scheduling link.');
      } else {
        const errorMessage = err?.response?.data?.message || 
                            err?.message || 
                            'Failed to load scheduling information. Please try again later.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedSlot) {
      toast({
        title: 'No time slot selected',
        description: 'Please select a time slot for your interview.',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const result = await scheduleInterview({
        jobId: jobId!,
        applicantId: applicantId!,
        slotId: selectedSlot.id,
        scheduledTime: {
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        },
      });

      if (!result.success) {
        throw new Error(result.message || 'Failed to schedule interview');
      }
      
      toast({
        title: 'Interview Scheduled!',
        description: 'You will receive a confirmation email with meeting details shortly.',
      });
      
      // Redirect to a confirmation page or show success message
      setTimeout(() => {
        navigate('/interview-scheduled', { 
          state: { 
            jobTitle: jobDetails?.title,
            company: jobDetails?.company,
            scheduledTime: selectedSlot,
            meetingLink: result.interview?.meetingLink,
          }
        });
      }, 2000);
      
    } catch (err: any) {
      console.error('Error scheduling interview:', err);
      
      let errorMessage = 'Unable to schedule your interview. Please try again.';
      if (err.response?.status === 409) {
        errorMessage = 'This time slot is no longer available. Please select a different time.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to schedule this interview.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({
        title: 'Scheduling Failed',
        description: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const groupedSlots = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Schedule Your Interview
          </h1>
          <p className="text-gray-600">
            Select a convenient time slot for your interview
          </p>
        </div>

        {/* Job Information */}
        {jobDetails && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{jobDetails.title}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {jobDetails.company}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {jobDetails.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      {jobDetails.interviewType}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {jobDetails.duration} minutes
                    </div>
                  </div>
                </div>
                
                {applicantDetails && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-1">
                      Candidate Information
                    </h4>
                    <p className="text-blue-700">
                      {applicantDetails.firstName} {applicantDetails.lastName}
                    </p>
                    <p className="text-blue-600 text-sm">
                      {applicantDetails.email}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Time Slots */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Available Time Slots
            </CardTitle>
            <CardDescription>
              Click on a time slot to select it for your interview
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedSlots).length === 0 ? (
              <Alert>
                <AlertDescription>
                  No available time slots found. Please contact the hiring team to arrange an interview.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedSlots)
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .map(([date, slots]) => (
                    <div key={date}>
                      <h4 className="font-medium text-gray-900 mb-3">
                        {formatDate(date)}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {slots.map((slot) => (
                          <Button
                            key={slot.id}
                            variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                            className={`p-3 h-auto flex flex-col items-center ${
                              selectedSlot?.id === slot.id
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-blue-50'
                            }`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <span className="font-medium">
                              {formatTime(slot.startTime)}
                            </span>
                            <span className="text-xs opacity-80">
                              {jobDetails?.duration} min
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Slot Summary & Action */}
        {selectedSlot && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Confirm Your Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-green-900 mb-2">
                  Selected Time Slot
                </h4>
                <p className="text-green-800">
                  {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.startTime)}
                </p>
                <p className="text-green-700 text-sm">
                  Duration: {jobDetails?.duration} minutes
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleScheduleInterview}
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? 'Scheduling...' : 'Confirm Interview'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSlot(null)}
                  disabled={submitting}
                >
                  Change Time
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Text */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                Having trouble scheduling? Contact us at{' '}
                <a href="mailto:hiring@company.com" className="text-blue-600 hover:underline">
                  hiring@company.com
                </a>
              </p>
              <p>
                You will receive a confirmation email with meeting details once your interview is scheduled.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}