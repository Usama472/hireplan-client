import { useState, useEffect } from "react";
import { 
  User, 
  Briefcase, 
  MessageSquare, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Mail,
  FileText,
  Settings,
  LogOut,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import API from "@/http";
import ChatInterface from "@/components/applicant/chat/ChatInterface";
import { ApplicantHeader } from "@/components/applicant/ApplicantHeader";
import { COMPONENT_STYLES, getStatusColor } from "@/constants";

interface Application {
  id: string;
  jobTitle: string;
  company?: {
    name: string;
    logo?: string;
  };
  location?: {
    city: string;
    state: string;
  };
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired';
  applicationDate: Date;
  employmentType?: string;
  payRate?: {
    type: string;
    min?: number;
    max?: number;
    amount?: number;
    period: string;
  };
  interviewScheduled: boolean;
  invitationSent: boolean;
  aiEvaluation?: {
    totalScore: number;
    recommendationLevel: string;
  };
  jobId: string;
}

interface ApplicantUser {
  id: string;
  applicantId: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
}

interface DashboardData {
  user: ApplicantUser;
  applications: Application[];
}

export default function ApplicantDashboard() {
  const [user, setUser] = useState<ApplicantUser | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applications");
  const [selectedJobForChat, setSelectedJobForChat] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated (has applicant token)
    const token = localStorage.getItem('applicant_token');
    if (!token) {
      setAuthError('Please log in to access your applicant portal.');
      setLoading(false);
      return;
    }
    
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get user profile and applications
      const [profileResponse, applicationsResponse] = await Promise.all([
        API.applicantAuth.getProfile(),
        API.applicantAuth.getApplications()
      ]);
      
      setUser(profileResponse.data);
      setApplications(applicationsResponse.data.applications || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Under Review", icon: Clock },
      reviewed: { label: "Reviewed", icon: CheckCircle },
      shortlisted: { label: "Shortlisted", icon: CheckCircle },
      rejected: { label: "Not Selected", icon: AlertCircle },
      hired: { label: "Hired", icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    const colorClasses = getStatusColor(status);

    return (
      <Badge className={`${colorClasses} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">{authError}</p>
            <Button 
              onClick={() => window.location.href = '/applicant/login'}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${COMPONENT_STYLES.background.page}`}>
      {/* HirePlan Header */}
      <ApplicantHeader />
      
      {/* User Welcome Section */}
      <div className={COMPONENT_STYLES.header.welcome}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`} />
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className={`text-xl font-semibold ${COMPONENT_STYLES.text.primary}`}>
                  Welcome back, {user?.firstName}!
                </h1>
                <p className={`text-sm ${COMPONENT_STYLES.text.secondary}`}>Track your applications and communicate with recruiters</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('applicant_token');
                  window.location.href = '/applicant/login';
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Interviews
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Applications</h2>
              <Badge variant="outline">
                {applications?.length || 0} applications
              </Badge>
            </div>

            {applications && applications.length > 0 ? (
              <div className="grid gap-4">
                {applications.map((application) => (
                  <Card key={application.id} className={COMPONENT_STYLES.card.hover}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-lg font-semibold ${COMPONENT_STYLES.text.primary}`}>
                              {application.jobTitle}
                            </h3>
                            {getStatusBadge(application.status)}
                          </div>
                          
                          <div className={`flex items-center gap-4 text-sm mb-3 ${COMPONENT_STYLES.text.muted}`}>
                            <span>{application.company?.name || 'Company'}</span>
                            {application.location?.city && application.location?.state && (
                              <>
                                <span>•</span>
                                <span>{application.location.city}, {application.location.state}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>Applied {new Date(application.applicationDate).toLocaleDateString()}</span>
                          </div>

                          {application.employmentType && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {application.employmentType}
                              </Badge>
                              {application.payRate && (
                                <span className="text-gray-500">
                                  {application.payRate.type === 'range' ? 
                                    `$${application.payRate.min?.toLocaleString()} - $${application.payRate.max?.toLocaleString()}` :
                                    `$${application.payRate.amount?.toLocaleString()}`
                                  } {application.payRate.period}
                                </span>
                              )}
                            </div>
                          )}

                          {application.invitationSent && (
                            <Alert className="mt-3">
                              <Mail className="h-4 w-4" />
                              <AlertDescription>
                                <strong>Interview Invitation Sent:</strong> Check your email for interview details.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedJobForChat(application.jobId);
                              setActiveTab("chat");
                            }}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat
                          </Button>
                          {application.interviewScheduled && (
                            <Button variant="outline" size="sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              Interview
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3 mr-1" />
                            View Job
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-500">
                    Your job applications will appear here once you apply to positions.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
              {selectedJobForChat && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedJobForChat(null)}
                >
                  View All Conversations
                </Button>
              )}
            </div>
            
            <ChatInterface 
              jobId={selectedJobForChat || undefined}
              onConversationCreated={(conversationId) => {
                setSelectedJobForChat(null);
                // Optionally refresh conversations or switch to the new one
              }}
            />
          </TabsContent>

          <TabsContent value="interviews" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Interviews</h2>
            </div>
            
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviews Scheduled</h3>
                <p className="text-gray-500">
                  Interview invitations and scheduling will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <p className="text-gray-900">{user?.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <p className="text-gray-900">{user?.lastName}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
