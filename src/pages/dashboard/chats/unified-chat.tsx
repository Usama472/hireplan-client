import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  Search,
  Mail,
  Phone,
  Globe,
  Plus,
  MoreVertical,
  X,
  Archive,
  Send,
  Paperclip,
  ChevronLeft,
  Users,
  Clock,
  MapPin,
  Briefcase,
  Star,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubscriptionGuard } from "@/components/common/SubscriptionGuard";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import API from "@/http";
import * as emailChatAPI from "@/http/email-chat/api";
// Using local interface definitions for compatibility
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

// Chat interfaces (compatible with existing system)
interface ChatMessage {
  _id: string;
  messageId: string;
  from: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  content: string;
  timestamp: Date;
  direction: "inbound" | "outbound";
  readReceipt: boolean;
  channel: 'email' | 'sms' | 'portal';
  deliveryStatus: 'sent' | 'delivered' | 'failed' | 'read';
  metadata?: any;
}

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
  messages: ChatMessage[];
  channels: ('email' | 'sms' | 'portal')[];
  primaryChannel: 'email' | 'sms' | 'portal';
  metrics?: {
    totalMessages: number;
    unreadCount: number;
    lastActivityAt: Date;
  };
}

interface ApplicantWithConversations {
  applicantId: string;
  applicantName: string;
  applicantInitials: string;
  applicantEmail: string;
  applicantPhone?: string;
  jobTitle?: string;
  city?: string;
  state?: string;
  status?: string;
  conversations: ChatConversation[];
  totalUnread: number;
  lastActivityAt: Date;
  hasActiveConversation: boolean;
  channels: ('email' | 'sms' | 'portal')[];
}

interface ChatListResponse {
  conversations: ChatConversation[];
  total: number;
  page: number;
  totalPages: number;
}

const UnifiedChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { data: authData } = useAuthSessionContext();
  
  // State management
  const [allApplicants, setAllApplicants] = useState<ApplicantWithConversations[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantWithConversations | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user info for message display
  const getCurrentUserInitials = () => {
    if (!authData?.user) return 'YU';
    const { firstName, lastName, email } = authData.user;
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    if (email) return email.split('@')[0].substring(0, 2).toUpperCase();
    return 'YU';
  };

  // Load all conversations and ALL applicants
  const loadAllConversations = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading conversations...');
      
      // Get conversations using the working email chat API
      const conversationsResponse = await emailChatAPI.getConversations({
        page: 1,
        limit: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      console.log('🔍 Raw API Response:', conversationsResponse);
      const conversations = conversationsResponse.data?.conversations || [];
      console.log('🔍 Conversations found:', conversations.length);
      
      // Extract unique applicants from conversation data
      const applicantMap = new Map();
      conversations.forEach(conv => {
        if (conv.applicantId) {
          applicantMap.set(conv.applicantId.id, conv.applicantId);
        }
      });
      const allApplicantsData = Array.from(applicantMap.values());
      
      console.log('🔍 Unique applicants from conversations:', allApplicantsData.length);
      console.log('🔍 Applicant names:', allApplicantsData.map(a => `${a.firstName} ${a.lastName}`));
      
      // Transform conversations to match unified interface expectations
      const transformedConversations = conversations.map(conv => ({
        ...conv,
        channels: ['email'],
        primaryChannel: 'email',
        metrics: {
          totalMessages: conv.messages?.length || 0,
          unreadCount: conv.messages?.filter(m => !m.readAt && m.direction === 'inbound').length || 0,
          lastActivityAt: new Date(conv.lastMessageAt)
        }
      }));

      // Group conversations by applicant
      const applicantGroups = new Map<string, ApplicantWithConversations>();

      // Add all applicants (extracted from conversations)
      allApplicantsData.forEach(applicant => {
        if (applicant.id) {
          applicantGroups.set(applicant.id, {
            applicantId: applicant.id,
            applicantName: `${applicant.firstName || ''} ${applicant.lastName || ''}`.trim(),
            applicantInitials: `${(applicant.firstName || 'U')[0]}${(applicant.lastName || 'A')[0]}`.toUpperCase(),
            applicantEmail: applicant.email,
            applicantPhone: applicant.phone,
            jobTitle: applicant.jobId?.jobTitle,
            city: applicant.city,
            state: applicant.state,
            status: 'active', // Default status since we don't have it in conversation data
            conversations: [],
            totalUnread: 0,
            lastActivityAt: new Date(),
            hasActiveConversation: false,
            channels: []
          });
        }
      });
      
      console.log('🔍 Applicant groups created:', applicantGroups.size);

      // Then add conversation data
      transformedConversations.forEach(conversation => {
        const applicantId = conversation.applicantId?.id; // Use .id to match the group key
        if (!applicantId) return;

        const group = applicantGroups.get(applicantId);
        if (group) {
          group.conversations.push(conversation);
          group.totalUnread += conversation.metrics?.unreadCount || 0;
          group.hasActiveConversation = conversation.status === 'active';
          group.lastActivityAt = new Date(conversation.lastMessageAt);
          
          // Merge channels
          conversation.channels.forEach(channel => {
            if (!group.channels.includes(channel)) {
              group.channels.push(channel);
            }
          });
        } else {
          console.log('⚠️ No group found for applicant ID:', applicantId);
        }
      });

      // Convert to array and sort by last activity
      const groupedApplicants = Array.from(applicantGroups.values())
        .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());

      setAllApplicants(groupedApplicants);

      // Auto-select conversation if URL parameter is provided
      if (conversationId && conversations.length > 0) {
        const targetConversation = conversations.find(c => c.conversationId === conversationId);
        if (targetConversation) {
          const applicant = groupedApplicants.find(a => a.applicantId === targetConversation.applicantId?._id);
          if (applicant) {
            setSelectedApplicant(applicant);
            setSelectedConversation(targetConversation);
            setMessages(targetConversation.messages || []);
          }
        }
      }

    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  // Filter applicants based on search and filters
  const filteredApplicants = useMemo(() => {
    let filtered = allApplicants;

    // Search filter
    if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(applicant => 
        applicant.applicantName.toLowerCase().includes(searchLower) ||
        applicant.applicantEmail.toLowerCase().includes(searchLower) ||
        applicant.jobTitle?.toLowerCase().includes(searchLower) ||
        applicant.conversations.some(conv => 
          conv.subject.toLowerCase().includes(searchLower)
        )
      );
    }

    // Status filter - only show those with conversations if filtering by conversation status
    if (statusFilter !== "all") {
      filtered = filtered.filter(applicant => 
        applicant.conversations.some(conv => conv.status === statusFilter)
      );
    }

    // Channel filter
    if (channelFilter !== "all") {
      filtered = filtered.filter(applicant => 
        applicant.channels.includes(channelFilter as any)
      );
    }

    return filtered;
  }, [allApplicants, searchTerm, statusFilter, channelFilter]);

  // Handle applicant selection
  const handleApplicantSelect = (applicant: ApplicantWithConversations) => {
    setSelectedApplicant(applicant);
    
    if (applicant.conversations.length > 0) {
      // Select the most recent conversation
      const latestConversation = applicant.conversations[0];
      setSelectedConversation(latestConversation);
      
      // Extract and set messages from the conversation
      const conversationMessages = latestConversation.messages || [];
      console.log('🔍 Loading messages for conversation:', latestConversation.conversationId, 'Messages:', conversationMessages.length);
      
      // Transform messages to match expected format
      const transformedMessages = conversationMessages.map(msg => ({
        ...msg,
        content: msg.textContent || msg.htmlContent || '',
        textContent: msg.textContent,
        htmlContent: msg.htmlContent
      }));
      
      setMessages(transformedMessages);
      navigate(`/dashboard/chats/${latestConversation.conversationId}`);
    } else {
      // No existing conversation
      setSelectedConversation(null);
      setMessages([]);
    }
  };

  // Start new conversation
  const startNewConversation = async (applicant: ApplicantWithConversations, channel: 'email' | 'sms' | 'portal' = 'email') => {
    try {
      const conversationData = {
        to: applicant.applicantEmail,
        subject: `Chat: ${applicant.jobTitle || 'Job Application'}`,
        content: `Hi ${applicant.applicantName.split(' ')[0]}, I'd like to discuss your application.`,
        channel,
        applicantId: applicant.applicantId,
        jobId: applicant.conversations[0]?.applicantId?.jobId?._id, // Get from existing data
      };

      // Use existing email chat API for conversation creation
      const response = await emailChatAPI.createConversation({
        to: conversationData.to,
        subject: conversationData.subject,
        htmlContent: conversationData.content,
        textContent: conversationData.content,
        jobId: conversationData.jobId,
        applicantId: conversationData.applicantId,
      });
      
      if (response.status) {
        toast.success(`${channel.toUpperCase()} conversation started!`);
        await loadAllConversations(); // Refresh data
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Send message
  const handleSendMessage = async (channel: 'email' | 'sms' | 'portal' = 'email') => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      
      const messageData = {
        content: newMessage,
        htmlContent: newMessage, // Could enhance with rich text
        channel,
      };

      // Use existing email chat API for now
      await emailChatAPI.sendMessage(selectedConversation.conversationId, messageData);
      
      setNewMessage("");
      
      // Refresh conversation using existing API
      const updatedConversation = await emailChatAPI.getConversation(selectedConversation.conversationId);
      if (updatedConversation.status) {
        const transformedConv = {
          ...updatedConversation.data.conversation,
          channels: ['email'],
          primaryChannel: 'email',
          metrics: {
            totalMessages: updatedConversation.data.conversation.messages?.length || 0,
            unreadCount: updatedConversation.data.conversation.messages?.filter(m => !m.readAt && m.direction === 'inbound').length || 0,
            lastActivityAt: new Date(updatedConversation.data.conversation.lastMessageAt)
          }
        };
        setSelectedConversation(transformedConv);
        setMessages(transformedConv.messages || []);
      }
      
      toast.success(`${channel.toUpperCase()} message sent!`);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effects
  useEffect(() => {
    loadAllConversations();
  }, [statusFilter, channelFilter]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get channel icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="h-3 w-3" />;
      case 'sms': return <Phone className="h-3 w-3" />;
      case 'portal': return <Globe className="h-3 w-3" />;
      default: return <MessageCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex bg-gray-50">
      {/* Left Sidebar - Applicants List (Always Visible) */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-2.5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-gray-900">Applicants</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs py-0 px-1.5">
              {filteredApplicants.length}
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-2.5 border-b border-gray-200 space-y-1.5">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-full h-8 text-xs">
              <SelectValue placeholder="Filter by channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">📧 Email</SelectItem>
              <SelectItem value="sms">📱 SMS</SelectItem>
              <SelectItem value="portal">💬 Portal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Applicants List */}
        <ScrollArea className="flex-1">
          <div className="p-1.5 space-y-0.5">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-2 rounded-lg animate-pulse">
                  <div className="flex items-start gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredApplicants.length === 0 ? (
              <div className="p-6 text-center">
                <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">No applicants found</p>
              </div>
            ) : (
              filteredApplicants.map((applicant) => (
                <div
                  key={applicant.applicantId}
                  onClick={() => handleApplicantSelect(applicant)}
                  className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedApplicant?.applicantId === applicant.applicantId
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                        {/* Avatar with unread indicator */}
                        <div className="relative">
                      <Avatar className="h-10 w-10">
                            <AvatarImage src={undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                          {applicant.applicantInitials}
                            </AvatarFallback>
                          </Avatar>
                      {applicant.totalUnread > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {applicant.totalUnread > 9 ? "9+" : applicant.totalUnread}
                            </div>
                          )}
                        </div>

                    {/* Applicant Info */}
                        <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900 truncate">
                          {applicant.applicantName}
                            </h3>
                            <div className="flex items-center gap-1">
                          {applicant.channels.map(channel => (
                            <div key={channel} className="text-gray-400">
                                  {getChannelIcon(channel)}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                      <p className="text-sm text-gray-600 truncate">
                        {applicant.jobTitle}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {applicant.conversations.length > 0 
                            ? `${applicant.conversations.length} conversation${applicant.conversations.length > 1 ? 's' : ''}`
                            : 'No conversations'
                          }
                            </span>
                        
                        {applicant.hasActiveConversation && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      
                      {applicant.conversations.length === 0 && (
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              startNewConversation(applicant, 'email');
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            📧 Email
                          </Button>
                          {applicant.applicantPhone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                startNewConversation(applicant, 'sms');
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              📱 SMS
                            </Button>
                          )}
                        </div>
                      )}
                          </div>
                        </div>
                      </div>
              ))}
            </div>
          </ScrollArea>
        </div>

      {/* Right Panel - Chat Area (Always Visible) */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedApplicant ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                      {selectedApplicant.applicantInitials}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedApplicant.applicantName}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedApplicant.jobTitle}
                    </p>
                  </div>
                </div>

                  <div className="flex items-center gap-2">
                    {/* Conversation selector */}
                    {selectedApplicant.conversations.length > 1 && (
                      <Select 
                        value={selectedConversation?.conversationId || ""} 
                        onValueChange={(value) => {
                          const conv = selectedApplicant.conversations.find(c => c.conversationId === value);
                          if (conv) {
                            setSelectedConversation(conv);
                            setMessages(conv.messages || []);
                          }
                        }}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select conversation" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedApplicant.conversations.map(conv => (
                            <SelectItem key={conv.conversationId} value={conv.conversationId}>
                              <div className="flex items-center gap-2">
                                {getChannelIcon(conv.primaryChannel)}
                                <span className="truncate">{conv.subject}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {selectedApplicant.conversations.length === 0 && (
                          <>
                            <DropdownMenuItem onClick={() => startNewConversation(selectedApplicant, 'email')}>
                              <Mail className="h-4 w-4 mr-2" />
                              Start Email Chat
                        </DropdownMenuItem>
                            {selectedApplicant.applicantPhone && (
                              <DropdownMenuItem onClick={() => startNewConversation(selectedApplicant, 'sms')}>
                                <Phone className="h-4 w-4 mr-2" />
                                Start SMS Chat
                        </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => startNewConversation(selectedApplicant, 'portal')}>
                              <Globe className="h-4 w-4 mr-2" />
                              Start Portal Chat
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                          </>
                        )}
                        
                        {selectedConversation && (
                          <>
                            <DropdownMenuItem onClick={() => API.chat.archiveConversation(selectedConversation.conversationId)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => API.chat.closeConversation(selectedConversation.conversationId)}>
                          <X className="h-4 w-4 mr-2" />
                          Close
                        </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>

              {/* Applicant Details - Always Visible */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">{selectedApplicant.applicantEmail}</span>
                  </div>
                  
                  {selectedApplicant.applicantPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{selectedApplicant.applicantPhone}</span>
                    </div>
                  )}
                  
                  {(selectedApplicant.city || selectedApplicant.state) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <span className="text-gray-700">
                        {[selectedApplicant.city, selectedApplicant.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {selectedApplicant.status && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <Badge variant="outline" className="text-xs">
                        {selectedApplicant.status}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              </div>

              {/* Messages Area */}
              {selectedConversation ? (
                <>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                      {messages.map((message) => (
                    <div
                      key={message.messageId}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                          <div className={`flex gap-2 max-w-xs sm:max-w-md ${message.direction === 'outbound' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                            <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className={`text-xs ${
                            message.direction === 'inbound' 
                              ? 'bg-gray-300 text-gray-600' 
                              : 'bg-blue-500 text-white'
                          }`}>
                            {message.direction === 'inbound' 
                                  ? selectedApplicant.applicantInitials 
                              : getCurrentUserInitials()
                            }
                          </AvatarFallback>
                        </Avatar>

                        <div className={`flex flex-col ${message.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
                              <div className={`px-3 py-2 rounded-2xl shadow-sm ${
                              message.direction === 'outbound'
                                ? 'bg-blue-500 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                              }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.content}
                            </div>
                          </div>
                          
                          {/* Message metadata */}
                              <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                            message.direction === 'outbound' ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                            <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
                            <div className="flex items-center gap-1">
                              {getChannelIcon(message.channel)}
                              <span>{message.channel}</span>
                            </div>
                            {message.deliveryStatus === 'read' && (
                                  <span className="text-blue-500">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                          className="min-h-[60px] resize-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(selectedConversation.primaryChannel);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        {/* Channel send buttons */}
                        {selectedConversation.channels.map(channel => (
                          <Button
                            key={channel}
                            size="sm"
                            onClick={() => handleSendMessage(channel)}
                            disabled={!newMessage.trim() || sending}
                            className="h-9 px-3"
                          >
                            {getChannelIcon(channel)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* No conversation selected */
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center p-8">
                    <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Start a conversation with {selectedApplicant.applicantName}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Choose how you'd like to reach out to this applicant.
                    </p>
                    
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => startNewConversation(selectedApplicant, 'email')}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      
                      {selectedApplicant.applicantPhone && (
                        <Button variant="outline" onClick={() => startNewConversation(selectedApplicant, 'sms')}>
                          <Phone className="h-4 w-4 mr-2" />
                          Send SMS
                        </Button>
                      )}
                      
                      <Button variant="outline" onClick={() => startNewConversation(selectedApplicant, 'portal')}>
                        <Globe className="h-4 w-4 mr-2" />
                        Portal Chat
                  </Button>
                </div>
              </div>
                </div>
              )}
            </>
        ) : (
          /* No applicant selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-12">
              <MessageCircle className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Select an applicant to start chatting
              </h3>
              <p className="text-gray-600 text-lg">
                Choose from the list on the left to view conversations or start new ones.
              </p>
              
              {filteredApplicants.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg inline-block">
                  <p className="text-blue-700 text-sm font-medium">
                    💡 Click on any applicant name to view their conversations
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedChatPage;
