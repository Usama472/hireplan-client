import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, AlertCircle } from 'lucide-react';

interface ShortUrlRedirectProps {}

export default function ShortUrlRedirect({}: ShortUrlRedirectProps) {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short URL');
      setLoading(false);
      return;
    }

    redirectToOriginalUrl();
  }, [shortCode]);

  const redirectToOriginalUrl = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, you'd fetch the original URL from your backend
      // For now, we'll implement a client-side redirect logic
      
      // This should call an API to get the original URL
      // const response = await fetch(`/api/v1/short-urls/${shortCode}`);
      // const data = await response.json();
      // window.location.href = data.originalUrl;
      
      // For now, we'll show an error asking for backend implementation
      throw new Error('Short URL redirect requires backend API implementation');
      
    } catch (error: any) {
      console.error('Short URL redirect error:', error);
      setError('Failed to redirect. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    redirectToOriginalUrl();
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
              Redirecting...
            </h2>
            <p className="text-gray-600">
              Please wait while we redirect you to your destination.
            </p>
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
              Redirect Error
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
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
