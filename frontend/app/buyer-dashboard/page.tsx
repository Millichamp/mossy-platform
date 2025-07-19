"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import ViewingManager from "../../components/ViewingManager";
import OfferManager from "../../components/OfferManager";
import SavedPropertyCard from "../../components/SavedPropertyCard";
import Breadcrumb from "../../components/Breadcrumb";
import { Calendar, DollarSign, Heart, MessageCircle, Home } from "lucide-react";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'offers' | 'viewings' | 'saved' | 'messages'>('overview');
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeProperties, setActiveProperties] = useState<any[]>([]);
  const [activeLoading, setActiveLoading] = useState(false);

  // Mock data for overview - in real app this would come from API
  const stats = {
    savedProperties: savedProperties.length,
    activeOffers: 2,
    scheduledViewings: 3,
    messagesUnread: 5
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'offers', label: 'My Offers', icon: DollarSign },
    { id: 'viewings', label: 'My Viewings', icon: Calendar },
    { id: 'saved', label: 'Saved Properties', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageCircle }
  ];

  // Fetch saved properties
  useEffect(() => {
    if (!user) return;
    
    const fetchSavedProperties = async () => {
      setSavedLoading(true);
      try {
        // First get saved property IDs
        const savedResponse = await fetch(`http://localhost:4000/api/saved-properties?user_id=${user.id}`);
        const savedIds = await savedResponse.json();
        setSavedIds(Array.isArray(savedIds) ? savedIds : []);

        if (savedIds.length > 0) {
          // Then get full property details
          const propertiesResponse = await fetch('http://localhost:4000/api/listings');
          const allProperties = await propertiesResponse.json();
          const savedPropertiesData = allProperties.filter((prop: any) => savedIds.includes(prop.id));
          setSavedProperties(savedPropertiesData);
        }
      } catch (error) {
        console.error('Error fetching saved properties:', error);
      } finally {
        setSavedLoading(false);
      }
    };

    fetchSavedProperties();
  }, [user]);

  // Fetch conversations for message status
  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      try {
        console.log('Fetching conversations for user:', user);
        console.log('User ID being sent:', user.id);
        const response = await fetch(`http://localhost:4000/api/conversations?role=buyer`, {
          headers: {
            'Authorization': `Bearer ${user.id}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🗣️ Conversations data received:', data);
          console.log('📊 Number of conversations:', data.length);
          if (data.length > 0) {
            console.log('📋 First conversation structure:', data[0]);
            // Debug: Check if viewing_requests exist in conversations
            data.forEach((conv: any, index: number) => {
              console.log(`🔍 Conversation ${index} viewing_requests:`, {
                id: conv.id,
                property_id: conv.property_id,
                has_viewing_requests: !!conv.viewing_requests,
                viewing_requests_count: conv.viewing_requests?.length || 0,
                viewing_requests_data: conv.viewing_requests
              });
            });
          }
          setConversations(data);
          
          // Also fetch active properties based on conversations
          await fetchActiveProperties(data);
        } else {
          console.error('Failed to fetch conversations:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [user]);

  // Fetch properties that user has engaged with (messaged, viewed, inquired)
  const fetchActiveProperties = async (conversationsData: any[]) => {
    console.log('fetchActiveProperties called with:', conversationsData);
    if (!conversationsData?.length) {
      console.log('No conversations data, setting empty active properties');
      setActiveProperties([]);
      setActiveLoading(false);
      return;
    }
    
    setActiveLoading(true);
    try {
      // Get all property IDs from conversations
      const propertyIds = conversationsData
        .map(conv => conv.property_id || conv.property?.id)
        .filter(Boolean);
      
      console.log('Property IDs from conversations:', propertyIds);
      
      if (propertyIds.length > 0) {
        // Fetch all properties
        const propertiesResponse = await fetch('http://localhost:4000/api/listings');
        const allProperties = await propertiesResponse.json();
        
        console.log('All properties fetched:', allProperties.length);
        
        // Filter to get only properties the user has engaged with
        const engagedProperties = allProperties.filter((prop: any) => 
          propertyIds.includes(prop.id)
        );
        
        console.log('Engaged properties found:', engagedProperties.length, engagedProperties);
        setActiveProperties(engagedProperties);
      } else {
        console.log('No property IDs found, setting empty active properties');
        setActiveProperties([]);
      }
    } catch (error) {
      console.error('Error fetching active properties:', error);
      setActiveProperties([]);
    } finally {
      setActiveLoading(false);
    }
  };

  // Handle save/unsave toggle
  const handleToggleSave = async (propertyId: string) => {
    if (!user) return;
    setSaving(propertyId);
    const isSaved = savedIds.includes(propertyId);
    
    try {
      if (isSaved) {
        await fetch('http://localhost:4000/api/saved-properties', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, property_id: propertyId })
        });
        setSavedIds(ids => ids.filter(id => id !== propertyId));
        setSavedProperties(props => props.filter(prop => prop.id !== propertyId));
      } else {
        await fetch('http://localhost:4000/api/saved-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, property_id: propertyId })
        });
        setSavedIds(ids => [...ids, propertyId]);
        
        // If the property is in active properties, add it to saved properties
        const propertyToSave = activeProperties.find(prop => prop.id === propertyId);
        if (propertyToSave) {
          setSavedProperties(props => [...props, propertyToSave]);
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setSaving(null);
    }
  };

  // Get conversation data for a property
  const getPropertyConversation = (propertyId: string) => {
    return conversations.find(conv => 
      conv.property_id === propertyId || conv.property?.id === propertyId
    );
  };

  // Get latest viewing request for a property
  const getLatestViewingRequest = (propertyId: string) => {
    console.log(`🔍 getLatestViewingRequest called for property ${propertyId}`);
    const conversation = getPropertyConversation(propertyId);
    console.log(`🔍 getLatestViewingRequest for property ${propertyId}:`, {
      conversation: conversation,
      viewing_requests: conversation?.viewing_requests,
      viewing_requests_length: conversation?.viewing_requests?.length || 0
    });
    
    if (!conversation?.viewing_requests || conversation.viewing_requests.length === 0) {
      console.log(`❌ No viewing requests found for property ${propertyId}`);
      return null;
    }
    
    // Sort by created_at to get the latest viewing request
    const sortedRequests = conversation.viewing_requests.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`✅ Latest viewing request for property ${propertyId}:`, sortedRequests[0]);
    return sortedRequests[0];
  };

  // Handle viewing request actions (visual cue only)
  const handleViewingAction = (action: any, data?: any) => {
    // This is just a visual cue - no complex actions needed
    // Actions could be implemented later if needed
  };

  // Check if property has unread messages
  const hasUnreadMessages = (propertyId: string) => {
    const conversation = getPropertyConversation(propertyId);
    return conversation?.buyer_unread_count > 0;
  };

  // Get unread message count for property
  const getUnreadCount = (propertyId: string) => {
    const conversation = getPropertyConversation(propertyId);
    return conversation?.buyer_unread_count || 0;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> },
              { label: 'Buyer Dashboard', icon: <Heart className="w-4 h-4" /> }
            ]} 
          />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your offers, viewings, and saved properties</p>
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
                    {/* Show badges for counts */}
                    {tab.id === 'offers' && stats.activeOffers > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {stats.activeOffers}
                      </span>
                    )}
                    {tab.id === 'viewings' && stats.scheduledViewings > 0 && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        {stats.scheduledViewings}
                      </span>
                    )}
                    {tab.id === 'saved' && stats.savedProperties > 0 && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                        {stats.savedProperties}
                      </span>
                    )}
                    {tab.id === 'messages' && stats.messagesUnread > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Heart className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Saved Properties</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.savedProperties}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Offers</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeOffers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Scheduled Viewings</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.scheduledViewings}</p>
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
                        <span className="text-sm text-gray-900">Viewing confirmed for Victorian House tomorrow at 2:00 PM</span>
                      </div>
                      <span className="text-sm text-gray-500">1 hour ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">Counter offer received: £825,000</span>
                      </div>
                      <span className="text-sm text-gray-500">3 hours ago</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">You saved a new property in Kensington</span>
                      </div>
                      <span className="text-sm text-gray-500">1 day ago</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => window.location.href = '/buy'}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Home className="w-6 h-6 text-blue-600 mb-2" />
                      <div className="font-medium text-gray-900">Browse Properties</div>
                      <div className="text-sm text-gray-600">Find your next home</div>
                    </button>
                    
                    <button 
                      onClick={() => setActiveTab('saved')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Heart className="w-6 h-6 text-purple-600 mb-2" />
                      <div className="font-medium text-gray-900">View Saved</div>
                      <div className="text-sm text-gray-600">Check your saved properties</div>
                    </button>
                    
                    <button 
                      onClick={() => window.location.href = '/messages'}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <MessageCircle className="w-6 h-6 text-green-600 mb-2" />
                      <div className="font-medium text-gray-900">Messages</div>
                      <div className="text-sm text-gray-600">Chat with sellers</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <OfferManager userRole="buyer" />
            )}

            {activeTab === 'viewings' && (
              <ViewingManager userRole="buyer" />
            )}

            {activeTab === 'saved' && (
              <div className="space-y-6">
                {/* Debug Info - Remove this in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
                    <p className="text-sm text-yellow-700">Conversations: {conversations.length}</p>
                    <p className="text-sm text-yellow-700">Active Properties: {activeProperties.length}</p>
                    <p className="text-sm text-yellow-700">Saved Properties: {savedProperties.length}</p>
                    {conversations.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-yellow-700">Sample conversation:</p>
                        <pre className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded mt-1">
                          {JSON.stringify(conversations[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Active Properties Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Properties</h3>
                    <p className="text-sm text-gray-600">
                      Properties you have messaged, viewed, or enquired about
                    </p>
                  </div>

                  {activeLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-3 text-gray-600">Loading active properties...</span>
                    </div>
                  ) : activeProperties.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-md font-medium text-gray-900 mb-2">No active properties yet</h4>
                      <p className="text-sm text-gray-600">
                        Start messaging sellers about properties you're interested in.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeProperties.map((property) => {
                        const conversation = getPropertyConversation(property.id);
                        const isSaved = savedIds.includes(property.id);
                        const latestViewingRequest = getLatestViewingRequest(property.id);
                        return (
                          <SavedPropertyCard
                            key={property.id}
                            id={property.id}
                            title={property.title}
                            price={property.price}
                            bedrooms={property.bedrooms}
                            bathrooms={property.bathrooms}
                            location={property.address?.displayAddress || 'Location not available'}
                            imageUrl={property.images?.[0]?.url || '/placeholder-property.jpg'}
                            isSaved={isSaved}
                            onToggleSave={() => handleToggleSave(property.id)}
                            saving={saving === property.id}
                            hasUnreadMessages={hasUnreadMessages(property.id)}
                            unreadCount={getUnreadCount(property.id)}
                            conversationId={conversation?.id}
                            viewingRequest={latestViewingRequest}
                            onViewingAction={handleViewingAction}
                            onMessageClick={() => {
                              if (conversation) {
                                window.location.href = `/conversation/${conversation.id}`;
                              } else {
                                window.location.href = `/property/${property.id}?openChat=true`;
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Saved Properties Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Saved Properties</h3>
                      <p className="text-sm text-gray-600">
                        Properties you have saved for later viewing
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'} saved
                    </span>
                  </div>

                  {savedLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-3 text-gray-600">Loading saved properties...</span>
                    </div>
                  ) : savedProperties.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-md font-medium text-gray-900 mb-2">No saved properties yet</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Start browsing properties and save the ones you like for easy access later.
                      </p>
                      <button 
                        onClick={() => window.location.href = '/buy'}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                      >
                        Browse Properties
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedProperties.map((property) => {
                        const conversation = getPropertyConversation(property.id);
                        const latestViewingRequest = getLatestViewingRequest(property.id);
                        return (
                          <SavedPropertyCard
                            key={property.id}
                            id={property.id}
                            title={property.title}
                            price={property.price}
                            bedrooms={property.bedrooms}
                            bathrooms={property.bathrooms}
                            location={property.address?.displayAddress || 'Location not available'}
                            imageUrl={property.images?.[0]?.url || '/placeholder-property.jpg'}
                            isSaved={true}
                            onToggleSave={() => handleToggleSave(property.id)}
                            saving={saving === property.id}
                            hasUnreadMessages={hasUnreadMessages(property.id)}
                            unreadCount={getUnreadCount(property.id)}
                            conversationId={conversation?.id}
                            viewingRequest={latestViewingRequest}
                            onViewingAction={handleViewingAction}
                            onMessageClick={() => {
                              if (conversation) {
                                window.location.href = `/conversation/${conversation.id}`;
                              } else {
                                window.location.href = `/property/${property.id}?openChat=true`;
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
                <p className="text-gray-600">
                  This section will integrate with the messaging system to show all your property conversations.
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
