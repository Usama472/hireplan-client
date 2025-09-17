import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ApplicantHeader } from '@/components/applicant/ApplicantHeader';
import { COMPONENT_STYLES } from '@/constants';
import API from '@/http';

export default function ApplicantLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Handle magic link login
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      handleMagicLinkLogin(token);
    }
  }, [searchParams]);

  const handleMagicLinkLogin = async (token: string) => {
    try {
      setLoading(true);
      const response = await API.applicantAuth.magicLinkLogin(token);
      
      // Store the token
      localStorage.setItem('applicant_token', response.data.tokens.access.token);
      
      setMessage({ type: 'success', text: 'Login successful! Redirecting to your dashboard...' });
      
      setTimeout(() => {
        navigate('/applicant/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Magic link login failed:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Invalid or expired login link. Please request a new one.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      await API.applicantAuth.sendMagicLink({ email });
      
      setMagicLinkSent(true);
      setMessage({ 
        type: 'success', 
        text: 'Login link sent! Check your email and click the link to access your portal.' 
      });
    } catch (error: any) {
      console.error('Failed to send magic link:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to send login link. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${COMPONENT_STYLES.background.auth}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <ApplicantHeader />
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-64px)] px-4 sm:px-6 pt-8 pb-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4 mx-auto">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${COMPONENT_STYLES.text.primary}`}>
              Applicant Portal
            </h1>
            <p className={`text-sm ${COMPONENT_STYLES.text.secondary}`}>
              Access your job applications and chat with recruiters
            </p>
          </div>

          <div className={`rounded-2xl shadow-sm p-8 ${COMPONENT_STYLES.card.default}`}>
            <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-center">
              {magicLinkSent ? 'Check Your Email' : 'Sign In'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {magicLinkSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Login link sent!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We've sent a secure login link to <strong>{email}</strong>. 
                    Click the link in the email to access your applicant portal.
                  </p>
                  <p className="text-xs text-gray-500">
                    The link will expire in 24 hours for security.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setMagicLinkSent(false);
                    setEmail('');
                    setMessage(null);
                  }}
                  className="w-full"
                >
                  Use Different Email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendMagicLink} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter the email you used to apply"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Use the same email address you used when applying for jobs
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !email.trim()}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Send Login Link
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  What you can do in your portal:
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Track your application status in real-time</li>
                  <li>• Chat directly with recruiters</li>
                  <li>• View job details and requirements</li>
                  <li>• Schedule interviews when invited</li>
                </ul>
              </div>
            </div>
          </CardContent>
            </Card>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Need help? Contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
