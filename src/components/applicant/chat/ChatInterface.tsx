import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import API from '@/http';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  direction: 'inbound' | 'outbound';
  isRead: boolean;
  from: string;
  to: string[];
  source?: 'email' | 'portal';
}

interface ChatConversation {
  id: string;
  conversationId: string;
  subject: string;
  jobTitle: string;
  companyName: string;
  status: string;
  lastMessageAt: Date;
  unreadCount: number;
  messages: ChatMessage[];
}

interface ChatInterfaceProps {
  jobId?: string;
  onConversationCreated?: (conversationId: string) => void;
}

export default function ChatInterface({ jobId, onConversationCreated }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await API.applicantAuth.getChatConversations();
      setConversations(response.data.conversations || []);
      
      // Auto-select first conversation if none selected
      if (response.data.conversations?.length > 0 && !selectedConversation) {
        setSelectedConversation(response.data.conversations[0].conversationId);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await API.applicantAuth.getConversationMessages(conversationId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      await API.applicantAuth.sendMessage(selectedConversation, {
        message: newMessage
      });

      setNewMessage('');
      await fetchMessages(selectedConversation);
      await fetchConversations(); // Refresh to update last message time
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const createNewConversation = async () => {
    if (!jobId || !newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await API.applicantAuth.createConversation({
        jobId,
        message: newMessage
      });

      setNewMessage('');
      await fetchConversations();
      
      if (response.data.conversationId) {
        setSelectedConversation(response.data.conversationId);
        onConversationCreated?.(response.data.conversationId);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedConversation) {
      await sendMessage();
    } else if (jobId) {
      await createNewConversation();
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {conversations.length > 0 ? (
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.conversationId ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.conversationId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.jobTitle}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.companyName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {formatMessageTime(conversation.lastMessageAt)}
                            </span>
                          </div>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Start chatting with recruiters from your applications</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader>
                <CardTitle className="text-lg">
                  {conversations.find(c => c.conversationId === selectedConversation)?.subject}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.direction === 'outbound'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div 
                            className="text-sm"
                            dangerouslySetInnerHTML={{ __html: message.content }}
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs ${
                              message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatMessageTime(message.timestamp)}
                            </span>
                            {message.source === 'portal' && (
                              <Badge variant="secondary" className="text-xs">
                                Portal
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || sending}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">
                  {jobId ? 'Start a conversation' : 'Select a conversation'}
                </h3>
                <p className="text-sm">
                  {jobId 
                    ? 'Send a message to start chatting with the recruiter'
                    : 'Choose a conversation from the left to view messages'
                  }
                </p>
                {jobId && (
                  <div className="mt-6 max-w-md mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Write your first message..."
                        className="min-h-[100px]"
                      />
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim() || sending}
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Start Conversation
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
