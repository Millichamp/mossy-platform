"use client";


import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyCard from "../../components/PropertyCard";

const TABS = [
  { key: "selling", label: "Selling" },
  { key: "buying", label: "Buying" },
];

function NotificationBell({ unread }: { unread: number }) {
  return (
    <div className="relative cursor-pointer ml-4">
      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
          {unread}
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("mossy_dashboard_tab") || "selling" : "selling"
  );
  const [sellingListings, setSellingListings] = useState<any[]>([]);
  const [sellingLoading, setSellingLoading] = useState(false);
  const [sellingError, setSellingError] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  // Saved properties state
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

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
          <NotificationBell unread={unreadNotifications} />
        </div>
        <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
          <input
            type="text"
            placeholder="Search your activity..."
            className="w-full sm:w-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      location={`${listing.address}, ${listing.city}, ${listing.postcode}`}
                      imageUrl={listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder-property.jpg'}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "buying" && (
            <div>
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
                      location={`${property.address}, ${property.city}, ${property.postcode}`}
                      imageUrl={property.images && property.images.length > 0 ? property.images[0] : '/placeholder-property.jpg'}
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
