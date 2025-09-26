import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  Search,
  Filter,
  Clock,
  Briefcase,
  Mail,
  Archive,
  MoreVertical,
  X,
  UserCheck,
  Phone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubscriptionGuard } from "@/components/common/SubscriptionGuard";
// Layout is provided by PrivateRoute
import * as emailChatAPI from "@/http/email-chat/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ChatConversation {
  _id: string;
  conversationId: string;
  subject: string;
  participants: Array<{
    email: string;
    name?: string;
    role: "recruiter" | "applicant";
    userId?: string;
    applicantId?: string;
  }>;
  status: "active" | "closed" | "archived";
  lastMessageAt: Date;
  metadata?: {
    source?: 'email' | 'sms' | 'portal';
    smsInviteSent?: boolean;
    [key: string]: any;
  };
  applicantId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    city?: string;
    state?: string;
    jobId?: {
      _id: string;
      jobTitle: string;
      department?: string;
      location?: string;
    };
  };
  messages: Array<{
    _id: string;
    from: string;
    subject: string;
    htmlContent?: string;
    textContent?: string;
    timestamp: Date;
    direction: "inbound" | "outbound";
    readReceipt: boolean;
  }>;
}

interface ChatListResponse {
  conversations: ChatConversation[];
  total: number;
  page: number;
  totalPages: number;
}

interface GroupedConversation {
  applicantId: string;
  applicantName: string;
  applicantInitials: string;
  jobTitle?: string;
  conversations: ChatConversation[];
  latestConversation: ChatConversation;
  totalUnread: number;
}

