"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import ViewingManager from "../../components/ViewingManager";
import OfferManager from "../../components/OfferManager";
import Breadcrumb from "../../components/Breadcrumb";
import { Calendar, DollarSign, Home, MessageCircle } from "lucide-react";

export default function PropertyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'offers' | 'viewings' | 'messages'>('overview');

  // Mock data for overview - in real app this would come from API
  const stats = {
    totalViews: 234,
    savedByUsers: 12,
    activeOffers: 3,
    pendingViewings: 5,
    messagesUnread: 8
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'offers', label: 'Offers', icon: DollarSign },
    { id: 'viewings', label: 'Viewings', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageCircle }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
              { label: 'Property Dashboard', icon: <Home className="w-4 h-4" /> }
            ]} 
          />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Property Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your property listings, offers, and viewings</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    {/* Show badges for unread counts */}
                    {tab.id === 'offers' && stats.activeOffers > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        {stats.activeOffers}
                      </span>
                    )}
                    {tab.id === 'viewings' && stats.pendingViewings > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                        {stats.pendingViewings}
                      </span>
                    )}
                    {tab.id === 'messages' && stats.messagesUnread > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {stats.messagesUnread}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Home className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Views</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Home className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Saved</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.savedByUsers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Offers</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeOffers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Viewings</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingViewings}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.messagesUnread}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">New offer received for £820,000</span>
                      </div>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">Viewing request for tomorrow at 2:00 PM</span>
                      </div>
                      <span className="text-sm text-gray-500">5 hours ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">New message from potential buyer</span>
                      </div>
                      <span className="text-sm text-gray-500">1 day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <OfferManager userRole="seller" />
            )}

            {activeTab === 'viewings' && (
              <ViewingManager userRole="seller" />
            )}

            {activeTab === 'messages' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
                <p className="text-gray-600">
                  This section will integrate with the messaging system to show all property-related conversations.
                </p>
                <div className="mt-4">
                  <button 
                    onClick={() => window.location.href = '/messages'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Messages
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
