import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatRichTextEditor } from '@/components/dashboard/chats/ChatRichTextEditor';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Briefcase,
  Mail,
  Clock,
  Archive,
  X,
  Check,
  AlertCircle,
  MessageSquare,
  MoreVertical,
  Phone,
  MapPin,
  User,
  Brain,
  FileText,
  Star,
  ThumbsUp,
  GraduationCap,
  Users,
  Shield,
  Eye,
  Download,
  ExternalLink,
  Globe,
  Linkedin,
  Calendar,
  CheckCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import { SubscriptionGuard } from '@/components/common/SubscriptionGuard';
import useAuthSessionContext from '@/lib/context/AuthSessionContext';
import { useChatContext } from '@/lib/context/ChatContext';
// Layout is provided by PrivateRoute
import API from '@/http';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AIEvaluation {
  skillsMatchScore: number;
  skillsMatchJustification: string;
  experienceScore: number;
  experienceJustification: string;
  educationScore: number;
  educationJustification: string;
  culturalFitScore: number;
  culturalFitJustification: string;
  totalScore: number;
  overallAssessment: string;
  strengths: string[];
  weaknesses: string[];
  recommendationLevel: "Strong No" | "No" | "Maybe" | "Yes" | "Strong Yes";
}

interface ChatMessage {
  _id: string;
  messageId: string;
  from: string;
  to: string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  timestamp: Date;
  direction: 'inbound' | 'outbound';
  readReceipt: boolean;
  readAt?: Date;
}

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
    aiScore?: number;
    aiEvaluation?: AIEvaluation | null;
    status?: "pending" | "reviewed" | "shortlisted" | "rejected";
    resume?: string;
    coverLetter?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    interviewScheduled?: boolean;
    invitationSent?: boolean;
    invitationSentDate?: string;
    createdAt?: string;
  };
  messages: ChatMessage[];
}

