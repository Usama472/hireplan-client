import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, MessageSquare, Clock, Search, Building, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
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
  metadata?: any;
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

export default function UnifiedApplicantChat({ jobId, onConversationCreated }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await API.applicantAuth.getChatConversations();
      const convs = response.data.conversations || [];
      setConversations(convs);
      
      // Auto-select first conversation if none selected
      if (convs.length > 0 && !selectedConversation) {
        selectConversation(convs[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Select conversation
  const selectConversation = async (conversation: ChatConversation) => {
    setSelectedConversation(conversation);
    
    try {
      const response = await API.applicantAuth.getConversationMessages(conversation.conversationId);
      setMessages(response.data.messages || []);
      
      // Mark any unread messages as read and update the conversation list
      if (conversation.unreadCount > 0) {
        // Update the local conversation's unread count immediately for UI responsiveness
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.conversationId === conversation.conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
        
        // Explicitly mark conversation as read to ensure consistency
        try {
          await API.applicantAuth.markConversationAsRead(conversation.conversationId);
          
          // Notify other components to refresh conversation lists silently
          localStorage.setItem('chat_conversation_updated', Date.now().toString());
        } catch (error) {
          console.error('Error marking conversation as read:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      await API.applicantAuth.sendMessage(selectedConversation.conversationId, { message: newMessage });
      setNewMessage('');
      
      // Refresh messages
      const response = await API.applicantAuth.getConversationMessages(selectedConversation.conversationId);
      setMessages(response.data.messages || []);
      
      // Refresh conversation list to update unread counts
      await fetchConversations();
      
      // Notify other components to refresh conversation lists silently
      try {
        localStorage.setItem('chat_conversation_updated', Date.now().toString());
      } catch (error) {
        console.log('Could not notify other components');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(conv => 
        conv.subject.toLowerCase().includes(search) ||
        conv.jobTitle.toLowerCase().includes(search) ||
        conv.companyName.toLowerCase().includes(search)
      );
    }

    // Company filter
    if (companyFilter !== 'all') {
      filtered = filtered.filter(conv => conv.companyName === companyFilter);
    }

    return filtered;
  }, [conversations, searchTerm, companyFilter]);

  // Get unique companies
  const availableCompanies = useMemo(() => {
    const companies = [...new Set(conversations.map(conv => conv.companyName))].filter(Boolean);
    return companies.sort();
  }, [conversations]);

  // Format message time
  const formatMessageTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  // Effects
  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-200px)] bg-gray-50 rounded-lg overflow-hidden">
      {/* Left Sidebar - Conversations */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Conversations</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {filteredConversations.length}
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Company Filter */}
          {availableCompanies.length > 1 && (
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {availableCompanies.map(company => (
                  <SelectItem key={company} value={company}>
                    <div className="flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      {company}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedConversation?.conversationId === conversation.conversationId
                      ? 'bg-blue-50 border border-blue-200 shadow-sm'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Company/Job Icon */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {(conversation.companyName || conversation.jobTitle || 'C')[0].toUpperCase()}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate text-sm">
                        {conversation.subject || conversation.jobTitle || 'Chat Conversation'}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        {conversation.companyName || conversation.jobTitle || 'Job Application'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(new Date(conversation.lastMessageAt))}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : conversations.length > 0 ? (
              <div className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matching conversations</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search or filters.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCompanyFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-500">
                  Your conversations with recruiters will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {(selectedConversation.companyName || selectedConversation.jobTitle || 'C')[0].toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">
                    {selectedConversation.subject || selectedConversation.jobTitle}
                  </h2>
                  <p className="text-sm text-gray-600 truncate">
                    {selectedConversation.companyName || 'Company'} • {selectedConversation.jobTitle}
                  </p>
                </div>

                {selectedConversation.status && (
                  <Badge variant="outline" className="text-xs">
                    {selectedConversation.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
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
                          {message.direction === 'inbound' ? 'R' : 'Me'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`flex flex-col ${message.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl shadow-sm max-w-full ${
                          message.direction === 'outbound'
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-md'
                        }`}>
                          <div 
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: message.content }}
                          />
                        </div>
                        
                        <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                          message.direction === 'outbound' ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                          <span>{formatMessageTime(message.timestamp)}</span>
                          {message.source === 'portal' && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              Portal
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-3">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-h-[60px] max-h-32 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="self-end px-6"
                  size="default"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-12">
              <MessageSquare className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                Select a conversation to start chatting
              </h3>
              <p className="text-gray-600 text-lg">
                Choose from your conversations on the left to continue chatting with recruiters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
