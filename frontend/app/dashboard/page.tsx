"use client";


import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyCard from "../../components/PropertyCard";
import SavedPropertyCard from "../../components/SavedPropertyCard";

const TABS = [
  { key: "selling", label: "Selling" },
  { key: "buying", label: "Buying" },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("mossy_dashboard_tab") || "selling" : "selling"
  );
  const [sellingListings, setSellingListings] = useState<any[]>([]);
  const [sellingLoading, setSellingLoading] = useState(false);
  const [sellingError, setSellingError] = useState('');
  // Saved properties state
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeProperties, setActiveProperties] = useState<any[]>([]);
  const [activeLoading, setActiveLoading] = useState(false);

  // Fetch user's saved property IDs and details for Buying tab
  useEffect(() => {
    if (user && activeTab === 'buying') {
      setSavedLoading(true);
      fetch(`http://localhost:4000/api/saved-properties?user_id=${user.id}`)
        .then(res => res.json())
        .then(async (ids) => {
          console.log('Fetched saved property IDs:', ids);
          setSavedIds(Array.isArray(ids) ? ids : []);
          if (Array.isArray(ids) && ids.length > 0) {
            // Fetch property details for each saved property
            const res = await fetch(`http://localhost:4000/api/listings`);
            const allListings = await res.json();
            const filtered = allListings.filter((l: any) => ids.includes(l.id));
            console.log('Filtered saved properties:', filtered);
            setSavedProperties(filtered);
          } else {
            setSavedProperties([]);
          }
        })
        .catch(() => {
          setSavedIds([]);
          setSavedProperties([]);
        })
        .finally(() => setSavedLoading(false));
    }
  }, [user, activeTab]);

  // Fetch conversations and active properties for Buying tab
  useEffect(() => {
    if (user && activeTab === 'buying') {
      fetchConversationsAndActiveProperties();
    }
  }, [user, activeTab]);

  // Refresh data when component gains focus (user returns from conversation)
  useEffect(() => {
    const handleFocus = () => {
      if (user && activeTab === 'buying') {
        console.log('Window focused, refreshing conversation data...');
        fetchConversationsAndActiveProperties();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, activeTab]);

  const fetchConversationsAndActiveProperties = async () => {
    if (!user) return;
    
    setActiveLoading(true);
    try {
      console.log('Fetching conversations for user:', user.id);
      const response = await fetch(`http://localhost:4000/api/conversations?role=buyer`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const conversationsData = await response.json();
        console.log('Conversations data:', conversationsData);
        setConversations(conversationsData);
        
        // Fetch active properties based on conversations
        if (conversationsData?.length > 0) {
          const propertyIds = conversationsData
            .map((conv: any) => conv.property_id || conv.property?.id)
            .filter(Boolean);
          
          console.log('Property IDs from conversations:', propertyIds);
          
          if (propertyIds.length > 0) {
            const propertiesResponse = await fetch('http://localhost:4000/api/listings');
            const allProperties = await propertiesResponse.json();
            const engagedProperties = allProperties.filter((prop: any) => 
              propertyIds.includes(prop.id)
            );
            
            console.log('Active properties found:', engagedProperties.length);
            setActiveProperties(engagedProperties);
          }
        }
      } else {
        console.error('Failed to fetch conversations:', response.status);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setActiveLoading(false);
    }
  };

  // Helper functions for conversation data
  const getPropertyConversation = (propertyId: string) => {
    return conversations.find(conv => 
      conv.property_id === propertyId || conv.property?.id === propertyId
    );
  };

  const hasUnreadMessages = (propertyId: string) => {
    const conversation = getPropertyConversation(propertyId);
    return conversation?.buyer_unread_count > 0;
  };

  const getUnreadCount = (propertyId: string) => {
    const conversation = getPropertyConversation(propertyId);
    return conversation?.buyer_unread_count || 0;
  };

  // Get latest viewing request for a property
  const getLatestViewingRequest = (propertyId: string) => {
    console.log(`🔍 Dashboard getLatestViewingRequest called for property ${propertyId}`);
    const conversation = getPropertyConversation(propertyId);
    console.log(`🔍 Dashboard getLatestViewingRequest for property ${propertyId}:`, {
      conversation: conversation,
      viewing_requests: conversation?.viewing_requests,
      viewing_requests_length: conversation?.viewing_requests?.length || 0
    });
    
    if (!conversation?.viewing_requests || conversation.viewing_requests.length === 0) {
      console.log(`❌ Dashboard: No viewing requests found for property ${propertyId}`);
      return null;
    }
    
    // Sort by created_at to get the latest viewing request
    const sortedRequests = conversation.viewing_requests.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    console.log(`✅ Dashboard: Latest viewing request for property ${propertyId}:`, sortedRequests[0]);
    return sortedRequests[0];
  };

  // Handle viewing request actions (visual cue only)
  const handleViewingAction = (action: any, data?: any) => {
    // This is just a visual cue - no complex actions needed
    // Actions could be implemented later if needed
    console.log('🎬 Dashboard: Viewing action triggered:', { action, data });
  };

  // Unsave handler for dashboard
  const handleToggleSave = async (propertyId: string) => {
    if (!user) return;
    setSaving(propertyId);
    try {
      await fetch('http://localhost:4000/api/saved-properties', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, property_id: propertyId })
      });
      setSavedIds(ids => ids.filter(id => id !== propertyId));
      setSavedProperties(props => props.filter((p: any) => p.id !== propertyId));
    } catch (e) {
      // Optionally show error
    } finally {
      setSaving(null);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Fetch user's listings for Selling tab
  useEffect(() => {
    if (user && activeTab === 'selling') {
      setSellingLoading(true);
      setSellingError('');
      fetch(`http://localhost:4000/api/listings?seller_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setSellingListings(Array.isArray(data) ? data : []);
        })
        .catch(err => setSellingError('Failed to load your listings'))
        .finally(() => setSellingLoading(false));
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mossy_dashboard_tab", activeTab);
    }
  }, [activeTab]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Dashboard</h1>
        </div>
        
        {/* Messages CTA Card */}
        <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7.93-6.84c-.042-.311-.058-.633-.058-.96 0-.408.015-.792.058-1.16A8.013 8.013 0 0113 4c4.418 0 8 3.582 8 8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Property Messages</h3>
                <p className="text-green-100">Stay connected with buyers and sellers</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/messages')}
              className="bg-white/90 backdrop-blur-sm text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg"
            >
              View Messages
            </button>
          </div>
        </div>
        
        <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <input
            type="text"
            placeholder="Search your activity..."
            className="w-full sm:w-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
          />
        </div>
        <div className="flex border-b border-gray-200 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2 font-medium transition-colors duration-150 focus:outline-none ${
                activeTab === tab.key
                  ? "text-green-600 border-b-2 border-green-600 bg-green-50"
                  : "text-gray-600 hover:text-green-600"
              }`}
            >
              {tab.label}
              {tab.key === "selling" && sellingListings.length > 0 && (
                <span className="ml-2 bg-green-600 text-white text-xs rounded-full px-2 py-0.5">{sellingListings.length} listed</span>
              )}
            </button>
          ))}
        </div>
        <div>
          {activeTab === "selling" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Listings</h2>
              {sellingLoading ? (
                <div className="text-gray-500">Loading your listings...</div>
              ) : sellingError ? (
                <div className="text-red-600">{sellingError}</div>
              ) : sellingListings.length === 0 ? (
                <div className="text-gray-500">You have no listings yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sellingListings.map((listing) => (
                    <PropertyCard
                      key={listing.id}
                      id={listing.id}
                      title={listing.title}
                      price={listing.price}
                      bedrooms={listing.bedrooms}
                      bathrooms={listing.bathrooms}
                      location={typeof listing.address === 'string' ? JSON.parse(listing.address).displayAddress || JSON.parse(listing.address).line1 : `${listing.address}, ${listing.city}, ${listing.postcode}`}
                      imageUrl={listing.images && listing.images.length > 0 && listing.images[0].url ? listing.images[0].url : '/placeholder-property.jpg'}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "buying" && (
            <div>
              {/* Active Properties Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Active Properties</h2>
                <p className="text-gray-600 text-sm mb-4">Properties you have messaged, viewed, or enquired about</p>
                
                {activeLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-3 text-gray-600">Loading active properties...</span>
                  </div>
                ) : activeProperties.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7.93-6.84c-.042-.311-.058-.633-.058-.96 0-.408.015-.792.058-1.16A8.013 8.013 0 0113 4c4.418 0 8 3.582 8 8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active properties yet</h3>
                    <p className="text-gray-600 mb-4">Start messaging sellers about properties you're interested in.</p>
                    <button 
                      onClick={() => window.location.href = '/buy'}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Browse Properties
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeProperties.map((property) => {
                      const conversation = getPropertyConversation(property.id);
                      const latestViewingRequest = getLatestViewingRequest(property.id);
                      const isSaved = savedIds.includes(property.id);
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
              <h2 className="text-xl font-semibold mb-4">Saved Properties</h2>
              {savedLoading ? (
                <div className="text-gray-500">Loading saved properties...</div>
              ) : savedProperties.length === 0 ? (
                <div className="text-gray-500">You have no saved properties yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {savedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      id={property.id}
                      title={property.title}
                      price={property.price}
                      bedrooms={property.bedrooms}
                      bathrooms={property.bathrooms}
                      location={typeof property.address === 'string' ? JSON.parse(property.address).displayAddress || JSON.parse(property.address).line1 : `${property.address}, ${property.city}, ${property.postcode}`}
                      imageUrl={property.images && property.images.length > 0 && property.images[0].url ? property.images[0].url : '/placeholder-property.jpg'}
                      isSaved={true}
                      onToggleSave={() => handleToggleSave(property.id)}
                      saving={saving === property.id}
                    />
                  ))}
                </div>
              )}
              {/* ...existing activity UI... */}
              <h3 className="text-lg font-semibold mb-2">My Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="font-semibold mb-2">Viewed</h4>
                  <ul className="text-xs text-gray-700">
                    <li>Modern 3 Bedroom House <span className="ml-2 text-gray-400">(Viewing requested)</span></li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="font-semibold mb-2">Enquired</h4>
                  <ul className="text-xs text-gray-700">
                    <li>Cosy Flat in Soho <span className="ml-2 text-yellow-600">(Awaiting reply)</span></li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="font-semibold mb-2">Offered</h4>
                  <ul className="text-xs text-gray-700">
                    <li>Modern 3 Bedroom House <span className="ml-2 text-green-600">(Offer accepted)</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