const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { subscription, data: authData } = useAuthSessionContext();
  const { conversationUpdated } = useChatContext();
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [applicantConversations, setApplicantConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if user has Enterprise plan for AI features
  const hasEnterpriseFeatures = subscription?.planId === 'enterprise';

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      const response = await API.emailChat.getConversation(conversationId);

      if (response.status) {
        setConversation(response.data);
        console.log('📧 Loaded conversation:', response.data);
        console.log('📧 Participants:', response.data.participants);
        console.log('📧 ApplicantId field:', response.data.applicantId);
        // Mark messages as read
        markUnreadMessagesAsRead(response.data);
        
        // Load all conversations for this applicant
        let applicantId = null;
        
        // Try to get applicant ID from direct field
        if (response.data.applicantId) {
          // If it's a populated object, get the _id
          if (typeof response.data.applicantId === 'object' && response.data.applicantId._id) {
            applicantId = response.data.applicantId._id;
          } 
          // If it's just a string ID
          else if (typeof response.data.applicantId === 'string') {
            applicantId = response.data.applicantId;
          }
        }
        
        // If still no applicantId, try to get from participants
        if (!applicantId) {
          const applicantParticipant = response.data.participants?.find((p: any) => p.role === 'applicant');
          if (applicantParticipant?.applicantId) {
            applicantId = applicantParticipant.applicantId;
          }
        }
        
        if (applicantId) {
          console.log('👤 Loading conversations for applicant:', applicantId);
          await loadApplicantConversations(applicantId);
        } else {
          console.warn('⚠️ No applicantId found in conversation data:', response.data);
          setApplicantConversations([]);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const loadApplicantConversations = async (applicantId: string) => {
    try {
      console.log('🔍 API call: getConversations with applicantId:', applicantId);
      const response = await API.emailChat.getConversations({
        applicantId: applicantId,
        page: 1,
        limit: 100 // Get all conversations for this applicant
      });

      console.log('📦 Full API response:', response);
      
      if (response.status) {
        console.log('💬 Loaded applicant conversations:', response.data.conversations);
        console.log('💬 Response data structure:', response.data);
        setApplicantConversations(response.data.conversations || []);
      } else {
        console.error('❌ API response status false:', response);
        setApplicantConversations([]);
      }
    } catch (error) {
      console.error('💥 Error loading applicant conversations:', error);
      setApplicantConversations([]);
    }
  };

  const markUnreadMessagesAsRead = async (conv: ChatConversation) => {
    const unreadMessages = conv.messages.filter(msg => 
      msg.direction === 'inbound' && !msg.readReceipt && !msg.readAt
    );

    for (const message of unreadMessages) {
      try {
        await API.emailChat.markMessageAsRead(conv.conversationId, message.messageId);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
    
    // Update local conversation to reflect read status immediately
    if (unreadMessages.length > 0) {
      setConversation(prevConv => {
        if (!prevConv) return prevConv;
        return {
          ...prevConv,
          messages: prevConv.messages.map(msg => 
            unreadMessages.some(unread => unread.messageId === msg.messageId)
              ? { ...msg, readReceipt: true, readAt: new Date() }
              : msg
          )
        };
      });
      
      // Notify other components to refresh conversation lists silently
      conversationUpdated(conv.conversationId);
    }
  };

  const switchToConversation = (newConversationId: string) => {
    navigate(`/dashboard/chats/${newConversationId}`);
  };

  const sendReply = async (attachments?: File[]) => {
    if ((!replyContent.trim() && !attachments?.length) || !conversation) return;

    try {
      setSending(true);
      
      // If there are attachments, upload them first
      let attachmentUrls: string[] = [];
      if (attachments?.length) {
        const formData = new FormData();
        attachments.forEach((file) => {
          formData.append(`files`, file);
        });
        
        // Add conversation ID for context
        formData.append('conversationId', conversation.conversationId);
        
        try {
          const uploadResponse = await fetch('/api/v1/chat/upload-attachments', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: formData,
          });
          
          const uploadResult = await uploadResponse.json();
          if (uploadResult.success) {
            attachmentUrls = uploadResult.data.urls || [];
          } else {
            throw new Error(uploadResult.message || 'Failed to upload attachments');
          }
        } catch (uploadError) {
          toast.error('Failed to upload attachments. Please try again.');
          return;
        }
      }
      
      // Prepare message data
      const messageData: any = {
        htmlContent: replyContent,
        textContent: replyContent.replace(/<[^>]*>/g, ''), // Strip HTML for text content
      };
      
      if (attachmentUrls.length > 0) {
        messageData.attachments = attachmentUrls.map((url, index) => ({
          url,
          filename: attachments?.[index]?.name || `attachment-${index}`,
          type: attachments?.[index]?.type || 'application/octet-stream',
          size: attachments?.[index]?.size || 0
        }));
      }
      
      await API.emailChat.sendMessage(conversation.conversationId, messageData);

      setReplyContent('');
      toast.success('Message sent successfully!');
      
      // Reload conversation to show new message
      await loadConversation();
      
      // Notify other components to refresh conversation lists silently
      if (conversation) {
        conversationUpdated(conversation.conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Keyboard handling is now managed by the ChatRichTextEditor component

  const handleArchive = async () => {
    if (!conversation) return;

    try {
      await API.emailChat.archiveConversation(conversation.conversationId);
      toast.success('Conversation archived');
      navigate('/dashboard/chats');
    } catch (error) {
      toast.error('Failed to archive conversation');
    }
  };

  const handleClose = async () => {
    if (!conversation) return;

    try {
      await API.emailChat.closeConversation(conversation.conversationId);
      toast.success('Conversation closed');
      navigate('/dashboard/chats');
    } catch (error) {
      toast.error('Failed to close conversation');
    }
  };

  const handleShortlist = async () => {
    if (!conversation?.applicantId) return;

    try {
      await API.applicant.updateApplicantStatusDirect(conversation.applicantId._id, 'shortlisted');
      toast.success('Applicant shortlisted successfully!');
      // Reload conversation to update status
      await loadConversation();
    } catch (error) {
      console.error('Error shortlisting applicant:', error);
      toast.error('Failed to shortlist applicant');
    }
  };

  const handleReject = async () => {
    if (!conversation?.applicantId) return;

    try {
      await API.applicant.updateApplicantStatusDirect(conversation.applicantId._id, 'rejected');
      toast.success('Applicant rejected');
      // Reload conversation to update status
      await loadConversation();
    } catch (error) {
      console.error('Error rejecting applicant:', error);
      toast.error('Failed to reject applicant');
    }
  };




  const getApplicantName = () => {
    if (!conversation) return 'Unknown';
    
    if (conversation.applicantId) {
      return `${conversation.applicantId.firstName} ${conversation.applicantId.lastName}`;
    }
    
    const applicantParticipant = conversation.participants.find(p => p.role === 'applicant');
    return applicantParticipant?.name || applicantParticipant?.email || 'Unknown Applicant';
  };

  const getApplicantInitials = () => {
    if (!conversation) return 'UA';
    
    if (conversation.applicantId) {
      return `${conversation.applicantId.firstName[0]}${conversation.applicantId.lastName[0]}`;
    }
    
    const applicantParticipant = conversation.participants.find(p => p.role === 'applicant');
    const name = applicantParticipant?.name || applicantParticipant?.email || 'UA';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getCurrentUserInitials = () => {
    if (!authData?.user) return 'YU'; // "You User" fallback
    
    const { firstName, lastName, email } = authData.user;
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    
    if (email) {
      const emailParts = email.split('@')[0];
      return emailParts.substring(0, 2).toUpperCase();
    }
    
    return 'YU';
  };

  const getMessageContent = (message: ChatMessage) => {
    // For display, prefer text content for simplicity
    return message.textContent || message.htmlContent?.replace(/<[^>]*>/g, '') || 'No content';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-green-50 text-green-700 border-green-200";
      case "reviewed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Strong Yes":
        return "bg-green-100 text-green-800 border-green-300";
      case "Yes":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Maybe":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "No":
        return "bg-red-100 text-red-800 border-red-300";
      case "Strong No":
        return "bg-red-200 text-red-900 border-red-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Conversation not found</h3>
        <p className="text-gray-600 mb-4">The conversation you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/dashboard/chats')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chats
        </Button>
      </div>
    );
  }

  return (
    <SubscriptionGuard>
        <div className="h-screen flex flex-col bg-white">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/dashboard/chats')} 
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
              </Button>
                <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                  {getApplicantInitials()}
                </AvatarFallback>
              </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 border-2 border-white rounded-full w-3 h-3"></div>
                    </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">{getApplicantName()}</h1>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {conversation.applicantId?.jobId && (
                      <>
                        <span className="truncate">{conversation.applicantId.jobId.jobTitle}</span>
                        <span>•</span>
                      </>
                    )}
                    <span className="text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
                
                {/* View Profile Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowApplicantModal(true)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
                
                {/* Thread selector */}
                {applicantConversations.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      {applicantConversations.map((conv) => (
                        <DropdownMenuItem
                          key={conv.conversationId}
                          onClick={() => switchToConversation(conv.conversationId)}
                          className={`flex flex-col items-start p-3 space-y-1 ${
                            conv.conversationId === conversation.conversationId ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="font-medium text-sm truncate">{conv.subject}</span>
                              {conv.metadata?.source === 'sms' && (
                                <div title="Started via SMS">
                                  <Phone className="h-3 w-3 text-purple-500 flex-shrink-0" />
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {conv.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(conv.lastMessageAt), 'MMM d')} • {conv.messages.length} messages
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {/* Action menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
              {conversation.status === 'active' && (
                <>
                        <DropdownMenuItem onClick={handleClose} className="gap-2">
                          <X className="h-4 w-4" />
                          Close conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleArchive} className="gap-2">
                          <Archive className="h-4 w-4" />
                          Archive conversation
                        </DropdownMenuItem>
                </>
              )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Applicant Info Panel - Always Visible */}
          {conversation.applicantId && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 animate-in slide-in-from-top duration-300">
                <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                      {getApplicantInitials()}
                    </AvatarFallback>
                  </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-700 truncate">{conversation.applicantId.email}</span>
                    </div>
                    
                    {conversation.applicantId.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{conversation.applicantId.phone}</span>
                      </div>
                    )}
                    
                    {(conversation.applicantId.city || conversation.applicantId.state) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-gray-700">
                        {conversation.applicantId.city}{conversation.applicantId.city && conversation.applicantId.state && ', '}{conversation.applicantId.state}
                        </span>
                      </div>
                    )}
                    
                    {conversation.applicantId?.jobId && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-gray-700 font-medium truncate">{conversation.applicantId.jobId.jobTitle}</span>
                        {conversation.applicantId.jobId.location && (
                            <span className="text-gray-500 ml-1">in {conversation.applicantId.jobId.location}</span>
                        )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">
                        Last active: {format(new Date(conversation.lastMessageAt), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 bg-gray-50 overflow-hidden">
            <div className="h-full overflow-y-auto px-4 py-4 space-y-4">
              {conversation.messages.map((message, index) => {
                const showTimestamp = index === 0 || 
                  (new Date(message.timestamp).getTime() - new Date(conversation.messages[index - 1].timestamp).getTime()) > 300000; // 5 minutes
                
                return (
                  <div key={message._id} className="space-y-1">
                    {showTimestamp && (
                      <div className="flex justify-center my-4">
                        <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {format(new Date(message.timestamp), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-xs sm:max-w-md ${message.direction === 'outbound' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar for all messages - applicant initials for inbound, your initials for outbound */}
                        <Avatar className="h-7 w-7 flex-shrink-0">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className={`text-xs ${
                            message.direction === 'inbound' 
                              ? 'bg-gray-300 text-gray-600' 
                              : 'bg-blue-500 text-white'
                          }`}>
                            {message.direction === 'inbound' ? getApplicantInitials() : getCurrentUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={`flex flex-col ${message.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`px-3 py-2 rounded-2xl shadow-sm ${
                        message.direction === 'outbound'
                                ? 'bg-blue-500 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                      }`}
                    >
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {getMessageContent(message)}
                      </div>
                          </div>
                          
                          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                            message.direction === 'outbound' ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                            <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
                            {message.direction === 'outbound' && (
                              <div className="flex items-center">
                                {message.readReceipt ? (
                                  <div className="flex text-blue-500">
                                    <Check className="h-3 w-3" />
                                    <Check className="h-3 w-3 -ml-1" />
                                  </div>
                                ) : (
                                  <Check className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                            )}
                    </div>
                  </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                <div ref={messagesEndRef} />
              </div>
          </div>

          {/* Action Buttons - Mobile Responsive */}
          {conversation.status === 'active' && conversation.applicantId && (
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShortlist}
                      disabled={conversation.applicantId.status === 'shortlisted'}
                      className={`gap-2 whitespace-nowrap flex-shrink-0 ${
                        conversation.applicantId.status === 'shortlisted'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'hover:bg-green-50 hover:text-green-700 hover:border-green-300'
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {conversation.applicantId.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
                      </span>
                      <span className="sm:hidden">
                        {conversation.applicantId.status === 'shortlisted' ? '✓' : 'Shortlist'}
                      </span>
                    </Button>
{/* <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAskQuestion}
                      className="gap-2 whitespace-nowrap flex-shrink-0 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Ask Question</span>
                      <span className="sm:hidden">Question</span>
                    </Button> */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReject}
                      disabled={conversation.applicantId.status === 'rejected'}
                      className={`gap-2 whitespace-nowrap flex-shrink-0 ${
                        conversation.applicantId.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                      }`}
                    >
                      <UserX className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {conversation.applicantId.status === 'rejected' ? 'Rejected' : 'Reject'}
                      </span>
                      <span className="sm:hidden">
                        {conversation.applicantId.status === 'rejected' ? '✗' : 'Reject'}
                      </span>
                    </Button>
                  </div>
                </div>
                
                {/* Current Status Display */}
                {conversation.applicantId.status && (
                  <div className="flex items-center gap-2 justify-center sm:justify-end">
                    <span className="text-xs text-gray-500">Status:</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.applicantId.status)}`}>
                      {conversation.applicantId.status.charAt(0).toUpperCase() + conversation.applicantId.status.slice(1)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Input - Rich Text Editor */}
          {conversation.status === 'active' && (
            <div className="bg-white border-t border-gray-200 p-4">
              <ChatRichTextEditor
                  value={replyContent}
                onChange={setReplyContent}
                onSend={sendReply}
                sending={sending}
                placeholder="Type a message... Press Enter to send, Shift+Enter for new line"
                className="w-full"
              />
            </div>
          )}

          {conversation.status !== 'active' && (
            <div className="bg-gray-100 border-t border-gray-200 px-4 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>This conversation is {conversation.status}. You cannot send new messages.</span>
              </div>
            </div>
          )}

          {/* Enhanced Applicant Profile Modal */}
          {conversation?.applicantId && (
            <Sheet open={showApplicantModal} onOpenChange={setShowApplicantModal}>
              <SheetContent className="w-full sm:max-w-4xl overflow-hidden flex flex-col p-0 bg-gradient-to-b from-white to-gray-50">
                {/* Profile Header */}
                <div className="relative w-full bg-gradient-to-r from-blue-600 to-purple-700 h-48">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,white_0,transparent_70%)]"></div>
                  </div>

                  {/* Header Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                    <div className="flex items-center gap-4">
                      <div className="relative bg-white rounded-2xl shadow-lg w-24 h-24 -mb-12">
                        <div className="absolute inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {getApplicantInitials()}
                        </div>
                      </div>
                      <div className="mb-1">
                        <h2 className="text-2xl font-bold text-white">
                          {getApplicantName()}
                        </h2>
                        <p className="text-blue-100 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          Applied {conversation.applicantId.createdAt ? formatDate(conversation.applicantId.createdAt) : 'Date not available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {conversation.applicantId.status && (
                        <Badge className={`text-xs font-medium ${getStatusColor(conversation.applicantId.status)}`}>
                          {conversation.applicantId.status}
                        </Badge>
                      )}
                      {conversation.applicantId.aiEvaluation && (
                        <Badge className={`text-xs font-medium ${getRecommendationColor(conversation.applicantId.aiEvaluation.recommendationLevel)}`}>
                          {conversation.applicantId.aiEvaluation.recommendationLevel}
                        </Badge>
                      )}
                  <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApplicantModal(false)}
                        className="text-white hover:bg-white/20"
                      >
                        <X className="w-4 h-4" />
                  </Button>
                </div>
                  </div>
                </div>

                {/* Tabs Content */}
                <div className="flex-1 min-h-0 pt-14">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col px-6">
                    <TabsList className={`grid w-full mb-6 ${hasEnterpriseFeatures ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                        <User className="w-4 h-4 mr-2" />
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="documents" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                        <FileText className="w-4 h-4 mr-2" />
                        Documents
                      </TabsTrigger>
                      {hasEnterpriseFeatures && (
                        <TabsTrigger value="ai-score" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
                          <Brain className="w-4 h-4 mr-2" />
                          AI Analysis
                        </TabsTrigger>
                      )}
                    </TabsList>

                    <div className="flex-1 min-h-0 relative">
                      <ScrollArea className="h-full pr-3">
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-0 space-y-8">
                          {/* Personal Details */}
                          <section>
                            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                              <User className="w-5 h-5 mr-2 text-blue-600" />
                              Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8">
                              {/* Basic Info */}
                              <div className="space-y-4 md:col-span-2">
                                {(conversation.applicantId.city || conversation.applicantId.state) && (
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                      <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Location</p>
                                      <p className="font-medium">
                                        {conversation.applicantId.city && conversation.applicantId.state
                                          ? `${conversation.applicantId.city}, ${conversation.applicantId.state}`
                                          : conversation.applicantId.city || conversation.applicantId.state}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Contact Details */}
                              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <h4 className="text-sm font-medium text-gray-600 mb-3">Contact Details</h4>
                                <div className="flex items-center gap-3">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <p className="font-medium text-sm">{conversation.applicantId.email}</p>
                                </div>
                                {conversation.applicantId.phone && (
                                  <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <p className="font-medium text-sm">{conversation.applicantId.phone}</p>
                                  </div>
                                )}
                                {(conversation.applicantId.linkedin || conversation.applicantId.portfolio) && (
                                  <div className="border-t pt-2 mt-2">
                                    {conversation.applicantId.linkedin && (
                                      <div className="flex items-center gap-3 mb-2">
                                        <Linkedin className="w-4 h-4 text-muted-foreground" />
                                        <a href={conversation.applicantId.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                          LinkedIn Profile <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    )}
                                    {conversation.applicantId.portfolio && (
                                      <div className="flex items-center gap-3">
                                        <Globe className="w-4 h-4 text-muted-foreground" />
                                        <a href={conversation.applicantId.portfolio} target="_blank" rel="noopener noreferrer" className="font-medium text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                          Portfolio <ExternalLink className="w-3 h-3" />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </section>

                          {/* Job Application */}
                          {conversation.applicantId?.jobId && (
                            <section>
                              <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-800">
                                <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                                Job Application
                              </h3>
                              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                                <h4 className="font-semibold text-purple-800 text-lg mb-2">
                                  {conversation.applicantId.jobId.jobTitle}
                                </h4>
                                {conversation.applicantId.jobId.department && (
                                  <p className="text-sm text-purple-600 mb-1">
                                    Department: {conversation.applicantId.jobId.department}
                                  </p>
                                )}
                                {conversation.applicantId.jobId.location && (
                                  <p className="text-sm text-purple-600">
                                    Location: {conversation.applicantId.jobId.location}
                                  </p>
                                )}
                              </div>
                            </section>
                          )}

                          {/* Interview Status */}
                          {conversation.applicantId.invitationSent && (
                            <section>
                              <h3 className="text-lg font-semibold mb-4 flex items-center text-orange-800">
                                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                                Interview Status
                              </h3>
                              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    <CheckCircle className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-orange-800">
                                      {conversation.applicantId.interviewScheduled ? 'Interview Scheduled' : 'Invitation Sent'}
                                    </p>
                                    <p className="text-sm text-orange-600">
                                      {conversation.applicantId.invitationSentDate 
                                        ? `Sent on ${formatDate(conversation.applicantId.invitationSentDate)}`
                                        : 'Waiting for candidate response'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </section>
                          )}
                        </TabsContent>

                        {/* Documents Tab */}
                        <TabsContent value="documents" className="mt-0 space-y-6">
                          {/* Resume */}
                          {conversation.applicantId.resume && (
                            <div className="group flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-all duration-300">
                              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                                <FileText className="w-6 h-6 text-red-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium mb-1">Resume</h4>
                                <p className="text-sm text-gray-500 mb-2">Candidate's professional resume</p>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={conversation.applicantId.resume} target="_blank" rel="noopener noreferrer">
                                      <Eye className="w-3 h-3 mr-1" />
                                      View
                                    </a>
                                  </Button>
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={conversation.applicantId.resume} download>
                                      <Download className="w-3 h-3 mr-1" />
                                      Download
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Cover Letter */}
                          {conversation.applicantId.coverLetter && (
                            <div>
                              <div className="flex items-center mb-3">
                                <MessageSquare className="w-5 h-5 mr-2 text-purple-600" />
                                <h4 className="font-medium">Cover Letter</h4>
                              </div>
                              <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg border max-h-48 overflow-auto">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {conversation.applicantId.coverLetter}
                                </p>
                              </div>
                            </div>
                          )}

                          {!conversation.applicantId.resume && !conversation.applicantId.coverLetter && (
                            <div className="text-center py-12">
                              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h3>
                              <p className="text-gray-600">This applicant hasn't uploaded any documents yet.</p>
                            </div>
                          )}
                        </TabsContent>

                        {/* AI Score Tab - Enterprise Only */}
                        {hasEnterpriseFeatures && (
                          <TabsContent value="ai-score" className="mt-0 space-y-8">
                          {conversation.applicantId.aiEvaluation ? (
                            <>
                              {/* AI Score Header */}
                              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white mb-8">
                                <div className="relative flex flex-col md:flex-row gap-6 items-center">
                                  <div className="flex-1 space-y-2">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                      <Shield className="w-5 h-5" /> AI Talent Assessment
                                    </h2>
                                    <p className="text-purple-100 max-w-md">
                                      Our AI has analyzed this candidate's fit for the role based on skills, experience, education, and cultural alignment.
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-center justify-center">
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                      <div className="absolute inset-0 rounded-full bg-white/20"></div>
                                      <span className="text-3xl font-bold">
                                        {conversation.applicantId.aiEvaluation.totalScore}%
                                      </span>
                                    </div>
                                    <p className="text-sm mt-2 font-medium">Overall Match</p>
                                  </div>
                                  <div>
                                    <div className="bg-white/20 rounded-lg px-4 py-3 text-center">
                                      <div className="text-xs uppercase tracking-wide text-purple-200">Recommendation</div>
                                      <div className="text-xl font-bold mt-1">
                                        {conversation.applicantId.aiEvaluation.recommendationLevel}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Overall Assessment */}
                              <section>
                                <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-800">
                                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                                  Overall Assessment
                                </h3>
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 p-5 rounded-lg border">
                                  {conversation.applicantId.aiEvaluation.overallAssessment}
                                </div>
                              </section>

                              {/* Strengths and Weaknesses */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section className="bg-gradient-to-br from-green-50 to-white rounded-lg p-5 border-l-4 border-green-400">
                                  <h3 className="text-base font-semibold flex items-center gap-2 mb-4 text-green-800">
                                    <ThumbsUp className="w-4 h-4 text-green-600" />
                                    Key Strengths
                                  </h3>
                                  <ul className="space-y-2">
                                    {conversation.applicantId.aiEvaluation.strengths.map((strength, index) => (
                                      <li key={index} className="flex items-start gap-2 p-2 text-sm rounded-md hover:bg-green-100/50 transition-colors">
                                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                                        <span>{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </section>

                                <section className="bg-gradient-to-br from-amber-50 to-white rounded-lg p-5 border-l-4 border-amber-400">
                                  <h3 className="text-base font-semibold flex items-center gap-2 mb-4 text-amber-800">
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                    Areas for Improvement
                                  </h3>
                                  <ul className="space-y-2">
                                    {conversation.applicantId.aiEvaluation.weaknesses.map((weakness, index) => (
                                      <li key={index} className="flex items-start gap-2 p-2 text-sm rounded-md hover:bg-amber-100/50 transition-colors">
                                        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                                        <span>{weakness}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </section>
                              </div>

                              {/* Score Categories */}
                              <section>
                                <h3 className="text-lg font-semibold mb-6 flex items-center text-gray-800">
                                  <Check className="w-5 h-5 mr-2 text-gray-600" />
                                  Evaluation Areas
                                </h3>
                                <div className="space-y-8">
                                  {/* Skills Match */}
                                  <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                          <Star className="w-5 h-5" />
                                        </div>
                                        <div>
                                          <h4 className="font-semibold">Skills Match</h4>
                                          <p className="text-sm text-muted-foreground">Job-specific skills alignment</p>
                                        </div>
                                      </div>
                                      <div className="text-2xl font-bold text-blue-600">
                                        {conversation.applicantId.aiEvaluation.skillsMatchScore}%
                                      </div>
                                    </div>
                                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-2 mb-3">
                                      <div
                                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                                        style={{ width: `${conversation.applicantId.aiEvaluation.skillsMatchScore}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-100 mt-3">
                                      {conversation.applicantId.aiEvaluation.skillsMatchJustification}
                                    </div>
                                  </div>

                                  {/* Experience */}
                                  <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                          <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                          <h4 className="font-semibold">Experience</h4>
                                          <p className="text-sm text-muted-foreground">Work history relevance</p>
                                        </div>
                                      </div>
                                      <div className="text-2xl font-bold text-indigo-600">
                                        {conversation.applicantId.aiEvaluation.experienceScore}%
                                      </div>
                                    </div>
                                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-2 mb-3">
                                      <div
                                        className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                                        style={{ width: `${conversation.applicantId.aiEvaluation.experienceScore}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-sm text-gray-600 bg-indigo-50 p-4 rounded-lg border border-indigo-100 mt-3">
                                      {conversation.applicantId.aiEvaluation.experienceJustification}
                                    </div>
                                  </div>

                                  {/* Education */}
                                  <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                          <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <div>
                                          <h4 className="font-semibold">Education</h4>
                                          <p className="text-sm text-muted-foreground">Academic qualifications</p>
                                        </div>
                                      </div>
                                      <div className="text-2xl font-bold text-green-600">
                                        {conversation.applicantId.aiEvaluation.educationScore}%
                                      </div>
                                    </div>
                                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-2 mb-3">
                                      <div
                                        className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                                        style={{ width: `${conversation.applicantId.aiEvaluation.educationScore}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-sm text-gray-600 bg-green-50 p-4 rounded-lg border border-green-100 mt-3">
                                      {conversation.applicantId.aiEvaluation.educationJustification}
                                    </div>
                                  </div>

                                  {/* Cultural Fit */}
                                  <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                          <Users className="w-5 h-5" />
                                        </div>
                                        <div>
                                          <h4 className="font-semibold">Cultural Fit</h4>
                                          <p className="text-sm text-muted-foreground">Alignment with company values</p>
                                        </div>
                                      </div>
                                      <div className="text-2xl font-bold text-amber-600">
                                        {conversation.applicantId.aiEvaluation.culturalFitScore}%
                                      </div>
                                    </div>
                                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mt-2 mb-3">
                                      <div
                                        className="absolute top-0 left-0 h-full bg-amber-500 rounded-full"
                                        style={{ width: `${conversation.applicantId.aiEvaluation.culturalFitScore}%` }}
                                      ></div>
                                    </div>
                                    <div className="text-sm text-gray-600 bg-amber-50 p-4 rounded-lg border border-amber-100 mt-3">
                                      {conversation.applicantId.aiEvaluation.culturalFitJustification}
                                    </div>
                                  </div>
                                </div>
                              </section>
                            </>
                          ) : (
                            <div className="min-h-[400px] flex items-center justify-center">
                              <div className="text-center p-8">
                                <div className="relative w-24 h-24 mx-auto mb-4">
                                  <div className="absolute inset-0 bg-purple-100 rounded-full animate-ping opacity-25"></div>
                                  <div className="relative flex items-center justify-center w-full h-full bg-purple-50 rounded-full">
                                    <Brain className="w-10 h-10 text-purple-300" />
                                  </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">AI Assessment Not Available</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                  This candidate hasn't been evaluated by our AI system yet.
                                </p>
                              </div>
                            </div>
                          )}
                          </TabsContent>
                        )}
                      </ScrollArea>
                    </div>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
    </SubscriptionGuard>
  );
};

export default ConversationPage;