const ChatsPage: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [applicantStatusFilter, setApplicantStatusFilter] =
    useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, [page, statusFilter]);

  const getUnreadCount = (conversation: ChatConversation) => {
    return conversation.messages.filter(
      (msg) => msg.direction === "inbound" && !msg.readReceipt
    ).length;
  };

  const getLastMessage = (conversation: ChatConversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage) return "No messages";

    const content = lastMessage.textContent || lastMessage.htmlContent || "";
    return content.length > 100 ? `${content.substring(0, 100)}...` : content;
  };

  const getApplicantName = (conversation: ChatConversation) => {
    if (conversation.applicantId) {
      return `${conversation.applicantId.firstName} ${conversation.applicantId.lastName}`;
    }

    // Fallback to participant email
    const applicantParticipant = conversation.participants.find(
      (p) => p.role === "applicant"
    );
    return (
      applicantParticipant?.name ||
      applicantParticipant?.email ||
      "Unknown Applicant"
    );
  };

  const getApplicantInitials = (conversation: ChatConversation) => {
    if (conversation.applicantId) {
      return `${conversation.applicantId.firstName[0]}${conversation.applicantId.lastName[0]}`;
    }

    const applicantParticipant = conversation.participants.find(
      (p) => p.role === "applicant"
    );
    const name =
      applicantParticipant?.name || applicantParticipant?.email || "UA";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const groupConversationsByApplicant = (
    conversations: ChatConversation[]
  ): GroupedConversation[] => {
    const grouped = conversations.reduce((acc, conversation) => {
      const applicantId = conversation.applicantId?._id || "unknown";

      if (!acc[applicantId]) {
        acc[applicantId] = {
          applicantId,
          applicantName: getApplicantName(conversation),
          applicantInitials: getApplicantInitials(conversation),
          jobTitle: conversation.applicantId?.jobId?.jobTitle,
          conversations: [],
          latestConversation: conversation,
          totalUnread: 0,
        };
      }

      acc[applicantId].conversations.push(conversation);

      // Update latest conversation if this one is more recent
      if (
        new Date(conversation.lastMessageAt) >
        new Date(acc[applicantId].latestConversation.lastMessageAt)
      ) {
        acc[applicantId].latestConversation = conversation;
      }

      // Add unread count
      acc[applicantId].totalUnread += getUnreadCount(conversation);

      return acc;
    }, {} as Record<string, GroupedConversation>);

    // Convert to array and sort by latest message
    return Object.values(grouped).sort(
      (a, b) =>
        new Date(b.latestConversation.lastMessageAt).getTime() -
        new Date(a.latestConversation.lastMessageAt).getTime()
    );
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await emailChatAPI.getConversations({
        page,
        limit: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      if (response.status) {
        const data = response.data as ChatListResponse;
        console.log("🔍 Chat conversations loaded:", data.conversations);
        setConversations(data.conversations || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const groupedConversations = useMemo(
    () => groupConversationsByApplicant(conversations),
    [conversations]
  );

  const filteredGroups = useMemo(
    () =>
      groupedConversations.filter((group) => {
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const applicantName = group.applicantName.toLowerCase();
          const jobTitle = group.jobTitle?.toLowerCase() || "";

          // Also search in conversation subjects
          const subjectMatches = group.conversations.some((conv) =>
            conv.subject.toLowerCase().includes(searchLower)
          );

          const matchesSearch =
            applicantName.includes(searchLower) ||
            jobTitle.includes(searchLower) ||
            subjectMatches;

          if (!matchesSearch) return false;
        }

        // Applicant status filter
        if (applicantStatusFilter !== "all") {
          // This would need to be enhanced when we have applicant status data
          // For now, we'll show all groups when 'all' is selected
          // In a real implementation, you'd filter based on the applicant's status
          // which should be available in the conversation data
        }

        return true;
      }),
    [groupedConversations, searchTerm, applicantStatusFilter]
  );

  const handleGroupClick = (group: GroupedConversation) => {
    // For now, navigate to the latest conversation
    // Later we could create a unified view for all conversations with this applicant
    navigate(`/dashboard/chats/${group.latestConversation.conversationId}`);
  };

  const handleArchiveConversation = async (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await emailChatAPI.archiveConversation(conversationId);
      toast.success("Conversation archived");
      loadConversations();
    } catch {
      toast.error("Failed to archive conversation");
    }
  };

  const handleCloseConversation = async (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await emailChatAPI.closeConversation(conversationId);
      toast.success("Conversation closed");
      loadConversations();
    } catch {
      toast.error("Failed to close conversation");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "archived":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SubscriptionGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-none">
          {/* Mobile Header */}
          <div className="block lg:hidden bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      Conversations
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {filteredGroups.length} conversations
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border-gray-300 rounded-xl px-3 py-2"
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archived
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-3 bg-blue-50 rounded-xl flex-shrink-0">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-gray-900 truncate">
                    Conversations
                  </h1>
                  <div className="text-base text-gray-600 flex items-center gap-2 flex-wrap">
                    <span className="text-sm">
                      Manage all your applicant communications
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 text-xs border-blue-200"
                    >
                      {filteredGroups.length} active
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="gap-2 bg-white hover:bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                >
                  <Archive className="h-4 w-4" />
                  View Archived
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Filters and Search */}
          <div className="block lg:hidden px-4 py-3 bg-white border-b border-gray-100">
            {/* Search Bar */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm rounded-xl"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-shrink-0 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors">
                    <Filter className="h-4 w-4 mr-1 inline" />
                    {statusFilter === "all" ? "All Chats" : statusFilter}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("all")}
                    className="gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    All Conversations
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("active")}
                    className="gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("closed")}
                    className="gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                    Closed
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("archived")}
                    className="gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Archived
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-shrink-0 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors">
                    <UserCheck className="h-4 w-4 mr-1 inline" />
                    {applicantStatusFilter === "all"
                      ? "All"
                      : applicantStatusFilter}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuItem
                    onClick={() => setApplicantStatusFilter("all")}
                    className="gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    All Applicants
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setApplicantStatusFilter("shortlisted")}
                    className="gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Shortlisted
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setApplicantStatusFilter("rejected")}
                    className="gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Rejected
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setApplicantStatusFilter("pending")}
                    className="gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Pending Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop Filters and Search */}
          <div className="hidden lg:block px-6 py-4 bg-gray-50">
            <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search conversations by name, job title, or message content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-base shadow-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 h-12 px-4 bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Chat:</span>{" "}
                      {statusFilter === "all" ? "All" : statusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("all")}
                      className="gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      All Conversations
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("active")}
                      className="gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("closed")}
                      className="gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      Closed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter("archived")}
                      className="gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Archived
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 h-12 px-4 bg-white border-gray-200 hover:bg-gray-50"
                    >
                      <UserCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">Status:</span>{" "}
                      {applicantStatusFilter === "all"
                        ? "All"
                        : applicantStatusFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem
                      onClick={() => setApplicantStatusFilter("all")}
                      className="gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      All Applicants
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setApplicantStatusFilter("shortlisted")}
                      className="gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Shortlisted
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setApplicantStatusFilter("rejected")}
                      className="gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Rejected
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setApplicantStatusFilter("pending")}
                      className="gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Pending Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Enhanced Conversations List */}
          <div className="px-4 lg:px-6 py-4 lg:py-6">
            <div className="space-y-4 max-w-7xl mx-auto">
              {loading ? (
                <>
                  {/* Mobile Loading */}
                  <div className="block sm:hidden space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Loading */}
                  <Card className="hidden sm:block">
                    <CardContent className="p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 text-lg">
                        Loading conversations...
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : filteredGroups.length === 0 ? (
                <>
                  {/* Mobile Empty State */}
                  <div className="block sm:hidden text-center p-6 bg-white rounded-2xl border border-gray-100">
                    <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No conversations found
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {searchTerm
                        ? "Try adjusting your search criteria."
                        : "Conversations will appear here when applicants message you."}
                    </p>
                  </div>

                  {/* Desktop Empty State */}
                  <Card className="hidden sm:block">
                    <CardContent className="p-12 text-center">
                      <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="h-10 w-10 text-blue-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No conversations found
                      </h3>
                      <p className="text-gray-600 text-base max-w-md mx-auto">
                        {searchTerm
                          ? "Try adjusting your search criteria to find conversations."
                          : "When applicants start messaging you, their conversations will appear here."}
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Mobile: Flowing Conversation Cards */}
                  <div className="block sm:hidden space-y-4">
                    {filteredGroups.map((group) => {
                      const lastMessage = getLastMessage(
                        group.latestConversation
                      );

                      return (
                        <div
                          key={group.applicantId}
                          onClick={() => handleGroupClick(group)}
                          className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                          {/* Status accent bar */}
                          <div
                            className={`absolute top-0 left-0 right-0 h-1 ${
                              group.latestConversation.status === "active"
                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                : group.latestConversation.status === "closed"
                                ? "bg-gradient-to-r from-gray-400 to-gray-600"
                                : "bg-gradient-to-r from-yellow-400 to-yellow-600"
                            }`}
                          />

                          <div className="p-4">
                            {/* Header with avatar */}
                            <div className="flex items-center space-x-3 mb-4">
                              <div className="relative">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                  <AvatarImage src={undefined} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                    {group.applicantInitials}
                                  </AvatarFallback>
                                </Avatar>
                                {group.totalUnread > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                                    {group.totalUnread > 9
                                      ? "9+"
                                      : group.totalUnread}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1 truncate text-base">
                                  {group.applicantName}
                                </h3>
                                <div className="flex items-center gap-2">
                                  {group.conversations.length > 1 && (
                                    <div className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                      {group.conversations.length} threads
                                    </div>
                                  )}
                                  <div
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      group.latestConversation.status ===
                                      "active"
                                        ? "bg-green-100 text-green-700"
                                        : group.latestConversation.status ===
                                          "closed"
                                        ? "bg-gray-100 text-gray-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {group.latestConversation.status}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Job and Subject Info */}
                            <div className="space-y-2 mb-4">
                              {group.jobTitle && (
                                <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                                  <Briefcase className="h-4 w-4" />
                                  <span className="font-medium truncate">
                                    {group.jobTitle}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
                                <Mail className="h-4 w-4" />
                                <span className="truncate font-medium">
                                  {group.latestConversation.subject}
                                </span>
                              </div>
                              {group.latestConversation.metadata?.source === 'sms' && (
                                <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 rounded-lg px-3 py-2">
                                  <Phone className="h-4 w-4" />
                                  <span className="truncate font-medium">
                                    Started via SMS invitation
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Message Preview */}
                            <div className="bg-gray-50 rounded-xl p-3 mb-4">
                              <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                {lastMessage}
                              </p>
                            </div>

                            {/* Footer with time and actions */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(
                                      group.latestConversation.lastMessageAt
                                    ),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  {group.latestConversation.status ===
                                    "active" && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={(e) =>
                                          handleCloseConversation(
                                            group.latestConversation
                                              .conversationId,
                                            e
                                          )
                                        }
                                        className="gap-2"
                                      >
                                        <X className="h-4 w-4" />
                                        Close conversation
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) =>
                                          handleArchiveConversation(
                                            group.latestConversation
                                              .conversationId,
                                            e
                                          )
                                        }
                                        className="gap-2"
                                      >
                                        <Archive className="h-4 w-4" />
                                        Archive
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop: Traditional Cards */}
                  <div className="hidden sm:grid gap-4">
                    {filteredGroups.map((group) => {
                      const lastMessage = getLastMessage(
                        group.latestConversation
                      );

                      return (
                        <Card
                          key={group.applicantId}
                          onClick={() => handleGroupClick(group)}
                          className="hover:shadow-md cursor-pointer transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500 bg-white"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              {/* Enhanced Avatar */}
                              <div className="relative">
                                <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                                  <AvatarImage src={undefined} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                                    {group.applicantInitials}
                                  </AvatarFallback>
                                </Avatar>
                                {group.totalUnread > 0 && (
                                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                                    {group.totalUnread > 9
                                      ? "9+"
                                      : group.totalUnread}
                                  </div>
                                )}
                              </div>

                              {/* Enhanced Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="font-semibold text-gray-900 text-lg truncate">
                                        {group.applicantName}
                                      </h3>
                                      <div className="flex items-center gap-2">
                                        {group.conversations.length > 1 && (
                                          <Badge
                                            variant="secondary"
                                            className="bg-purple-50 text-purple-700 border-purple-200"
                                          >
                                            {group.conversations.length} threads
                                          </Badge>
                                        )}
                                        <Badge
                                          className={`${getStatusColor(
                                            group.latestConversation.status
                                          )} border-0`}
                                        >
                                          {group.latestConversation.status}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                                      {group.jobTitle ? (
                                        <div className="flex items-center gap-2">
                                          <Briefcase className="h-4 w-4 text-blue-500" />
                                          <span className="font-medium truncate">
                                            {group.jobTitle}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 text-gray-400">
                                          <Briefcase className="h-4 w-4" />
                                          <span className="text-sm italic">
                                            No job linked
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-green-500" />
                                        <span className="truncate font-medium">
                                          {group.latestConversation.subject}
                                        </span>
                                      </div>
                                      {group.latestConversation.metadata?.source === 'sms' && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-4 w-4 text-purple-500" />
                                          <span className="truncate font-medium text-purple-700">
                                            Started via SMS invitation
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-3 border">
                                      <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                        {lastMessage}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Enhanced Actions */}
                                  <div className="flex items-center gap-3 ml-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                      <Clock className="h-4 w-4" />
                                      <span className="font-medium">
                                        {formatDistanceToNow(
                                          new Date(
                                            group.latestConversation.lastMessageAt
                                          ),
                                          { addSuffix: true }
                                        )}
                                      </span>
                                    </div>

                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-10 w-10 p-0 hover:bg-gray-100 rounded-full"
                                        >
                                          <MoreVertical className="h-5 w-5" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="w-48"
                                      >
                                        {group.latestConversation.status ===
                                          "active" && (
                                          <>
                                            <DropdownMenuItem
                                              onClick={(e) =>
                                                handleCloseConversation(
                                                  group.latestConversation
                                                    .conversationId,
                                                  e
                                                )
                                              }
                                              className="gap-2"
                                            >
                                              <X className="h-4 w-4" />
                                              Close conversation
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={(e) =>
                                                handleArchiveConversation(
                                                  group.latestConversation
                                                    .conversationId,
                                                  e
                                                )
                                              }
                                              className="gap-2"
                                            >
                                              <Archive className="h-4 w-4" />
                                              Archive
                                            </DropdownMenuItem>
                                          </>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 lg:px-6 pb-6">
              {/* Mobile Pagination */}
              <div className="block sm:hidden">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="flex-1 mr-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Button>

                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                    {page} of {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="flex-1 ml-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </div>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden sm:flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </SubscriptionGuard>
  );
};

export default ChatsPage;
