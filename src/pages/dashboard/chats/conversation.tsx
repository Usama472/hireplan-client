import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ChevronDown
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/chats')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                  {getApplicantInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{getApplicantName()}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {conversation.applicantId?.jobId && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      <span>{conversation.applicantId.jobId.jobTitle}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{conversation.subject}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Conversation Selector - Debug: Always show */}
              {true && (
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-sm text-gray-600">Conversation:</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="min-w-32">
                        {applicantConversations.length === 0 
                          ? "Loading conversations..." 
                          : applicantConversations.length === 1 
                          ? "1 conversation" 
                          : `${applicantConversations.length} conversations`
                        }
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      {applicantConversations.map((conv) => (
                        <DropdownMenuItem
                          key={conv.conversationId}
                          onClick={() => switchToConversation(conv.conversationId)}
                          className={`flex flex-col items-start p-3 ${
                            conv.conversationId === conversation.conversationId ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-sm truncate flex-1">{conv.subject}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {conv.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(conv.lastMessageAt), 'MMM d, yyyy')} • {conv.messages.length} messages
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              
              <Badge className={getStatusColor(conversation.status)}>
                {conversation.status}
              </Badge>
              {conversation.status === 'active' && (
                <>
                  <Button variant="outline" size="sm" onClick={handleClose}>
                    <X className="mr-2 h-4 w-4" />
                    Close
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Applicant Info */}
          {conversation.applicantId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Applicant Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-medium text-lg">
                      {getApplicantInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{getApplicantName()}</h3>
                    <p className="text-gray-600 mb-1">{conversation.applicantId.email}</p>
                    {conversation.applicantId.phone && (
                      <p className="text-gray-600 mb-1">{conversation.applicantId.phone}</p>
                    )}
                    {(conversation.applicantId.city || conversation.applicantId.state) && (
                      <p className="text-gray-600 mb-2">
                        {conversation.applicantId.city}{conversation.applicantId.city && conversation.applicantId.state && ', '}{conversation.applicantId.state}
                      </p>
                    )}
                    {conversation.applicantId?.jobId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Briefcase className="h-4 w-4" />
                        <span>Applied for: <strong>{conversation.applicantId.jobId.jobTitle}</strong></span>
                        {conversation.applicantId.jobId.location && (
                          <span className="text-gray-500">in {conversation.applicantId.jobId.location}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Last active: {format(new Date(conversation.lastMessageAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <Card className="flex-1">
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {conversation.messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'outbound'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {getMessageContent(message)}
                      </div>
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs ${
                          message.direction === 'outbound'
                            ? 'text-blue-100'
                            : 'text-gray-500'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(message.timestamp), 'MMM dd, HH:mm')}</span>
                        {message.direction === 'outbound' && message.readReceipt && (
                          <Check className="h-3 w-3 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Reply Box */}
          {conversation.status === 'active' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Send Reply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your message here..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-24 resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                  <Button
                    onClick={sendReply}
                    disabled={!replyContent.trim() || sending}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {conversation.status !== 'active' && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">
                  This conversation is {conversation.status}. You cannot send new messages.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
    </SubscriptionGuard>
  );
};

export default ConversationPage;
