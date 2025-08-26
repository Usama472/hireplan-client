import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  ArrowLeft, 
  Send, 
  Briefcase,
  Mail,
  Clock,
  Archive,
  X,
  Check,
  AlertCircle,

  MessageSquare,
  MoreVertical,
  Info,
  Phone,
  MapPin
} from 'lucide-react';
import { SubscriptionGuard } from '@/components/common/SubscriptionGuard';
// Layout is provided by PrivateRoute
import API from '@/http';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
}

const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [applicantConversations, setApplicantConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showApplicantInfo, setShowApplicantInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      msg.direction === 'inbound' && !msg.readReceipt
    );

    for (const message of unreadMessages) {
      try {
        await API.emailChat.markMessageAsRead(conv.conversationId, message.messageId);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const switchToConversation = (newConversationId: string) => {
    navigate(`/dashboard/chats/${newConversationId}`);
  };

  const sendReply = async () => {
    if (!replyContent.trim() || !conversation) return;

    try {
      setSending(true);
      await API.emailChat.sendMessage(conversation.conversationId, {
        htmlContent: `<p>${replyContent.replace(/\n/g, '<br>')}</p>`,
        textContent: replyContent,
      });

      setReplyContent('');
      toast.success('Message sent successfully!');
      
      // Reload conversation to show new message
      await loadConversation();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

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

  const getMessageContent = (message: ChatMessage) => {
    // For display, prefer text content for simplicity
    return message.textContent || message.htmlContent?.replace(/<[^>]*>/g, '') || 'No content';
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
                {/* Applicant Info Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowApplicantInfo(!showApplicantInfo)}
                  className={`p-2 hover:bg-gray-100 rounded-full ${showApplicantInfo ? 'bg-blue-100 text-blue-600' : ''}`}
                >
                  <Info className="h-5 w-5" />
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
                            <span className="font-medium text-sm truncate flex-1">{conv.subject}</span>
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

          {/* Applicant Info Panel */}
          {showApplicantInfo && conversation.applicantId && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 animate-in slide-in-from-top duration-300">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                    {getApplicantInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{getApplicantName()}</h3>
                  
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
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowApplicantInfo(false)}
                  className="p-1 hover:bg-blue-200 rounded-full flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
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
                        {message.direction === 'inbound' && (
                          <Avatar className="h-7 w-7 flex-shrink-0">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                              {getApplicantInitials()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
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

          {/* Chat Input */}
          {conversation.status === 'active' && (
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type a message..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="min-h-10 max-h-32 resize-none border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full px-4 py-2 text-sm"
                    rows={1}
                  />
                </div>
                <Button
                  onClick={sendReply}
                  disabled={!replyContent.trim() || sending}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center disabled:opacity-50"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
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
        </div>
    </SubscriptionGuard>
  );
};

export default ConversationPage;
