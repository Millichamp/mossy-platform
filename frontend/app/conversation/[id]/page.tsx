'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { messagingService, Conversation, Message } from '../../../lib/messagingService';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import Breadcrumb from '../../../components/Breadcrumb';
import { Home, MessageCircle, ArrowLeft } from 'lucide-react';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>('buyer');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversationId = params.id as string;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      
      // Get all conversations to find this one
      const allConversations = await messagingService.getAllConversations();
      const conv = allConversations.find(c => c.id === conversationId);
      
      if (!conv) {
        router.push('/messages');
        return;
      }
      
      setConversation(conv);
      
      // Determine user role based on user ID
      const role = conv.buyer_id === user?.id ? 'buyer' : 'seller';
      setUserRole(role);
      
      // Set other user info
      const otherUserId = role === 'buyer' ? conv.seller_id : conv.buyer_id;
      setOtherUser({
        id: otherUserId,
        name: `User ${otherUserId.slice(0, 8)}...`,
        isOnline: true // TODO: Implement real online status
      });
      
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!conversation) return;
    
    try {
      const msgs = await messagingService.getMessages(conversation.id);
      setMessages(msgs);
      
      // Mark messages as read when conversation is loaded
      await messagingService.markAsRead(conversation.id);
      console.log('Messages marked as read for conversation:', conversation.id);
      
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) return;
    
    try {
      setSending(true);
      const message = await messagingService.sendMessage(conversation.id, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadConversation();
    }
  }, [user, conversationId]);

  useEffect(() => {
    if (conversation) {
      loadMessages();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Loading conversation...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!conversation) {
    return (
      <ProtectedRoute>
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Conversation not found</p>
            <button
              onClick={() => router.push('/messages')}
              className="mt-4 text-green-600 hover:text-green-700"
            >
              Back to Messages
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white px-4 md:px-6 pt-4">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
              { label: 'Messages', href: '/messages', icon: <MessageCircle className="w-4 h-4" /> },
              { label: conversation.property?.title || 'Conversation' }
            ]} 
          />
        </div>
        
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-gray-100" style={{ height: '80px' }}>
          <div className="h-full flex items-center px-4 md:px-6">
            {/* Back Arrow */}
            <button
              onClick={() => router.push('/messages')}
              className="text-gray-700 hover:text-gray-900 mr-4"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Property Details */}
            <div className="flex-1 min-w-0">
              <h1 className="font-medium text-gray-900 truncate">
                {conversation.property?.title || 'Property Details'}
              </h1>
              <p className="text-sm text-gray-600">
                £{conversation.property?.price?.toLocaleString()}
              </p>
            </div>

            {/* Other User Info - Centered */}
            <div className="flex items-center mx-8">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3 border-2 border-white shadow-sm">
                <span className="text-sm font-medium text-gray-700">
                  {otherUser?.name?.[0] || 'U'}
                </span>
              </div>
              
              <div className="text-center">
                <p className="font-medium text-gray-900">
                  {otherUser?.name}
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Active now</span>
                </div>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Start your conversation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isFromMe = message.sender_id === user.id;
                  const showTimestamp = index === 0 || 
                    new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000; // 5 minutes
                  
                  return (
                    <div key={message.id}>
                      {showTimestamp && (
                        <div className="text-center mb-4">
                          <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                            {formatTimestamp(message.created_at)}
                          </span>
                        </div>
                      )}
                      
                      <div className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                            isFromMe
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                              : 'bg-white text-gray-900 shadow-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-end space-x-3">
              {/* Attachment Button */}
              <button className="text-gray-400 hover:text-green-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              {/* Input Field */}
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200"
                  disabled={sending}
                />
              </div>

              {/* Send Button or Quick Actions */}
              {newMessage.trim() ? (
                <button
                  onClick={sendMessage}
                  disabled={sending}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-full hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-green-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-green-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
