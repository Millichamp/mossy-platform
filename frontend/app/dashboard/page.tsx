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
  // Placeholder activity counts
  const [sellingCount, setSellingCount] = useState(3); // e.g. 3 new
  const [buyingCount, setBuyingCount] = useState(1); // e.g. 1 new
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

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
              {tab.key === "selling" && sellingCount > 0 && (
                <span className="ml-2 bg-green-600 text-white text-xs rounded-full px-2 py-0.5">{sellingCount} new</span>
              )}
              {tab.key === "buying" && buyingCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">{buyingCount} new</span>
              )}
            </button>
          ))}
        </div>
        <div>
          {activeTab === "selling" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Listings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Example property cards using PropertyCard */}
                <div className="relative">
                  <PropertyCard
                    id="1"
                    title="Modern 3 Bedroom House"
                    price={650000}
                    bedrooms={3}
                    bathrooms={2}
                    location="Richmond, London"
                    imageUrl="/placeholder-property.jpg"
                  />
                  {/* Quick stats overlay */}
                  <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded px-2 py-1 flex gap-2 text-xs shadow">
                    <span>👁️ 12</span>
                    <span>💾 3</span>
                    <span>⭐ 2</span>
                  </div>
                  {/* Status badge */}
                  <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Active</span>
                  {/* Expandable section placeholder */}
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">View Details</summary>
                    <div className="mt-2 text-xs text-gray-700">
                      <div className="mb-2">
                        <span className="font-semibold">Viewing Requests (2):</span>
                        <ul className="list-disc ml-5">
                          <li>Jane Doe - 20/07/2025 14:00 <button className="ml-2 text-green-600">Accept</button> <button className="ml-1 text-red-600">Reject</button></li>
                          <li>John Smith - 21/07/2025 10:30 <button className="ml-2 text-green-600">Accept</button> <button className="ml-1 text-red-600">Reject</button></li>
                        </ul>
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Enquiries (1):</span>
                        <ul className="list-disc ml-5">
                          <li>"Is the garden south-facing?" <button className="ml-2 text-green-600">Reply</button></li>
                        </ul>
                      </div>
                      <div>
                        <span className="font-semibold">Offers (1):</span>
                        <ul className="list-disc ml-5">
                          <li>£640,000 from Jane Doe <button className="ml-2 text-green-600">Accept</button> <button className="ml-1 text-yellow-600">Counter</button> <button className="ml-1 text-red-600">Reject</button></li>
                        </ul>
                      </div>
                    </div>
                  </details>
                  <div className="flex gap-2 mt-2">
                    <button className="text-green-600 hover:underline text-sm">Edit Listing</button>
                    <button className="text-gray-500 hover:underline text-sm">Mark as Sold</button>
                  </div>
                </div>
                {/* Add more property cards here as needed */}
              </div>
            </div>
          )}
          {activeTab === "buying" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Saved Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Example saved property card using PropertyCard */}
                <div className="relative">
                  <PropertyCard
                    id="2"
                    title="Cosy Flat in Soho"
                    price={450000}
                    bedrooms={1}
                    bathrooms={1}
                    location="Soho, London"
                    imageUrl="/placeholder-property.jpg"
                  />
                  <button className="absolute top-2 right-2 text-red-500 bg-white bg-opacity-80 rounded px-2 py-0.5 text-xs">Unsave</button>
                </div>
                {/* Add more saved property cards here */}
              </div>
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
