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
  X,
  Mail,
  Sparkles,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import API from "@/http";
import UnifiedApplicantChat from "@/components/applicant/chat/UnifiedApplicantChat";
import { ApplicantHeader } from "@/components/applicant/ApplicantHeader";
import { useApplicantNotifications } from "@/lib/hooks/use-applicant-notifications";

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
  interview?: {
    id: string;
    scheduledDate: Date;
    startTime: string;
    endTime: string;
    meetingLink?: string;
    timezone?: string;
    meetingSource?: 'google' | 'zoom' | 'teams';
    status?: 'scheduled' | 'rescheduled' | 'cancelled' | 'completed';
  } | null;
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
  
  // Notifications hook
  const { unreadCount, refetch: refetchNotifications } = useApplicantNotifications();
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showInactive, setShowInactive] = useState(false);

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

  // Refresh notifications when switching away from chat tab (messages may have been read)
  useEffect(() => {
    if (activeTab !== 'chat') {
      refetchNotifications();
    }
  }, [activeTab, refetchNotifications]);

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

  // Pagination logic
  const getPaginatedApplications = (apps: Application[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return apps.slice(startIndex, endIndex);
  };

  const getTotalPages = (apps: Application[]) => {
    return Math.ceil(apps.length / itemsPerPage);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeTab]);

  // Get applications with scheduled interviews
  const getScheduledInterviews = () => {
    return applications.filter(app => app.interviewScheduled && app.interview);
  };

  // Separate upcoming and past interviews
  const getUpcomingInterviews = () => {
    const now = new Date();
    return getScheduledInterviews()
      .filter(app => new Date(app.interview!.scheduledDate) >= now)
      .sort((a, b) => new Date(a.interview!.scheduledDate).getTime() - new Date(b.interview!.scheduledDate).getTime());
  };

  const getPastInterviews = () => {
    const now = new Date();
    return getScheduledInterviews()
      .filter(app => new Date(app.interview!.scheduledDate) < now)
      .sort((a, b) => new Date(b.interview!.scheduledDate).getTime() - new Date(a.interview!.scheduledDate).getTime());
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

  const formatInterviewDateTime = (date: Date, startTime: string, timezone?: string) => {
    const interviewDate = new Date(date);
    const dateStr = interviewDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Parse startTime to get formatted time
    const time = new Date(startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return { dateStr, time, timezone: timezone || 'UTC' };
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* HirePlan Header */}
      <ApplicantHeader />
      
      {/* Hero Welcome Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Avatar className="h-16 w-16 border-2 border-gray-200 shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.firstName}!
                  </h1>
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-gray-600 text-sm font-medium">
                  Track your applications and connect with recruiters
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-gray-200 hover:bg-gray-50 transition-all duration-200 relative"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs px-1.5 min-w-[20px] h-5">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {unreadCount} unread
                        </Badge>
                      )}
                    </div>
                    {unreadCount > 0 ? (
                      <div className="space-y-2">
                        <DropdownMenuItem 
                          className="flex flex-col items-start p-3 cursor-pointer"
                          onClick={() => {
                            setActiveTab("chat");
                            refetchNotifications();
                          }}
                        >
                          <div className="flex items-start gap-2 w-full">
                            <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                New Messages
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''} from recruiters
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No new notifications</p>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  localStorage.removeItem('applicant_token');
                  window.location.href = '/applicant/login';
                }}
                className="border-gray-200 hover:bg-gray-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Dashboard Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-gray-50 border-gray-200 hover:shadow-md transition-all duration-200 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Active Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{getFilteredApplications(applications, 'active').length}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200 hover:shadow-md transition-all duration-200 group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Unfinished</p>
                    <p className="text-3xl font-bold text-gray-900">{getFilteredApplications(applications, 'partial').length}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer" onClick={() => setActiveTab("chat")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Unread Messages</p>
                    <p className="text-3xl font-bold text-gray-900">{unreadCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-50 border-gray-200 hover:shadow-md transition-all duration-200 group cursor-pointer" onClick={() => setActiveTab("interviews")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Interviews</p>
                    <p className="text-3xl font-bold text-gray-900">{getScheduledInterviews().length}</p>
                  </div>
                  <div className="h-12 w-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
            <TabsList className="grid w-full grid-cols-5 p-1 bg-gradient-to-r from-gray-100 to-gray-50">
              <TabsTrigger 
                value="applications" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
              >
              <Briefcase className="h-4 w-4" />
              Applications
                {getFilteredApplications(applications, 'active').length > 0 && (
                  <Badge className="ml-1 bg-white text-blue-600 text-xs px-1.5 py-0">
                    {getFilteredApplications(applications, 'active').length}
                  </Badge>
                )}
            </TabsTrigger>
              <TabsTrigger 
                value="continue" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white transition-all duration-200"
              >
              <FileText className="h-4 w-4" />
              Unfinished
                {getFilteredApplications(applications, 'partial').length > 0 && (
                  <Badge className="ml-1 bg-white text-orange-600 text-xs px-1.5 py-0">
                    {getFilteredApplications(applications, 'partial').length}
                  </Badge>
                )}
            </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
              >
              <MessageSquare className="h-4 w-4" />
              Messages
                {unreadCount > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0">
                    {unreadCount}
                  </Badge>
                )}
            </TabsTrigger>
              <TabsTrigger 
                value="interviews" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-200"
              >
              <Calendar className="h-4 w-4" />
              Interviews
            </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-200"
              >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>
          </Card>

          <TabsContent value="applications" className="space-y-6">
            {/* Applications Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Your Applications</h2>
                <p className="text-sm text-gray-600 mt-1">Track and manage all your job applications in one place</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white transition-all duration-200"
                >
                  <Filter className="h-3 w-3" />
                  Filters
                </Button>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-3 py-1">
                  {getFilteredApplications(applications, 'active').length + getFilteredApplications(applications, 'inactive').length} total
                </Badge>
              </div>
            </div>

            {/* Search and Filters */}
            {showFilters && (
              <Card className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by job title or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white border-0 shadow-sm"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-white border-0 shadow-sm">
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
                      className="flex items-center gap-1 bg-white border-0 shadow-sm hover:bg-red-50 hover:text-red-600 transition-all duration-200"
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Active Applications</h3>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm px-3 py-1">
                      {getFilteredApplications(applications, 'active').length}
                    </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={viewMode === 'grid' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={viewMode === 'list' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {getFilteredApplications(applications, 'active').length > 0 ? (
                    <>
                      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                        {getPaginatedApplications(getFilteredApplications(applications, 'active')).map((application) => (
                          <Card key={application.id} className="group relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border-0">
                            {/* Gradient border effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
                              <div className="h-full w-full bg-white"></div>
                            </div>
                            
                            <CardContent className="relative p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                                      {(application.company?.name || application.company?.companyName || application.companyName || 'C')[0].toUpperCase()}
                                    </div>
                              <div className="flex-1 min-w-0">
                                      <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {application.jobTitle}
                                  </h4>
                                      <p className="text-base font-semibold text-gray-700 mb-1">
                                    {application.company?.name || 
                                     application.company?.companyName || 
                                     application.companyName ||
                                         'Company Name'}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                  <span>{new Date(application.applicationDate).toLocaleDateString()}</span>
                                    </div>
                                    {application.location && (
                                      <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          <span>{application.location.city}, {application.location.state}</span>
                                        </div>
                                      </>
                                    )}
                                </div>

                                  <div className="flex items-center gap-2 flex-wrap mb-4">
                                    {getStatusBadge(application.status, application.isPartial, application.completionPercentage)}
                                {application.invitationSent && (
                                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm">
                                        <Mail className="h-3 w-3 mr-1" />
                                        Interview Invitation
                                      </Badge>
                                    )}
                                    {application.interviewScheduled && (
                                      <Badge className="bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0 shadow-sm">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        Scheduled
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button 
                                  size="sm"
                                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md"
                                  onClick={() => {
                                    let jobId: string;
                                    if (typeof application.jobId === 'string') {
                                      jobId = application.jobId;
                                    } else if (application.jobId._id) {
                                      jobId = application.jobId._id;
                                    } else {
                                      jobId = application.jobId.toString();
                                    }
                                    setSelectedJobForChat(jobId);
                                    setActiveTab("chat");
                                  }}
                                >
                                  <MessageSquare className="h-3 w-3 mr-2" />
                                  Message
                                </Button>
                                {application.interviewScheduled && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="flex-1 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-600 hover:text-white hover:border-0 transition-all"
                                  >
                                    <Calendar className="h-3 w-3 mr-2" />
                                    Interview
                                  </Button>
                                )}
                            </div>
                          </CardContent>
                        </Card>
                        ))}
                  </div>
                  
                      {/* Pagination Controls */}
                      {getTotalPages(getFilteredApplications(applications, 'active')) > 1 && (
                        <div className="flex items-center justify-between mt-6">
                          <p className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredApplications(applications, 'active').length)} of {getFilteredApplications(applications, 'active').length} applications
                          </p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:border-0 disabled:opacity-50"
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Previous
                            </Button>
                            
                            <div className="flex items-center gap-1">
                              {Array.from({ length: getTotalPages(getFilteredApplications(applications, 'active')) }, (_, i) => i + 1).map((page) => (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className={currentPage === page ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'hover:bg-gray-100'}
                                >
                                  {page}
                                </Button>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(getTotalPages(getFilteredApplications(applications, 'active')), prev + 1))}
                              disabled={currentPage === getTotalPages(getFilteredApplications(applications, 'active'))}
                              className="hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:border-0 disabled:opacity-50"
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50">
                      <CardContent className="p-12 text-center">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                          <Briefcase className="h-10 w-10 text-blue-600" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">No Active Applications</h4>
                        <p className="text-gray-600 max-w-md mx-auto">Your active applications will appear here. Start applying to jobs to see them tracked here.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Inactive Applications Section - Collapsible */}
                {getFilteredApplications(applications, 'inactive').length > 0 && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowInactive(!showInactive)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-700">Past Applications</h3>
                        <Badge className="bg-gray-200 text-gray-700 shadow-sm px-3 py-1">
                      {getFilteredApplications(applications, 'inactive').length}
                    </Badge>
                  </div>
                      {showInactive ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    
                    {showInactive && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                    {getFilteredApplications(applications, 'inactive').map((application) => (
                          <Card key={application.id} className="group relative overflow-hidden bg-gray-50 hover:shadow-lg transition-all duration-300 border-gray-200">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded-lg bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0">
                                  {(application.company?.name || application.company?.companyName || application.companyName || 'C')[0].toUpperCase()}
                                </div>
                              <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-bold text-gray-800 mb-1">
                                    {application.jobTitle}
                                  </h4>
                                  <p className="text-sm font-semibold text-gray-600 mb-2">
                                    {application.company?.name || 
                                     application.company?.companyName || 
                                     application.companyName ||
                                     'Company Name'}
                                  </p>
                                  
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <Clock className="h-3 w-3" />
                                  <span>{new Date(application.applicationDate).toLocaleDateString()}</span>
                                  </div>

                                  {getStatusBadge(application.status, application.isPartial, application.completionPercentage)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="p-16 text-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <Briefcase className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">No Applications Yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">
                    Your job applications will appear here once you start applying to positions. Track your progress all in one place!
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Explore Jobs
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="continue" className="space-y-6">
            {/* Unfinished Applications Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Unfinished Applications</h2>
                <p className="text-sm text-gray-600 mt-1">Complete your applications to increase your chances</p>
              </div>
              <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md px-4 py-2">
                {getFilteredApplications(applications, 'partial').length} pending
              </Badge>
            </div>

            {/* Partial Applications Only */}
            {getFilteredApplications(applications, 'partial').length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getPaginatedApplications(getFilteredApplications(applications, 'partial')).map((application) => (
                    <Card key={application.id} className="group relative overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border-0">
                      {/* Gradient border effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ padding: '2px' }}>
                        <div className="h-full w-full bg-white"></div>
                      </div>
                      
                      <CardContent className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                                {(application.company?.name || application.company?.companyName || application.companyName || 'C')[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                                {application.jobTitle}
                              </h4>
                                <p className="text-base font-semibold text-gray-700 mb-1">
                                  {application.company?.name || 
                                   application.company?.companyName || 
                                   application.companyName ||
                                   'Company Name'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                              <Clock className="h-3 w-3" />
                              <span>Last updated {new Date(application.lastUpdated || application.applicationDate).toLocaleDateString()}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-gray-700">Progress</span>
                                <span className="font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                                  {application.completionPercentage || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                                  style={{ width: `${application.completionPercentage || 0}%` }}
                                ></div>
                              </div>
                            </div>

                            {application.completionPercentage && application.completionPercentage < 100 && (
                              <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg mb-4">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">Complete this to be considered by recruiters</span>
                              </div>
                            )}
                            </div>
                          </div>
                          
                        <div className="flex items-center gap-2">
                            <Button 
                              size="sm"
                            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md"
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
                            <FileText className="h-3 w-3 mr-2" />
                            Continue Application
                            </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls for Unfinished */}
                {getTotalPages(getFilteredApplications(applications, 'partial')) > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredApplications(applications, 'partial').length)} of {getFilteredApplications(applications, 'partial').length} applications
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:border-0 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: getTotalPages(getFilteredApplications(applications, 'partial')) }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'hover:bg-gray-100'}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(getTotalPages(getFilteredApplications(applications, 'partial')), prev + 1))}
                        disabled={currentPage === getTotalPages(getFilteredApplications(applications, 'partial'))}
                        className="hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white hover:border-0 disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
              </div>
                )}
              </>
            ) : (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50">
                <CardContent className="p-16 text-center">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-3">All Caught Up!</h4>
                  <p className="text-gray-600 max-w-md mx-auto">
                    You don't have any incomplete applications. When you start an application but don't finish it, you can come back here to continue.
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
              {getScheduledInterviews().length > 0 && (
                <div className="flex gap-2">
                  {getUpcomingInterviews().length > 0 && (
                    <Badge className="bg-green-500 text-white">
                      {getUpcomingInterviews().length} Upcoming
                    </Badge>
                  )}
                  {getPastInterviews().length > 0 && (
                    <Badge className="bg-gray-400 text-white">
                      {getPastInterviews().length} Past
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            {getScheduledInterviews().length > 0 ? (
              <div className="space-y-6">
                {/* Upcoming Interviews */}
                {getUpcomingInterviews().length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      Upcoming Interviews
                    </h3>
                    {getUpcomingInterviews().map((application) => {
                      const { dateStr, time, timezone } = formatInterviewDateTime(
                        application.interview!.scheduledDate,
                        application.interview!.startTime,
                        application.interview!.timezone
                      );
                      
                      return (
                        <Card key={application.id} className="hover:shadow-lg transition-all duration-200 border-green-200">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-4">
                                {/* Header */}
                                <div className="flex items-start gap-4">
                                  {application.company?.logo && (
                                    <img
                                      src={application.company.logo}
                                      alt={application.company.name || application.companyName || 'Company'}
                                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                      {application.jobTitle}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                      {application.company?.name || application.company?.companyName || application.companyName || 'Company'}
                                    </p>
                                  </div>
                                  <Badge className="bg-green-100 text-green-700 border-green-200">
                                    Upcoming
                                  </Badge>
                                </div>

                                {/* Interview Details */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                      <Calendar className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">Date</p>
                                        <p className="text-gray-900 font-semibold">{dateStr}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <Clock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">Time</p>
                                        <p className="text-gray-900 font-semibold">
                                          {time} {timezone}
                                        </p>
                                      </div>
                                    </div>
                                    {application.interview?.meetingSource && (
                                      <div className="flex items-start gap-3">
                                        <Video className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Platform</p>
                                          <p className="text-gray-900 font-semibold capitalize">
                                            {application.interview.meetingSource}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Meeting Link */}
                                {application.interview?.meetingLink && (
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => window.open(application.interview!.meetingLink, '_blank')}
                                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                    >
                                      <Video className="h-4 w-4 mr-2" />
                                      Join Meeting
                                      <ExternalLink className="h-3 w-3 ml-2" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        navigator.clipboard.writeText(application.interview!.meetingLink!);
                                      }}
                                      className="border-gray-200 hover:bg-gray-50"
                                    >
                                      Copy Link
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Past Interviews */}
                {getPastInterviews().length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-gray-600" />
                      Past Interviews
                    </h3>
                    {getPastInterviews().map((application) => {
                      const { dateStr, time, timezone } = formatInterviewDateTime(
                        application.interview!.scheduledDate,
                        application.interview!.startTime,
                        application.interview!.timezone
                      );
                      
                      return (
                        <Card key={application.id} className="opacity-75 hover:opacity-100 transition-all duration-200 border-gray-300 bg-gray-50">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-4">
                                {/* Header */}
                                <div className="flex items-start gap-4">
                                  {application.company?.logo && (
                                    <img
                                      src={application.company.logo}
                                      alt={application.company.name || application.companyName || 'Company'}
                                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 grayscale"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-700 mb-1">
                                      {application.jobTitle}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                      {application.company?.name || application.company?.companyName || application.companyName || 'Company'}
                                    </p>
                                  </div>
                                  <Badge className="bg-gray-200 text-gray-700 border-gray-300">
                                    Completed
                                  </Badge>
                                </div>

                                {/* Interview Details */}
                                <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-600">Date</p>
                                        <p className="text-gray-700 font-semibold">{dateStr}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-600">Time</p>
                                        <p className="text-gray-700 font-semibold">
                                          {time} {timezone}
                                        </p>
                                      </div>
                                    </div>
                                    {application.interview?.meetingSource && (
                                      <div className="flex items-start gap-3">
                                        <Video className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm font-medium text-gray-600">Platform</p>
                                          <p className="text-gray-700 font-semibold capitalize">
                                            {application.interview.meetingSource}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Past Interview Note */}
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>This interview has already taken place</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Interviews Scheduled</h3>
                  <p className="text-gray-500">
                    Interview invitations and scheduling will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
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
