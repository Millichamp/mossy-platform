'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import MessageCard from '../../components/messaging/MessageCard';
import Breadcrumb from '../../components/Breadcrumb';
import { messagingService } from '../../lib/messagingService';
import { Home, MessageCircle } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagingService.getAllConversations(activeTab);
      setConversations(data);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, activeTab]);

  // Refresh data when component gains focus (user returns from conversation)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        console.log('Messages page focused, refreshing conversations...');
        loadConversations();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  if (!user) {
    return null; // ProtectedRoute will handle this
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
              { label: 'Messages', icon: <MessageCircle className="w-4 h-4" /> }
            ]} 
          />
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">
              Manage your property conversations and inquiries
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'active'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Active Conversations
                </button>
                <button
                  onClick={() => setActiveTab('archived')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'archived'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Archived
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading conversations...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadConversations}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} conversations
              </h3>
              <p className="text-gray-600">
                {activeTab === 'active' 
                  ? "Start browsing properties to begin conversations with sellers."
                  : "Archived conversations will appear here."
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {conversations.map((conversation) => (
                <MessageCard
                  key={conversation.id}
                  conversation={conversation}
                  userRole={conversation.userRole}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
