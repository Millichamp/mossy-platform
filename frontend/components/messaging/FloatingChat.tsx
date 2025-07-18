'use client';

import React, { useState, useEffect, useRef } from 'react';
import { messagingService, Conversation, Message } from '../../lib/messagingService';
import { useAuth } from '../../context/AuthContext';
import MakeOfferModal from '../MakeOfferModal';
import BookViewingModal from '../BookViewingModal';

interface FloatingChatProps {
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyAddress: string;
  sellerId: string;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ 
  propertyId, 
  propertyTitle, 
  propertyPrice, 
  propertyAddress, 
  sellerId 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isExpanded) {
      loadConversation();
    }
  }, [user, isExpanded, propertyId]);

  useEffect(() => {
    if (conversation && isExpanded) {
      loadMessages();
      
      // Subscribe to new messages with fallback
      const subscription = messagingService.subscribeToMessages(conversation.id, (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      // Fallback polling if realtime fails
      let pollInterval: NodeJS.Timeout | null = null;
      
      // Set up polling as backup (only if subscription fails)
      setTimeout(() => {
        if (subscription === null) {
          console.log('🔄 Using backup message sync (messages will update every 3 seconds)');
          let lastMessageCount = 0;
          pollInterval = setInterval(async () => {
            try {
              const latestMessages = await messagingService.getMessages(conversation.id, 1, 50);
              if (latestMessages.length > lastMessageCount) {
                setMessages(latestMessages);
                lastMessageCount = latestMessages.length;
                scrollToBottom();
              }
            } catch (error) {
              console.error('Polling error:', error);
            }
          }, 3000); // Poll every 3 seconds
        }
      }, 2000); // Wait 2 seconds to see if realtime works

      // Mark messages as read when chat is expanded
      const markAsReadTimer = setTimeout(async () => {
        try {
          await messagingService.markAsRead(conversation.id);
          console.log('FloatingChat: Marked messages as read on expansion');
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      }, 1000); // Small delay to ensure messages are loaded

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
        if (pollInterval) {
          clearInterval(pollInterval);
        }
        clearTimeout(markAsReadTimer);
      };
    }
  }, [conversation, isExpanded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      const existingConversation = await messagingService.getConversationByProperty(propertyId);
      setConversation(existingConversation);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const loadMessages = async () => {
    if (!conversation) return;
    
    setLoading(true);
    try {
      const data = await messagingService.getMessages(conversation.id);
      setMessages(data);
      
      // Mark messages as read when chat is opened
      if (isExpanded) {
        await messagingService.markAsRead(conversation.id);
        console.log('FloatingChat: Messages marked as read for conversation:', conversation.id);
      }
      
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    if (!conversation) {
      // Start new conversation
      try {
        setSending(true);
        const response = await messagingService.startConversation(propertyId, newMessage.trim());
        setConversation(response.conversation);
        setMessages([response.message]);
        setNewMessage('');
      } catch (error) {
        console.error('Error starting conversation:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setSending(false);
      }
    } else {
      // Send message to existing conversation
      try {
        setSending(true);
        const message = await messagingService.sendMessage(conversation.id, newMessage.trim());
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } finally {
        setSending(false);
      }
    }
  };

  const handleMakeOffer = () => {
    setShowOfferModal(true);
  };

  const handleBookViewing = () => {
    setShowViewingModal(true);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Check URL parameters to auto-open chat
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openChat') === 'true') {
      setIsExpanded(true);
      // Remove the parameter from URL without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  if (!user || user.id === sellerId) {
    return null; // Don't show chat for non-users or if viewing own property
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        // Collapsed chat bubble
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 group transform hover:scale-105"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7.93-6.84c-.042-.311-.058-.633-.058-.96 0-.408.015-.792.058-1.16A8.013 8.013 0 0113 4c4.418 0 8 3.582 8 8z" />
            </svg>
            <span className="hidden group-hover:block text-sm whitespace-nowrap">
              Chat about this property
            </span>
          </div>
        </button>
      ) : (
        // Expanded chat window
                // Expanded chat window
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-2xl w-80 h-96 flex flex-col border border-gray-200 backdrop-blur-sm"
        >
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-900">Property Chat</h3>
              <p className="text-sm text-gray-600 truncate">{propertyTitle}</p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 py-4 text-sm">
                <p>Start a conversation about this property!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === user?.id;
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      isOwn 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm' 
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Buttons */}
          <div className="p-2 border-t bg-gray-50">
            <div className="flex space-x-2 mb-2">
              <button
                onClick={handleMakeOffer}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs py-2 rounded font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
              >
                Make Offer
              </button>
              <button
                onClick={handleBookViewing}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs py-2 rounded font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 transform hover:scale-105"
              >
                Book Viewing
              </button>
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded text-sm hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
              >
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modals */}
      <MakeOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        property={{
          id: propertyId,
          title: propertyTitle,
          price: propertyPrice,
          address: { displayAddress: propertyAddress },
          seller_id: sellerId
        }}
        onOfferSubmitted={() => {
          setShowOfferModal(false);
          // Optionally refresh messages to show the new offer
          if (conversation) {
            loadMessages();
          }
        }}
      />

      <BookViewingModal
        isOpen={showViewingModal}
        onClose={() => setShowViewingModal(false)}
        property={{
          id: propertyId,
          title: propertyTitle,
          address: { displayAddress: propertyAddress },
          seller_id: sellerId
        }}
        onViewingBooked={() => {
          setShowViewingModal(false);
          // Optionally refresh messages to show the new viewing request
          if (conversation) {
            loadMessages();
          }
        }}
      />
    </div>
  );
};

export default FloatingChat;
