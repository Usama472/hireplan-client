import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ChatProvider, useChatContext } from "@/lib/context/ChatContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChatRichTextEditor } from "@/components/dashboard/chats/ChatRichTextEditor";
import { AIFollowupMessage } from "@/components/dashboard/chats/AIFollowupMessage";
import {
  MessageCircle,
  Search,
  Mail,
  Phone,
  Globe,
  Send,
  Users,
  MapPin,
  Briefcase,
  Clock,
  UserCheck,
  UserX,
  MoreVertical,
  FileText,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import API from "@/http";
import * as emailChatAPI from "@/http/email-chat/api";

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  jobTitle?: string;
  status?: string;
  aiEvaluation?: {
    totalScore: number;
    recommendationLevel?: string;
  };
  conversations: any[]; // Separate conversations, each can have mixed channels
  totalUnread: number;
  lastActivityAt: Date;
}

const SimpleUnifiedChatInner: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { data: authData } = useAuthSessionContext();
  const { refreshTrigger, conversationUpdated } = useChatContext();
  
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current user initials for messages
  const getUserInitials = () => {
    if (!authData?.user) return 'YU';
    const { firstName, lastName, email } = authData.user;
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    if (email) return email.split('@')[0].substring(0, 2).toUpperCase();
    return 'YU';
  };

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get all conversations
      const response = await emailChatAPI.getConversations({
        page: 1,
        limit: 50,
      });

      const conversations = response.data?.conversations || [];
      console.log('📋 Found conversations:', conversations.length);
      if (conversations.length > 0) {
        console.log('📋 Sample conversation:', conversations[0]);
      }

      // Group ALL messages by applicant into unified conversations
      const applicantMap = new Map<string, Applicant>();
      
      let skippedCount = 0;
      conversations.forEach((conv: any) => {
        // Safety check
        if (!conv) {
          skippedCount++;
          return;
        }

        // Handle conversations without applicantId (should be fixed now, but log for debugging)
        if (!conv.applicantId) {
          console.error('⚠️ CRITICAL: Conversation STILL without applicantId:', {
            conversationId: conv.conversationId,
            subject: conv.subject,
            hasParticipants: !!conv.participants,
            participants: conv.participants
          });
          skippedCount++;
          return;
        }
        
        const applicantId = conv.applicantId?.id || conv.applicantId?._id || conv.applicantId;
        if (!applicantId) {
          console.warn('⚠️ Could not extract applicantId:', conv.conversationId);
          skippedCount++;
          return;
        }
        
        const applicantData = conv.applicantId;
        
        if (!applicantMap.has(applicantId)) {
          applicantMap.set(applicantId, {
            id: applicantId,
            firstName: applicantData?.firstName || 'Unknown',
            lastName: applicantData?.lastName || 'Applicant',
            email: applicantData?.email || conv.participants?.find((p: any) => p.role === 'applicant')?.email || 'unknown@email.com',
            phone: applicantData?.phone,
            city: applicantData?.city,
            state: applicantData?.state,
            jobTitle: applicantData?.jobId?.jobTitle,
            status: applicantData?.status || 'pending',
            aiEvaluation: applicantData?.aiEvaluation,
            conversations: [], // This will hold separate conversations
            totalUnread: 0,
            lastActivityAt: new Date(conv.lastMessageAt || Date.now()),
          });
        }
        
        const applicant = applicantMap.get(applicantId)!;
        
        // Add enhanced conversation with channel info on messages
        const enhancedConversation = {
          ...conv,
          messages: (conv.messages || []).map((message: any) => ({
            ...message,
            channel: conv.metadata?.source || 'email', // Detect channel from metadata
            conversationId: conv.conversationId,
            subject: conv.subject
          }))
        };
        
        applicant.conversations.push(enhancedConversation);
        
        applicant.totalUnread += conv.messages?.filter((m: any) => 
          m.direction === 'inbound' && !m.readAt && !m.readReceipt
        ).length || 0;
        
        // Update last activity if this conversation is more recent
        if (new Date(conv.lastMessageAt) > applicant.lastActivityAt) {
          applicant.lastActivityAt = new Date(conv.lastMessageAt);
        }
      });
      
      // Sort conversations by last message time
      applicantMap.forEach(applicant => {
        applicant.conversations.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
      });

      // Convert to array and sort by last activity
      const applicantsList = Array.from(applicantMap.values())
        .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());

      setApplicants(applicantsList);
      console.log('👥 Applicants loaded:', applicantsList.length);
      console.log('⚠️ Skipped conversations:', skippedCount);
      console.log('📊 Stats:', {
        totalConversations: conversations.length,
        applicants: applicantsList.length,
        skipped: skippedCount
      });

      // Auto-select if conversationId in URL
      if (conversationId && applicantsList.length > 0) {
        const targetConversation = conversations.find((c: any) => c.conversationId === conversationId);
        if (targetConversation) {
          const applicant = applicantsList.find(a => a.id === targetConversation.applicantId?.id);
          if (applicant) {
            selectApplicant(applicant);
            selectConversation(targetConversation);
          }
        }
      }
      
    } catch (error) {
      console.error('Error loading chat data:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Select an applicant
  const selectApplicant = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    
    if (applicant.conversations.length > 0) {
      // Select the most recent conversation
      selectConversation(applicant.conversations[0]);
    } else {
      setSelectedConversation(null);
      setMessages([]);
    }
  };

  // Select a conversation
  const selectConversation = async (conversation: any) => {
    setSelectedConversation(conversation);
    setMessages(conversation.messages || []);
    
    // Mark unread messages as read
    const unreadMessages = conversation.messages?.filter((msg: any) => 
      msg.direction === 'inbound' && !msg.readReceipt && !msg.readAt
    ) || [];

    if (unreadMessages.length > 0) {
      // Immediately update local state to hide badge for responsive UI
      setApplicants(prevApplicants => 
        prevApplicants.map(applicant => {
          if (applicant.conversations.some(conv => conv.conversationId === conversation.conversationId)) {
            return {
              ...applicant,
              totalUnread: Math.max(0, applicant.totalUnread - unreadMessages.length)
            };
          }
          return applicant;
        })
      );
      
      try {
        // Mark each unread message as read
        for (const message of unreadMessages) {
          await emailChatAPI.markMessageAsRead(conversation.conversationId, message.messageId);
        }
        
        // Use setTimeout to defer the refresh trigger after state updates settle
        setTimeout(() => {
          conversationUpdated(conversation.conversationId);
        }, 50);
        
        console.log(`Marked ${unreadMessages.length} messages as read in conversation ${conversation.conversationId}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
        // If API call fails, reload data to get correct state
        loadData();
      }
    }
    
    navigate(`/dashboard/chats/${conversation.conversationId}`);
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      
      await emailChatAPI.sendMessage(selectedConversation.conversationId, {
        htmlContent: newMessage,
        textContent: newMessage.replace(/<[^>]*>/g, ''), // Strip HTML tags for text content
      });
      
      setNewMessage("");
      toast.success('Message sent!');
      
      // Refresh conversation
      const updatedConv = await emailChatAPI.getConversation(selectedConversation.conversationId);
      if (updatedConv.status && updatedConv.data?.conversation) {
        setMessages(updatedConv.data.conversation.messages || []);
      }
      
      // Notify other components to refresh conversation lists silently
      if (selectedConversation) {
        conversationUpdated(selectedConversation.conversationId);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Start new conversation
  const startNewConversation = async (applicant: Applicant) => {
    try {
      const response = await emailChatAPI.createConversation({
        to: applicant.email,
        subject: `Chat: ${applicant.jobTitle || 'Job Application'}`,
        htmlContent: `Hi ${applicant.firstName}, I'd like to discuss your application.`,
        textContent: `Hi ${applicant.firstName}, I'd like to discuss your application.`,
        applicantId: applicant.id,
      });
      
      if (response.status) {
        toast.success('Conversation started!');
        await loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Failed to start conversation');
    }
  };

  // Update applicant status
  const updateApplicantStatus = async (status: 'shortlisted' | 'rejected' | 'maybe') => {
    if (!selectedApplicant) {
      toast.error('No applicant selected');
      return;
    }

    try {
      console.log('🔄 Updating applicant status:', selectedApplicant.id, 'to:', status);
      
      const response = await API.applicant.updateApplicantStatusDirect(selectedApplicant.id, status);
      console.log('✅ Status update response:', response);
      
      toast.success(`Applicant ${status === 'maybe' ? 'marked as maybe' : status} successfully!`);
      
      // Update local state immediately for better UX
      setSelectedApplicant(prev => prev ? { ...prev, status } : null);
      setApplicants(prev => prev.map(app => 
        app.id === selectedApplicant.id ? { ...app, status } : app
      ));
      
    } catch (error: any) {
      console.error('❌ Error updating applicant status:', error);
      toast.error(`Failed to update applicant status: ${error?.message || 'Unknown error'}`);
    }
  };

  // Filter applicants
  const filteredApplicants = applicants.filter(applicant => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      applicant.firstName.toLowerCase().includes(search) ||
      applicant.lastName.toLowerCase().includes(search) ||
      applicant.email.toLowerCase().includes(search) ||
      applicant.jobTitle?.toLowerCase().includes(search)
    );
  });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // Silent refresh when conversations are updated - only refresh if needed
  useEffect(() => {
    if (refreshTrigger > 0 && !loading) {
      // Only refresh if we're not already loading to prevent loops
      loadData();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    // Only scroll to bottom if we have messages and are actively in a conversation
    // This prevents unwanted scrolling when selecting a conversation
    if (messages.length > 0 && selectedConversation) {
      // Use a small delay to prevent scroll on initial selection
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [messages, selectedConversation]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 min-h-screen bg-gray-50">
      {/* Left Panel - Applicants (Responsive) */}
      <div className={`${selectedApplicant && window.innerWidth < 1024 ? 'hidden' : 'flex'} lg:flex w-full lg:w-80 xl:w-96 bg-white rounded-lg border border-gray-200 shadow-sm flex-col max-h-[calc(100vh-200px)]`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Chat</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {filteredApplicants.length}
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Back button for mobile */}
          {selectedApplicant && (
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mt-2 w-full"
              onClick={() => setSelectedApplicant(null)}
            >
              ← Back to Applicants
            </Button>
          )}
        </div>

        {/* Applicants List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 space-y-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredApplicants.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No applicants found</p>
              </div>
            ) : (
              filteredApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  onClick={() => selectApplicant(applicant)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedApplicant?.id === applicant.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                          {`${applicant.firstName[0]}${applicant.lastName[0]}`.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {applicant.totalUnread > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {applicant.totalUnread > 9 ? "9+" : applicant.totalUnread}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
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
                        {applicant.conversations.length === 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              startNewConversation(applicant);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            Start Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat (Responsive) */}
      <div className={`${!selectedApplicant && window.innerWidth < 1024 ? 'hidden' : 'flex'} lg:flex flex-1 bg-white rounded-lg border border-gray-200 shadow-sm flex-col max-h-[calc(100vh-200px)]`}>
        {selectedApplicant ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back button for mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden p-2"
                    onClick={() => setSelectedApplicant(null)}
                  >
                    ←
                  </Button>
                  
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                      {`${selectedApplicant.firstName[0]}${selectedApplicant.lastName[0]}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-gray-900 truncate">
                        {selectedApplicant.firstName} {selectedApplicant.lastName}
                      </h2>
                      
                      {/* Current Status Badge */}
                      {selectedApplicant.status && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-1 font-medium ${
                            selectedApplicant.status === 'shortlisted' 
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : selectedApplicant.status === 'rejected'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : selectedApplicant.status === 'maybe'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : selectedApplicant.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {selectedApplicant.status === 'shortlisted' && '✅ '}
                          {selectedApplicant.status === 'rejected' && '❌ '}
                          {selectedApplicant.status === 'maybe' && '🤔 '}
                          {selectedApplicant.status === 'pending' && '⏳ '}
                          {selectedApplicant.status}
                        </Badge>
                      )}
                      
                      {/* AI Score Badge */}
                      {selectedApplicant.aiEvaluation?.totalScore && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs px-2 py-1">
                          🤖 AI: {selectedApplicant.aiEvaluation.totalScore}/100
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{selectedApplicant.jobTitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Conversation Selector */}
                  {selectedApplicant.conversations.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Conversation:</span>
                      <div className="flex gap-1">
                        {selectedApplicant.conversations.map((conv, index) => (
                          <Button
                            key={conv.conversationId}
                            size="sm"
                            variant={selectedConversation?.conversationId === conv.conversationId ? "default" : "outline"}
                            onClick={() => selectConversation(conv)}
                            className="h-7 px-3 text-xs"
                            title={conv.subject}
                          >
                            #{index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicantStatus('shortlisted')}
                      className="h-8 px-3 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Shortlist
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicantStatus('maybe')}
                      className="h-8 px-3 text-xs bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                    >
                      🤔
                      Maybe
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateApplicantStatus('rejected')}
                      className="h-8 px-3 text-xs bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>

              {/* Applicant Details - Always Visible */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700 truncate">{selectedApplicant.email}</span>
                  </div>
                  
                  {selectedApplicant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-500" />
                      <span className="text-gray-700">{selectedApplicant.phone}</span>
                    </div>
                  )}
                  
                  {(selectedApplicant.city || selectedApplicant.state) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      <span className="text-gray-700">
                        {[selectedApplicant.city, selectedApplicant.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-orange-500" />
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area - Fixed Scroll */}
            {selectedConversation ? (
              <>
                {/* Messages Container with Proper Scroll */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
                    {messages.map((message, index) => {
                      // Check if this is an inbound AI follow-up response (not outbound questions)
                      const isInboundAIFollowup = message.metadata?.type === 'ai_followup' && message.direction === 'inbound';

                      if (isInboundAIFollowup) {
                        return (
                          <div
                            key={message._id || index}
                            className="flex justify-start"
                          >
                            <AIFollowupMessage
                              message={message}
                              isOutbound={false}
                              conversationId={selectedConversation?.conversationId || ''}
                            />
                          </div>
                        );
                      }

                      // Regular message display
                      return (
                        <div
                          key={message._id || index}
                          className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-3 max-w-lg ${message.direction === 'outbound' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={undefined} />
                              <AvatarFallback className={`text-xs ${
                                message.direction === 'inbound'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {message.direction === 'inbound'
                                  ? `${selectedApplicant.firstName[0]}${selectedApplicant.lastName[0]}`.toUpperCase()
                                  : getUserInitials()
                                }
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className={`flex flex-col ${message.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
                              <div className={`px-4 py-3 rounded-2xl shadow-sm max-w-full ${
                                message.direction === 'outbound'
                                  ? 'bg-gray-100 text-gray-900 border border-gray-200 rounded-br-md'
                                  : 'bg-blue-500 text-white rounded-bl-md'
                              }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                  {(() => {
                                    const content = message.textContent || message.htmlContent || '';
                                    // Clean HTML thoroughly for all messages
                                    return content
                                      .replace(/<[^>]*>/g, '') // Remove HTML tags
                                      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with spaces
                                      .replace(/&amp;/g, '&') // Replace &amp; with &
                                      .replace(/&lt;/g, '<') // Replace &lt; with <
                                      .replace(/&gt;/g, '>') // Replace &gt; with >
                                      .replace(/&quot;/g, '"') // Replace &quot; with "
                                      .replace(/&#39;/g, "'") // Replace &#39; with '
                                      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                                      .trim();
                                  })()}
                                </div>
                              </div>
                              
                              <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                                message.direction === 'outbound' ? 'flex-row-reverse' : 'flex-row'
                              }`}>
                                <span>{format(new Date(message.timestamp), 'MMM d, HH:mm')}</span>
                                
                                {/* Channel Indicator */}
                                <div className="flex items-center gap-1">
                                  {message.channel === 'sms' && (
                                    <>
                                      <Phone className="h-3 w-3 text-green-500" />
                                      <span className="text-green-600 font-medium">SMS</span>
                                    </>
                                  )}
                                  {message.channel === 'portal' && (
                                    <>
                                      <Globe className="h-3 w-3 text-purple-500" />
                                      <span className="text-purple-600 font-medium">Portal</span>
                                    </>
                                  )}
                                  {(message.channel === 'email' || !message.channel) && (
                                    <>
                                      <Mail className="h-3 w-3 text-blue-500" />
                                      <span className="text-blue-600 font-medium">Email</span>
                                    </>
                                  )}
                                </div>
                                
                                {message.readAt && <span className="text-blue-500">✓✓</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Rich Text Message Input */}
                <div className="border-t border-gray-200 flex-shrink-0 bg-white">
                  <ChatRichTextEditor
                    value={newMessage || ''}
                    onChange={setNewMessage}
                    onSend={() => sendMessage()}
                    placeholder="Type your message..."
                    sending={sending}
                    className="min-h-[150px]"
                  />
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start a conversation with {selectedApplicant.firstName}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This applicant doesn't have any conversations yet.
                  </p>
                  
                  <Button onClick={() => startNewConversation(selectedApplicant)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Start Email Conversation
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* No applicant selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-12">
              <Users className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Select an applicant to start chatting
              </h3>
              <p className="text-gray-600">
                Choose from the applicant list on the left to view conversations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SimpleUnifiedChat: React.FC = () => {
  return (
    <ChatProvider>
      <SimpleUnifiedChatInner />
    </ChatProvider>
  );
};

export default SimpleUnifiedChat;
