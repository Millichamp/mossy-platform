"use client";

import { useState, useEffect } from "react";
import { DollarSign, Calendar, User, MessageCircle, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Offer {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyAskingPrice: number;
  buyerName: string;
  buyerEmail: string;
  offerAmount: number;
  moveInDate?: string;
  chainFree: boolean;
  hasDeposit: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';
  notes?: string;
  createdAt: string;
  counterOffer?: {
    amount: number;
    notes: string;
    createdAt: string;
  };
}

interface OfferManagerProps {
  propertyId?: string; // If provided, shows offers for specific property
  userRole: 'buyer' | 'seller';
}

export default function OfferManager({ propertyId, userRole }: OfferManagerProps) {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [showCounterModal, setShowCounterModal] = useState<string | null>(null);
  const [counterAmount, setCounterAmount] = useState("");
  const [counterNotes, setCounterNotes] = useState("");

  useEffect(() => {
    if (user) {
      loadOffers();
    }
  }, [user, propertyId, filter]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockOffers: Offer[] = [
        {
          id: '1',
          propertyId: propertyId || 'prop1',
          propertyTitle: '4 Bed Victorian House',
          propertyAddress: '123 Garden Street, London SW1A 1AA',
          propertyAskingPrice: 850000,
          buyerName: 'John Smith',
          buyerEmail: 'john.smith@email.com',
          offerAmount: 820000,
          moveInDate: '2024-09-01',
          chainFree: true,
          hasDeposit: true,
          status: 'pending',
          notes: 'Very interested in the property. Happy to move quickly.',
          createdAt: '2024-07-18T10:00:00Z'
        },
        {
          id: '2',
          propertyId: propertyId || 'prop1',
          propertyTitle: '4 Bed Victorian House',
          propertyAddress: '123 Garden Street, London SW1A 1AA',
          propertyAskingPrice: 850000,
          buyerName: 'Sarah Johnson',
          buyerEmail: 'sarah.j@email.com',
          offerAmount: 800000,
          chainFree: false,
          hasDeposit: true,
          status: 'countered',
          notes: 'First time buyer, very motivated.',
          createdAt: '2024-07-17T15:30:00Z',
          counterOffer: {
            amount: 825000,
            notes: 'Willing to accept £825,000 for a quick completion.',
            createdAt: '2024-07-18T09:00:00Z'
          }
        }
      ];

      const filtered = filter === 'all' ? mockOffers : mockOffers.filter(o => o.status === filter);
      setOffers(filtered);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOfferStatus = async (offerId: string, status: 'accepted' | 'rejected') => {
    try {
      // API call would go here
      setOffers(prev => prev.map(offer => 
        offer.id === offerId ? { ...offer, status } : offer
      ));
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  const submitCounterOffer = async (offerId: string) => {
    if (!counterAmount) return;

    try {
      const counterOffer = {
        amount: parseInt(counterAmount.replace(/[^0-9]/g, '')),
        notes: counterNotes,
        createdAt: new Date().toISOString()
      };

      setOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status: 'countered' as const, counterOffer }
          : offer
      ));

      setShowCounterModal(null);
      setCounterAmount("");
      setCounterNotes("");
    } catch (error) {
      console.error('Error submitting counter offer:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getOfferPercentage = (offerAmount: number, askingPrice: number) => {
    const percentage = (offerAmount / askingPrice) * 100;
    return percentage.toFixed(1);
  };

  const getStatusBadge = (status: Offer['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      countered: 'bg-blue-100 text-blue-800 border-blue-200',
      withdrawn: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      countered: <TrendingUp className="w-4 h-4" />,
      withdrawn: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrencyInput = (value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {userRole === 'seller' ? 'Offers Received' : 'My Offers'}
        </h2>
        
        <div className="flex gap-2">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No offers submitted yet.'
              : `No ${filter} offers found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map(offer => (
            <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{offer.propertyTitle}</h3>
                  <p className="text-gray-600">{offer.propertyAddress}</p>
                </div>
                {getStatusBadge(offer.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Asking Price</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(offer.propertyAskingPrice)}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Offer Amount</div>
                  <div className="text-xl font-bold text-blue-900">
                    {formatCurrency(offer.offerAmount)}
                  </div>
                  <div className="text-sm text-blue-600">
                    {getOfferPercentage(offer.offerAmount, offer.propertyAskingPrice)}% of asking
                  </div>
                </div>

                {offer.counterOffer && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-600 mb-1">Counter Offer</div>
                    <div className="text-xl font-bold text-orange-900">
                      {formatCurrency(offer.counterOffer.amount)}
                    </div>
                    <div className="text-sm text-orange-600">
                      {getOfferPercentage(offer.counterOffer.amount, offer.propertyAskingPrice)}% of asking
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <div>
                    <div className="font-medium">Buyer</div>
                    <div>{offer.buyerName}</div>
                  </div>
                </div>

                {offer.moveInDate && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <div>
                      <div className="font-medium">Move-in Date</div>
                      <div>{new Date(offer.moveInDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className={`w-4 h-4 mr-2 ${offer.chainFree ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={offer.chainFree ? 'text-green-600' : 'text-gray-500'}>
                      {offer.chainFree ? 'Chain Free' : 'In Chain'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <CheckCircle className={`w-4 h-4 mr-2 ${offer.hasDeposit ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={offer.hasDeposit ? 'text-green-600' : 'text-gray-500'}>
                      {offer.hasDeposit ? 'Deposit Ready' : 'No Deposit'}
                    </span>
                  </div>
                </div>
              </div>

              {offer.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{offer.notes}</p>
                </div>
              )}

              {offer.counterOffer && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="font-medium text-orange-900 mb-1">Counter Offer Note:</div>
                  <p className="text-sm text-orange-800">{offer.counterOffer.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Submitted {new Date(offer.createdAt).toLocaleDateString()}
                </div>

                {userRole === 'seller' && offer.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCounterModal(offer.id)}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Counter Offer
                    </button>
                    <button
                      onClick={() => updateOfferStatus(offer.id, 'accepted')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateOfferStatus(offer.id, 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter Offer Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Make Counter Offer</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Counter Offer Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <input
                    type="text"
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(formatCurrencyInput(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter counter offer amount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note to Buyer (Optional)
                </label>
                <textarea
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Explain your counter offer..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCounterModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => submitCounterOffer(showCounterModal)}
                disabled={!counterAmount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Send Counter Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
