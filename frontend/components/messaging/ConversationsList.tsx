'use client';

import React, { useState, useEffect } from 'react';
import { messagingService, Conversation } from '../../lib/messagingService';
import { useAuth } from '../../context/AuthContext';
import ChatWindow from './ChatWindow';

interface ConversationsListProps {
  role?: 'buyer' | 'seller';
  propertyId?: string; // Optional filter by property
}

const ConversationsList: React.FC<ConversationsListProps> = ({ role = 'buyer', propertyId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
      
      // Subscribe to conversation updates
      const subscription = messagingService.subscribeToConversations(user.id, (updatedConversation) => {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === updatedConversation.id 
              ? { ...conv, ...updatedConversation }
              : conv
          )
        );
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, role, activeTab, propertyId]);

  const loadConversations = async () => {
    try {
      const data = await messagingService.getConversations(role, activeTab, propertyId);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUnreadCount = (conversation: Conversation) => {
    return role === 'buyer' 
      ? conversation.buyer_unread_count 
      : conversation.seller_unread_count;
  };

  const getOtherPartyName = (conversation: Conversation) => {
    const otherParty = role === 'buyer' ? conversation.seller : conversation.buyer;
    if (otherParty?.raw_user_meta_data?.first_name) {
      return `${otherParty.raw_user_meta_data.first_name} ${otherParty.raw_user_meta_data.last_name || ''}`.trim();
    }
    return otherParty?.email?.split('@')[0] || 'User';
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to view your conversations.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">
          {role === 'buyer' ? 'My Inquiries' : 'Property Inquiries'}
        </h1>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 py-2 px-4 rounded-md transition-colors ${
              activeTab === 'archived'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading conversations...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7.93-6.84c-.042-.311-.058-.633-.058-.96 0-.408.015-.792.058-1.16A8.013 8.013 0 0113 4c4.418 0 8 3.582 8 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-600">
            {role === 'buyer' 
              ? "Start browsing properties and contact sellers to begin conversations."
              : "When buyers contact you about your properties, conversations will appear here."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.property?.title || 'Property'}
                    </h3>
                    {getUnreadCount(conversation) > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {getUnreadCount(conversation)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {role === 'buyer' ? 'Seller' : 'Buyer'}: {getOtherPartyName(conversation)}
                  </p>
                  
                  {conversation.property?.address && (
                    <p className="text-xs text-gray-500 mb-2">{conversation.property.address}</p>
                  )}
                  
                  <p className="text-sm text-gray-800 line-clamp-2">
                    {conversation.last_message_preview || 'No messages yet'}
                  </p>
                </div>
                
                <div className="ml-4 flex flex-col items-end">
                  <span className="text-xs text-gray-500">
                    {formatLastMessageTime(conversation.last_message_at)}
                  </span>
                  {conversation.property?.price && (
                    <span className="text-sm font-semibold text-green-600 mt-1">
                      ${conversation.property.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Window */}
      {selectedConversation && (
        <ChatWindow
          conversationId={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}
    </div>
  );
};

export default ConversationsList;
