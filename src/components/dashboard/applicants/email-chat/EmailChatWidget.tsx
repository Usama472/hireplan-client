import { useState, useEffect, useRef } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Send,
  Mail,
  MessageCircle,
  RefreshCw,
  Archive,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChatRichTextEditor } from '@/components/dashboard/chats/ChatRichTextEditor';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import API from '@/http';
import { useToast } from '@/lib/hooks/use-toast';
import type { EmailChatConversation } from '@/interfaces';

interface EmailChatWidgetProps {
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  jobId?: string;
  jobTitle?: string;
  className?: string;
}

export function EmailChatWidget({
  applicantId,
  applicantName,
  applicantEmail,
  jobId,
  className = '',
}: EmailChatWidgetProps) {
  const [conversations, setConversations] = useState<EmailChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<EmailChatConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessageSubject, setNewMessageSubject] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, [applicantId]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await API.emailChat.getConversations({
        applicantId,
        page: 1,
        limit: 50,
      });

      if (response.status) {
        // The API should already filter by applicantId, but let's ensure we get the right data structure
        const conversationsData = response.data.conversations || response.data || [];
        console.log('🔍 EmailChatWidget conversations loaded for applicant:', applicantId, conversationsData);
        setConversations(conversationsData);
        
        if (conversationsData.length > 0 && !activeConversation) {
          setActiveConversation(conversationsData[0]);
        }
      } else {
        console.warn('Failed to load conversations:', response);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async () => {
    if (!newMessageSubject.trim() || !newMessageContent.trim()) {
      toast({
        title: 'Error',
        description: 'Subject and message are required',
      });
      return;
    }

    try {
      setIsSending(true);
      const response = await API.emailChat.createConversation({
        to: applicantEmail,
        subject: newMessageSubject,
        htmlContent: `<p>${newMessageContent.replace(/\n/g, '<br>')}</p>`,
        textContent: newMessageContent,
        jobId,
        applicantId,
      });

      if (response.status) {
        const newConv = response.data;
        setConversations(prev => [newConv, ...prev]);
        setActiveConversation(newConv);
        setNewMessageSubject('');
        setNewMessageContent('');
        setShowNewMessage(false);
        
        toast({
          title: 'Success',
          description: 'Message sent successfully!',
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
      });
    } finally {
      setIsSending(false);
    }
  };

  const sendReply = async (attachments?: File[]) => {
    if (!activeConversation || (!replyContent.trim() && !attachments?.length)) return;

    try {
      setIsSending(true);
      
      // If there are attachments, upload them first
      let attachmentUrls: string[] = [];
      if (attachments?.length) {
        const formData = new FormData();
        attachments.forEach((file) => {
          formData.append(`files`, file);
        });
        
        // Add conversation ID for context
        formData.append('conversationId', activeConversation.conversationId);
        
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
          toast({
            title: "Error",
            description: "Failed to upload attachments. Please try again.",
          });
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
      
      const response = await API.emailChat.sendMessage(activeConversation.conversationId, messageData);

      if (response.status) {
        // Refresh the conversation to get the new message
        await loadConversations();
        setReplyContent('');
        
        toast({
          title: 'Success',
          description: 'Reply sent successfully!',
        });
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
      });
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDeliveryStatusIcon = (status?: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'failed':
      case 'bounced':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'sent':
        return <Clock className="w-3 h-3 text-blue-500" />;
      default:
        return <Clock className="w-3 h-3 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Communications
            {conversations.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {conversations.length}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadConversations}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            
            <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
              <DialogTrigger asChild>
                <Button size="sm" className="text-xs h-7">
                  <Send className="w-3 h-3 mr-1" />
                  Send
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Send Email to {applicantName}</DialogTitle>
                  <DialogDescription>
                    Send a professional email through the ATS system
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Enter email subject..."
                      value={newMessageSubject}
                      onChange={(e) => setNewMessageSubject(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <ChatRichTextEditor
                      value={newMessageContent}
                      onChange={setNewMessageContent}
                      onSend={() => {}} // Disable send button in new message editor
                      placeholder="Type your message..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                    <p><strong>Email will be sent from:</strong> conv_xyz@conv.hireplan.co</p>
                    <p><strong>Recipient:</strong> {applicantEmail}</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowNewMessage(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createNewConversation} 
                    disabled={isSending || !newMessageSubject.trim() || !newMessageContent.trim()}
                  >
                    {isSending ? (
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {conversations.length === 0 ? (
          <div className="text-center py-6">
            <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">No email conversations yet</p>
            <Button size="sm" onClick={() => setShowNewMessage(true)} className="text-xs">
              <Send className="w-3 h-3 mr-1" />
              Send Message
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Conversation List */}
            <div className="space-y-2">
              {conversations.slice(0, 3).map((conversation) => (
                <div
                  key={conversation.conversationId}
                  onClick={() => setActiveConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                    activeConversation?.conversationId === conversation.conversationId
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-900 truncate flex-1">
                      {conversation.subject}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ml-2 ${getPriorityColor(conversation.priority)}`}
                    >
                      {conversation.priority || 'normal'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessageAt && formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-1 truncate">
                    {conversation.alias}
                  </p>
                </div>
              ))}
              
              {conversations.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {/* TODO: Open full chat view */}}
                >
                  View All {conversations.length} Conversations
                </Button>
              )}
            </div>

            {/* Active Conversation Messages */}
            {activeConversation && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Messages</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => API.emailChat.archiveConversation(activeConversation.conversationId)}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <ScrollArea className="h-48 pr-3">
                  <div className="space-y-3">
                    {activeConversation.messages.map((message) => (
                      <div
                        key={message.messageId}
                        className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-lg p-2 text-xs ${
                          message.direction === 'outbound' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              {message.direction === 'outbound' ? 'You' : applicantName}
                            </span>
                            <div className="flex items-center gap-1">
                              {getDeliveryStatusIcon(message.deliveryStatus)}
                              <span className="opacity-70">
                                {format(new Date(message.timestamp), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                          <div 
                            className="text-xs"
                            dangerouslySetInnerHTML={{ 
                              __html: message.htmlContent || message.textContent?.replace(/\n/g, '<br>') || ''
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Reply Input - Rich Text Editor */}
                <div className="mt-3 space-y-2">
                  <ChatRichTextEditor
                    value={replyContent}
                    onChange={setReplyContent}
                    onSend={sendReply}
                    sending={isSending}
                    placeholder="Type your reply... Press Enter to send, Shift+Enter for new line"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    From: {activeConversation.alias}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
