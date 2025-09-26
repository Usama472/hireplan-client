import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import API from '@/http';
import { ROUTES } from '@/constants';

export default function ApplicantPortal() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const action = searchParams.get('action');
  const jobId = searchParams.get('job');

  useEffect(() => {
    if (!token) {
      setError('Invalid access token');
      setLoading(false);
      return;
    }

    authenticateAndRedirect();
  }, [token]);

  const authenticateAndRedirect = async () => {
    try {
      setLoading(true);
      
      // Authenticate with the portal token
      const response = await API.applicantAuth.magicLinkLogin(token || '');
      
      if (response.data?.token) {
        // Store the applicant token
        localStorage.setItem('applicant_token', response.data.token);
        
        // Redirect based on action
        if (action === 'chat') {
          // Redirect to applicant dashboard with chat tab active
          navigate(`${ROUTES.APPLICANT.DASHBOARD}?tab=chat&job=${jobId || ''}`);
        } else {
          // Default redirect to dashboard
          navigate(ROUTES.APPLICANT.DASHBOARD);
        }
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      console.error('Portal authentication error:', error);
      setError(error.response?.data?.message || 'Failed to authenticate. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    authenticateAndRedirect();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Accessing Your Portal
            </h2>
            <p className="text-gray-600 mb-4">
              Please wait while we authenticate your access and prepare your chat session...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <MessageSquare className="h-4 w-4" />
              <span>Preparing chat interface</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Access Error
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate(ROUTES.APPLICANT.LOGIN)}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to Applicant Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This shouldn't render since we redirect, but just in case
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Redirecting...</p>
        </CardContent>
      </Card>
    </div>
  );
}
