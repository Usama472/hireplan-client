import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/lib/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import API from "@/http";

const ZoomAuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Authorization was cancelled or failed');
      toast({
        title: "Connection Failed",
        description: "Zoom connection was cancelled",
      });
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      toast({
        title: "Connection Failed",
        description: "Invalid authorization response from Zoom",
      });
      return;
    }

    // Send the code to backend to complete OAuth flow
    API.zoom.zoomAuthCallback(code)
      .then((response) => {
        setStatus('success');
        setMessage(`Successfully connected ${response.user?.email || 'Zoom account'}`);
        toast({
          title: "Success!",
          description: "Zoom connected successfully",
        });
        
        // Redirect to availability settings after a short delay
        setTimeout(() => {
          navigate('/dashboard/availability');
        }, 2000);
      })
      .catch((error) => {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('Failed to connect Zoom. Please try again.');
        toast({
          title: "Connection Failed",
          description: "Failed to connect Zoom",
        });
      });
  }, [searchParams, navigate, toast]);

  const handleRetry = () => {
    navigate('/dashboard/availability');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="mb-6">
              <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Connecting Zoom
            </h2>
            <p className="text-gray-600 text-sm">
              Please wait while we complete the connection...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Connection Successful!
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {message}
            </p>
            <p className="text-xs text-gray-500">
              Redirecting to availability settings...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Connection Failed
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {message}
            </p>
            <Button onClick={handleRetry} className="w-full">
              Return to Settings
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ZoomAuthPage;
