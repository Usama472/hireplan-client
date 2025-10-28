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
import * as emailChatAPI from '@/http/email-chat/api';
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
    // Only scroll when messages change, not on conversation selection
    if (activeConversation?.messages && activeConversation.messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [activeConversation?.messages]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      // Use emailChatAPI directly for better compatibility
      const response = await emailChatAPI.getConversations({
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
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'normal':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <Card className={`${className} border-l-4 border-l-transparent shadow-sm`}>
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-1 px-4 py-4 border-b">
          <CardTitle className="text-base flex items-center gap-3 font-semibold text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                Email Communications
              </div>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Loading conversations...
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-l-4 border-l-transparent hover:border-l-blue-500 transition-all duration-200 shadow-sm hover:shadow-md`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-1 px-4 py-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-3 font-semibold text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                Email Communications
                {conversations.length > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                    {conversations.length}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Manage email conversations with {applicantName}
              </p>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadConversations}
              className="h-9 w-9 p-0 bg-white border-gray-200 hover:bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200">
                  <Send className="w-4 h-4" />
                  Send Email
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

                  <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p><strong>Email will be sent from:</strong> conv_xyz@conv.hireplan.co</p>
                    <p><strong>Recipient:</strong> {applicantEmail}</p>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewMessage(false)}
                    className="bg-white border-gray-200 hover:bg-gray-50 rounded-xl px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createNewConversation} 
                    disabled={isSending || !newMessageSubject.trim() || !newMessageContent.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl px-6 font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Email
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No email conversations yet</h3>
            <p className="text-gray-600 mb-4 max-w-sm mx-auto">
              Start a conversation with {applicantName} to discuss their application
            </p>
            <Button onClick={() => setShowNewMessage(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200">
              <Send className="w-4 h-4" />
              Send Email
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Conversation List */}
            <div className="space-y-3">
              {conversations.slice(0, 3).map((conversation) => (
                <div
                  key={conversation.conversationId}
                  onClick={() => setActiveConversation(conversation)}
                  className={`p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 hover:shadow-md ${
                    activeConversation?.conversationId === conversation.conversationId
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-base text-gray-900 truncate flex-1">
                      {conversation.subject}
                    </h4>
                    <Badge 
                      className={`text-xs ml-2 border-0 ${getPriorityColor(conversation.priority)}`}
                    >
                      {conversation.priority || 'normal'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">
                        {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">
                        {conversation.lastMessageAt && formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-2 border">
                    <p className="text-xs text-gray-600 truncate font-medium">
                      From: {conversation.alias}
                    </p>
                  </div>
                </div>
              ))}
              
              {conversations.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-12 text-sm bg-white border-gray-200 hover:bg-gray-50 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                  onClick={() => {/* TODO: Open full chat view */}}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  View All {conversations.length} Conversations
                </Button>
              )}
            </div>

            {/* Active Conversation Messages */}
            {activeConversation && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-base text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    Messages
                  </h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="bg-white border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => API.emailChat.archiveConversation(activeConversation.conversationId)}>
                        <Archive className="w-4 h-4 mr-2" />
                        Archive Conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <ScrollArea className="h-56 pr-3">
                  <div className="space-y-4">
                    {activeConversation.messages.map((message) => (
                      <div
                        key={message.messageId}
                        className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-xl p-3 text-sm shadow-sm border ${
                          message.direction === 'outbound' 
                            ? 'bg-blue-600 text-white border-blue-600' 
                            : 'bg-white text-gray-900 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs">
                              {message.direction === 'outbound' ? 'You' : applicantName}
                            </span>
                            <div className="flex items-center gap-2">
                              {getDeliveryStatusIcon(message.deliveryStatus)}
                              <span className={`text-xs ${message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'}`}>
                                {format(new Date(message.timestamp), 'HH:mm')}
                              </span>
                              
                              {/* Channel Indicator */}
                              <div className={`flex items-center gap-1 ${message.direction === 'outbound' ? 'text-blue-200' : 'text-gray-400'}`}>
                                {message.metadata?.source === 'sms' && (
                                  <>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-xs">SMS</span>
                                  </>
                                )}
                                {message.metadata?.source === 'portal' && (
                                  <>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span className="text-xs">Portal</span>
                                  </>
                                )}
                                {(!message.metadata?.source || message.metadata?.source === 'email') && (
                                  <>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs">Email</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div 
                            className="text-sm leading-relaxed"
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
                <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Reply</span>
                  </div>
                  <ChatRichTextEditor
                    value={replyContent}
                    onChange={setReplyContent}
                    onSend={sendReply}
                    sending={isSending}
                    placeholder="Type your reply... Press Enter to send, Shift+Enter for new line"
                    className="text-sm"
                  />
                  <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded-lg border border-blue-200">
                    <span className="font-medium">Sending from:</span> {activeConversation.alias}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
