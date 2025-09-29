import { useState, useEffect } from "react";
import { 
  User, 
  Briefcase, 
  MessageSquare, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileText,
  LogOut,
  Bell,
  Search,
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import API from "@/http";
import UnifiedApplicantChat from "@/components/applicant/chat/UnifiedApplicantChat";
import { ApplicantHeader } from "@/components/applicant/ApplicantHeader";
import { COMPONENT_STYLES } from "@/constants";

interface Application {
  id: string;
  jobTitle: string;
  company?: {
    name: string;
    logo?: string;
    slug?: string;
    companyName?: string;
  };
  companyName?: string;
  location?: {
    city: string;
    state: string;
  };
  status: 'pending' | 'shortlisted' | 'rejected' | 'hired' | 'draft';
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
  jobId: string | { _id?: string; toString(): string };
  isPartial?: boolean;
  completionPercentage?: number;
  lastUpdated?: Date;
  partialApplicationToken?: string;
}

interface ApplicantUser {
  id: string;
  applicantId: string;
  firstName: string;
  lastName: string;
  email: string;
  isEmailVerified: boolean;
}


export default function ApplicantDashboard() {
  const [user, setUser] = useState<ApplicantUser | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("applications");
  const [selectedJobForChat, setSelectedJobForChat] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

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
      const apps = applicationsResponse.data.applications || []
      
      // Debug company data for different application types
      console.log('🔍 Finished apps company data:', apps.filter((app: Application) => !app.isPartial && app.status !== 'draft').map((app: Application) => ({
        jobTitle: app.jobTitle,
        company: app.company,
        isPartial: app.isPartial,
        status: app.status
      })))
      
      console.log('🔍 Unfinished apps company data:', apps.filter((app: Application) => app.isPartial || app.status === 'draft').map((app: Application) => ({
        jobTitle: app.jobTitle,
        company: app.company,
        isPartial: app.isPartial,
        status: app.status
      })))
      
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSimplifiedStatus = (status: string, isPartial?: boolean) => {
    if (isPartial || status === 'draft') {
      return 'partial';
    }
    if (status === 'rejected') {
      return 'rejected';
    }
    return 'under-review';
  };

  // Filter applications based on search and filters
  const getFilteredApplications = (apps: Application[], type: 'active' | 'inactive' | 'partial') => {
    let filtered = apps.filter(app => {
      const status = getSimplifiedStatus(app.status, app.isPartial);
      if (type === 'active') return status === 'under-review';
      if (type === 'inactive') return status === 'rejected';
      if (type === 'partial') return status === 'partial';
      return false;
    });

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.jobTitle?.toLowerCase().includes(search) ||
        (app.company?.name || app.company?.companyName || app.companyName || '')
          .toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => {
        if (statusFilter === 'pending') return app.status === 'pending';
        if (statusFilter === 'shortlisted') return app.status === 'shortlisted';
        if (statusFilter === 'rejected') return app.status === 'rejected';
        if (statusFilter === 'draft') return app.status === 'draft';
        return true;
      });
    }

    return filtered;
  };

  const getStatusBadge = (status: string, isPartial?: boolean, completionPercentage?: number) => {
    const simplifiedStatus = getSimplifiedStatus(status, isPartial);
    
    const statusConfig = {
      'under-review': { label: "Under Review", icon: Clock, classes: "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm" },
      'rejected': { label: "Rejected", icon: AlertCircle, classes: "bg-red-50 text-red-700 border-red-200" },
      'partial': { label: `${completionPercentage || 0}% Complete`, icon: FileText, classes: "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm" },
    };

    const config = statusConfig[simplifiedStatus as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={`${config.classes} flex items-center gap-1`}>
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

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="continue" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Unfinished
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

          <TabsContent value="applications" className="space-y-4">
            {/* Applications Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Your Applications</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1"
                >
                  <Filter className="h-3 w-3" />
                  Filters
                </Button>
                <Badge variant="outline" className="text-xs">
                  {getFilteredApplications(applications, 'active').length + getFilteredApplications(applications, 'inactive').length} total
                </Badge>
              </div>
            </div>

            {/* Search and Filters */}
            {showFilters && (
              <Card className="p-4 bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by job title or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchTerm || statusFilter !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                      }}
                      className="flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {applications && applications.length > 0 ? (
              <>
                {/* Active Applications Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">Active Applications</h3>
                    <Badge className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-sm text-xs">
                      {getFilteredApplications(applications, 'active').length}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    {getFilteredApplications(applications, 'active').map((application) => (
                        <Card key={application.id} className={`${COMPONENT_STYLES.card.hover} border-l-3 border-l-blue-500 bg-gradient-to-r from-blue-50/20 to-purple-50/20`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`text-base font-semibold ${COMPONENT_STYLES.text.primary} truncate`}>
                                    {application.jobTitle}
                                  </h4>
                                  {getStatusBadge(application.status, application.isPartial, application.completionPercentage)}
                                </div>
                                
                                <div className={`flex items-center gap-2 text-xs ${COMPONENT_STYLES.text.muted}`}>
                                  <span className="font-medium">
                                    {application.company?.name || 
                                     application.company?.companyName || 
                                     application.companyName ||
                                     'Hello ABA'}
                                  </span>
                                  <span>•</span>
                                  <span>{new Date(application.applicationDate).toLocaleDateString()}</span>
                                </div>

                                {application.invitationSent && (
                                  <div className="mt-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                    📧 Interview invitation sent
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-1 ml-3">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-xs px-2 py-1"
                                  onClick={() => {
                                    setSelectedJobForChat(application.jobId);
                                    setActiveTab("chat");
                                  }}
                                >
                                  Chat
                                </Button>
                                {application.interviewScheduled && (
                                  <Button variant="outline" size="sm" className="text-xs px-2 py-1">
                                    Interview
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                  
                  {getFilteredApplications(applications, 'active').length === 0 && (
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="p-8 text-center">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Applications</h4>
                        <p className="text-gray-600">Your active applications will appear here.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Inactive Applications Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">Inactive Applications</h3>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 text-xs">
                      {getFilteredApplications(applications, 'inactive').length}
                    </Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    {getFilteredApplications(applications, 'inactive').map((application) => (
                        <Card key={application.id} className={`${COMPONENT_STYLES.card.hover} border-l-3 border-l-red-300 opacity-60`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`text-base font-semibold ${COMPONENT_STYLES.text.primary} truncate`}>
                                    {application.jobTitle}
                                  </h4>
                                  {getStatusBadge(application.status, application.isPartial, application.completionPercentage)}
                                </div>
                                
                                <div className={`flex items-center gap-2 text-xs ${COMPONENT_STYLES.text.muted}`}>
                                  <span className="font-medium">
                                    {application.company?.name || 
                                     application.company?.companyName || 
                                     application.companyName ||
                                     'Hello ABA'}
                                  </span>
                                  <span>•</span>
                                  <span>{new Date(application.applicationDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              <div className="ml-3">
                                <Button variant="outline" size="sm" disabled className="text-xs px-2 py-1">
                                  View Job
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                  
                  {getFilteredApplications(applications, 'inactive').length === 0 && (
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Inactive Applications</h4>
                        <p className="text-gray-600">Completed or rejected applications will appear here.</p>
                      </CardContent>
                    </Card>
                  )}
              </div>
              </>
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

          <TabsContent value="continue" className="space-y-4">
            {/* Unfinished Applications Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Unfinished Applications</h2>
              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm text-xs">
                {getFilteredApplications(applications, 'partial').length}
              </Badge>
            </div>
            

            {/* Partial Applications Only */}
            {getFilteredApplications(applications, 'partial').length > 0 ? (
              <div className="grid gap-3">
                {getFilteredApplications(applications, 'partial').map((application) => (
                    <Card key={application.id} className={`${COMPONENT_STYLES.card.hover} border-l-3 border-l-orange-500 bg-gradient-to-r from-orange-50/30 to-white`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`text-base font-semibold ${COMPONENT_STYLES.text.primary} truncate`}>
                                {application.jobTitle}
                              </h4>
                              {getStatusBadge(application.status, application.isPartial, application.completionPercentage)}
                            </div>
                            
                            <div className={`flex items-center gap-2 text-xs ${COMPONENT_STYLES.text.muted} mb-2`}>
                              <span className="font-medium">{application.company?.name || 'Company'}</span>
                              <span>•</span>
                              <span>{new Date(application.applicationDate).toLocaleDateString()}</span>
                            </div>

                            {/* Compact Progress Bar */}
                            <div className="mb-2">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progress</span>
                                <span className="font-medium text-orange-700">{application.completionPercentage || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{ width: `${application.completionPercentage || 0}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">
                              ⚠️ Complete to be considered
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-1 ml-3">
                            <Button 
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 text-xs"
                              onClick={() => {
                                // Navigate to continue application
                                const companySlug = application.company?.slug || application.company?.name?.toLowerCase().replace(/\s+/g, '-') || 'company';
                                
                                let jobId: string;
                                if (typeof application.jobId === 'object' && application.jobId._id) {
                                  jobId = application.jobId._id.toString();
                                } else if (typeof application.jobId === 'object') {
                                  jobId = application.jobId.toString();
                                } else if (typeof application.jobId === 'string') {
                                  const match = application.jobId.match(/ObjectId\('([^']+)'\)/);
                                  if (match) {
                                    jobId = match[1];
                                  } else {
                                    jobId = application.jobId;
                                  }
                                } else {
                                  jobId = String(application.jobId);
                                }
                                
                                if (jobId && jobId.length === 24 && application.partialApplicationToken) {
                                  const continueUrl = `/company/${companySlug}/job/${jobId}/apply?token=${application.partialApplicationToken}`;
                                  window.location.href = continueUrl;
                                }
                              }}
                            >
                              Continue
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs px-3 py-1">
                              View Job
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                }
              </div>
            ) : (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-xl font-medium text-gray-900 mb-2">No Incomplete Applications</h4>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any applications in progress. When you start an application but don't complete it, it will appear here for you to continue.
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
            
            <UnifiedApplicantChat 
              jobId={selectedJobForChat || undefined}
              onConversationCreated={() => {
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
