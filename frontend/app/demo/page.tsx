"use client";

import { useState } from "react";
import MakeOfferModal from "../../components/MakeOfferModal";
import BookViewingModal from "../../components/BookViewingModal";
import ViewingManager from "../../components/ViewingManager";
import OfferManager from "../../components/OfferManager";
import { Calendar, DollarSign, MessageCircle, Home } from "lucide-react";

export default function DemoPage() {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [activeDemo, setActiveDemo] = useState<'overview' | 'offer-modal' | 'viewing-modal' | 'offer-manager' | 'viewing-manager'>('overview');

  const mockProperty = {
    id: 'demo-property-1',
    title: '4 Bed Victorian House in Kensington',
    price: 850000,
    address: { displayAddress: '123 Garden Street, Kensington, London SW7 4AA' },
    seller_id: 'seller-123'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feature Demo</h1>
          <p className="text-gray-600 mt-2">
            Demonstration of the new Property Viewing System, Offer Management, and Messaging Features
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Demo Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveDemo('overview')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                activeDemo === 'overview' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Home className="w-6 h-6 text-blue-600 mb-2" />
              <div className="font-medium">Overview</div>
              <div className="text-sm text-gray-600">System overview</div>
            </button>

            <button
              onClick={() => setShowOfferModal(true)}
              className="p-4 border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors"
            >
              <DollarSign className="w-6 h-6 text-green-600 mb-2" />
              <div className="font-medium">Make Offer Modal</div>
              <div className="text-sm text-gray-600">Property offer submission</div>
            </button>

            <button
              onClick={() => setShowViewingModal(true)}
              className="p-4 border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors"
            >
              <Calendar className="w-6 h-6 text-purple-600 mb-2" />
              <div className="font-medium">Book Viewing Modal</div>
              <div className="text-sm text-gray-600">Schedule property viewing</div>
            </button>

            <button
              onClick={() => setActiveDemo('offer-manager')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                activeDemo === 'offer-manager' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <DollarSign className="w-6 h-6 text-yellow-600 mb-2" />
              <div className="font-medium">Offer Manager</div>
              <div className="text-sm text-gray-600">Manage offers (seller view)</div>
            </button>

            <button
              onClick={() => setActiveDemo('viewing-manager')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                activeDemo === 'viewing-manager' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-6 h-6 text-orange-600 mb-2" />
              <div className="font-medium">Viewing Manager</div>
              <div className="text-sm text-gray-600">Manage viewings (seller view)</div>
            </button>

            <button
              onClick={() => window.location.href = '/messages'}
              className="p-4 border border-gray-200 rounded-lg text-left hover:border-gray-300 transition-colors"
            >
              <MessageCircle className="w-6 h-6 text-blue-600 mb-2" />
              <div className="font-medium">Messaging System</div>
              <div className="text-sm text-gray-600">Property-based messaging</div>
            </button>
          </div>
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeDemo === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">✅ Completed Features</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Property-centric messaging system
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Floating chat widget on property pages
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Make Offer modal with messaging integration
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Book Viewing modal with scheduling
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Offer Management dashboard (seller view)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Viewing Management dashboard (seller view)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Property Dashboard for sellers
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Buyer Dashboard for offer/viewing tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Navigation dropdown with dashboard links
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">🔄 Integration Points</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Backend API routes for conversations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Database schema for messaging
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Real-time message subscriptions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Property-specific conversation filtering
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Authentication integration
                    </li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How to Test</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Navigate to any property page to see the floating chat widget</li>
                  <li>Click the action buttons in the chat to open offer/viewing modals</li>
                  <li>Visit the Property Dashboard (sellers) or Buyer Dashboard to manage activities</li>
                  <li>Use the dropdown navigation to access different dashboard sections</li>
                  <li>Test the messaging system from the /messages page</li>
                </ol>
              </div>
            </div>
          )}

          {activeDemo === 'offer-manager' && (
            <OfferManager userRole="seller" />
          )}

          {activeDemo === 'viewing-manager' && (
            <ViewingManager userRole="seller" />
          )}
        </div>

        {/* Modals */}
        <MakeOfferModal
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          property={mockProperty}
          onOfferSubmitted={() => {
            setShowOfferModal(false);
            alert('Demo: Offer submitted successfully!');
          }}
        />

        <BookViewingModal
          isOpen={showViewingModal}
          onClose={() => setShowViewingModal(false)}
          property={mockProperty}
          onViewingBooked={() => {
            setShowViewingModal(false);
            alert('Demo: Viewing request sent successfully!');
          }}
        />
      </div>
    </div>
  );
}
