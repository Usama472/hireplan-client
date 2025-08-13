import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, Video, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ScheduledInterviewState {
  jobTitle: string;
  company: string;
  scheduledTime: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

export default function InterviewScheduledPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as ScheduledInterviewState | null;

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

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Scheduled Successfully!
          </h1>
          <p className="text-gray-600">
            Your interview has been confirmed. You'll receive an email with all the details shortly.
          </p>
        </div>

        {/* Interview Details */}
        {state && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Interview Confirmation
              </CardTitle>
              <CardDescription>
                Please save this information and prepare for your interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Job Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Position Details</h3>
                  <p className="text-blue-800 font-medium">{state.jobTitle}</p>
                  <p className="text-blue-700">{state.company}</p>
                </div>

                {/* Scheduled Time */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Scheduled Time</h3>
                  <div className="flex items-center gap-2 text-green-800 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {formatDate(state.scheduledTime.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <Clock className="h-4 w-4" />
                    <span>
                      {formatTime(state.scheduledTime.startTime)} - {formatTime(state.scheduledTime.endTime)}
                    </span>
                  </div>
                </div>

                {/* Interview Type */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Interview Format</h3>
                  <div className="flex items-center gap-2 text-purple-800">
                    <Video className="h-4 w-4" />
                    <span>Video Interview (Google Meet)</span>
                  </div>
                  <p className="text-purple-700 text-sm mt-1">
                    The meeting link will be sent to your email
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="rounded-full w-6 h-6 flex items-center justify-center p-0">
                    1
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Confirmation Email</h4>
                  <p className="text-gray-600 text-sm">
                    You'll receive a detailed confirmation email within the next few minutes with your interview details and Google Meet link.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="rounded-full w-6 h-6 flex items-center justify-center p-0">
                    2
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Prepare for Your Interview</h4>
                  <p className="text-gray-600 text-sm">
                    Review the job description, prepare your questions, and test your video/audio setup beforehand.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Badge variant="secondary" className="rounded-full w-6 h-6 flex items-center justify-center p-0">
                    3
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Join the Interview</h4>
                  <p className="text-gray-600 text-sm">
                    Click the Google Meet link in your email at the scheduled time. We recommend joining 2-3 minutes early.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Please ensure you have a stable internet connection and a quiet environment for the interview.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  If you need to reschedule, please contact us at least 24 hours in advance.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  Have your resume and any relevant documents ready to discuss during the interview.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                If you have any questions or need to make changes to your interview, please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href="mailto:hiring@company.com"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  hiring@company.com
                </a>
                <span className="hidden sm:block text-gray-400">|</span>
                <a 
                  href="tel:+1-555-123-4567"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="text-center">
          <Button onClick={handleGoHome} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}