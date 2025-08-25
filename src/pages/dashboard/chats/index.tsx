import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Clock, 
  Briefcase,
  Mail,
  Archive,
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SubscriptionGuard } from '@/components/common/SubscriptionGuard';
// Layout is provided by PrivateRoute
import * as emailChatAPI from '@/http/email-chat/api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ChatConversation {
  _id: string;
  conversationId: string;
  subject: string;
  participants: Array<{
    email: string;
    name?: string;
    role: 'recruiter' | 'applicant';
    userId?: string;
    applicantId?: string;
  }>;
  status: 'active' | 'closed' | 'archived';
  lastMessageAt: Date;
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
    direction: 'inbound' | 'outbound';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, [page, statusFilter]);

  const getUnreadCount = (conversation: ChatConversation) => {
    return conversation.messages.filter(msg => 
      msg.direction === 'inbound' && !msg.readReceipt
    ).length;
  };

  const getLastMessage = (conversation: ChatConversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage) return 'No messages';
    
    const content = lastMessage.textContent || lastMessage.htmlContent || '';
    return content.length > 100 ? `${content.substring(0, 100)}...` : content;
  };

  const getApplicantName = (conversation: ChatConversation) => {
    if (conversation.applicantId) {
      return `${conversation.applicantId.firstName} ${conversation.applicantId.lastName}`;
    }
    
    // Fallback to participant email
    const applicantParticipant = conversation.participants.find(p => p.role === 'applicant');
    return applicantParticipant?.name || applicantParticipant?.email || 'Unknown Applicant';
  };

  const getApplicantInitials = (conversation: ChatConversation) => {
    if (conversation.applicantId) {
      return `${conversation.applicantId.firstName[0]}${conversation.applicantId.lastName[0]}`;
    }
    
    const applicantParticipant = conversation.participants.find(p => p.role === 'applicant');
    const name = applicantParticipant?.name || applicantParticipant?.email || 'UA';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const groupConversationsByApplicant = (conversations: ChatConversation[]): GroupedConversation[] => {
    const grouped = conversations.reduce((acc, conversation) => {
      const applicantId = conversation.applicantId?._id || 'unknown';
      
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
      if (new Date(conversation.lastMessageAt) > new Date(acc[applicantId].latestConversation.lastMessageAt)) {
        acc[applicantId].latestConversation = conversation;
      }
      
      // Add unread count
      acc[applicantId].totalUnread += getUnreadCount(conversation);
      
      return acc;
    }, {} as Record<string, GroupedConversation>);

    // Convert to array and sort by latest message
    return Object.values(grouped).sort((a, b) => 
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
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (response.status) {
        const data = response.data as ChatListResponse;
        console.log('🔍 Chat conversations loaded:', data.conversations);
        setConversations(data.conversations || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const groupedConversations = useMemo(() => 
    groupConversationsByApplicant(conversations), 
    [conversations]
  );
  
  const filteredGroups = useMemo(() => 
    groupedConversations.filter(group => {
      if (!searchTerm) return true;
      
      const searchLower = searchTerm.toLowerCase();
      const applicantName = group.applicantName.toLowerCase();
      const jobTitle = group.jobTitle?.toLowerCase() || '';
      
      // Also search in conversation subjects
      const subjectMatches = group.conversations.some(conv => 
        conv.subject.toLowerCase().includes(searchLower)
      );
      
      return applicantName.includes(searchLower) || 
             jobTitle.includes(searchLower) || 
             subjectMatches;
    }), 
    [groupedConversations, searchTerm]
  );



  const handleGroupClick = (group: GroupedConversation) => {
    // For now, navigate to the latest conversation
    // Later we could create a unified view for all conversations with this applicant
    navigate(`/dashboard/chats/${group.latestConversation.conversationId}`);
  };

  const handleArchiveConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await emailChatAPI.archiveConversation(conversationId);
      toast.success('Conversation archived');
      loadConversations();
    } catch (error) {
      toast.error('Failed to archive conversation');
    }
  };

  const handleCloseConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await emailChatAPI.closeConversation(conversationId);
      toast.success('Conversation closed');
      loadConversations();
    } catch (error) {
      toast.error('Failed to close conversation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SubscriptionGuard>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
                <p className="text-gray-600">Manage conversations with applicants</p>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by applicant name, job title, or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Status: {statusFilter === 'all' ? 'All' : statusFilter}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                        All Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('closed')}>
                        Closed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('archived')}>
                        Archived
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations ({filteredGroups.length} applicants)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading conversations...</p>
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search criteria.' : 'Start chatting with applicants to see conversations here.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredGroups.map((group) => {
                    const lastMessage = getLastMessage(group.latestConversation);
                    
                    // Debug logging
                    console.log('🔍 Group:', group);

                    return (
                      <div
                        key={group.applicantId}
                        onClick={() => handleGroupClick(group)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                              {group.applicantInitials}
                            </AvatarFallback>
                          </Avatar>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-gray-900 truncate">
                                    {group.applicantName}
                                  </h3>
                                  {group.conversations.length > 1 && (
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                      {group.conversations.length} chats
                                    </Badge>
                                  )}
                                  {group.totalUnread > 0 && (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                      {group.totalUnread} new
                                    </Badge>
                                  )}
                                  <Badge className={getStatusColor(group.latestConversation.status)}>
                                    {group.latestConversation.status}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                  {group.jobTitle ? (
                                    <div className="flex items-center gap-1">
                                      <Briefcase className="h-3 w-3" />
                                      <span className="truncate">{group.jobTitle}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1 text-gray-400">
                                      <Briefcase className="h-3 w-3" />
                                      <span className="truncate text-xs">No job linked</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">{group.latestConversation.subject}</span>
                                  </div>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {lastMessage}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 ml-2">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {formatDistanceToNow(new Date(group.latestConversation.lastMessageAt), { addSuffix: true })}
                                  </span>
                                </div>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {group.latestConversation.status === 'active' && (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={(e) => handleCloseConversation(group.latestConversation.conversationId, e)}
                                        >
                                          Close conversation
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => handleArchiveConversation(group.latestConversation.conversationId, e)}
                                        >
                                          <Archive className="mr-2 h-4 w-4" />
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
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
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
          )}
        </div>
    </SubscriptionGuard>
  );
};

export default ChatsPage;
