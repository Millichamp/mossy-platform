'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { offerService, Offer } from '../../lib/offerService';

interface OfferCardProps {
  conversation: any;
  userRole: 'buyer' | 'seller';
  onAction: (action: any) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({
  conversation,
  userRole,
  onAction
}) => {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMakingOffer, setIsMakingOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  
  // Seller response hooks (always initialized)
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [isCountering, setIsCountering] = useState(false);

  const propertyPrice = conversation?.property?.price || 0;

  // Load offer data on component mount
  useEffect(() => {
    const loadOffer = async () => {
      if (!conversation?.id) return;
      
      setIsLoading(true);
      try {
        const currentOffer = await offerService.getOffer(conversation.id);
        setOffer(currentOffer);
      } catch (error) {
        console.error('Error loading offer:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOffer();

    // Subscribe to real-time updates
    const unsubscribe = offerService.subscribeToOffer(
      conversation.id,
      (currentOffer) => {
        setOffer(currentOffer);
      }
    );

    return unsubscribe;
  }, [conversation?.id]);

  const handleMakeOffer = async () => {
    const amount = parseFloat(offerAmount);
    if (!amount || amount <= 0 || !conversation?.id) return;
    
    setIsLoading(true);
    try {
      const offerData = {
        conversation_id: conversation.id,
        property_id: conversation.property_id,
        amount,
        message: message.trim() || undefined
      };

      const newOffer = await offerService.createOffer(offerData);
      setOffer(newOffer);

      setIsMakingOffer(false);
      setOfferAmount('');
      setMessage('');
      
      onAction({ type: 'make_offer', data: newOffer });
    } catch (error) {
      console.error('Error creating offer:', error);
      alert('Failed to create offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellerResponse = async (action: 'accept' | 'reject', counterOffer?: number) => {
    if (!offer?.id) return;

    setIsLoading(true);
    try {
      const status = action === 'accept' ? 'accepted' : 
                   counterOffer ? 'countered' : 'rejected';
      
      const updatedOffer = await offerService.updateOffer(offer.id, {
        status,
        counter_amount: counterOffer
      });
      
      setOffer(updatedOffer);
      onAction({ type: 'seller_response', data: { action, offer: updatedOffer } });
    } catch (error) {
      console.error('Error updating offer:', error);
      alert('Failed to update offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawOffer = async () => {
    if (!offer?.id) return;

    setIsLoading(true);
    try {
      await offerService.withdrawOffer(offer.id);
      setOffer(null);
      onAction({ type: 'withdraw_offer', data: { id: offer.id } });
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      alert('Failed to withdraw offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptCounterOffer = async () => {
    if (!offer?.counter_amount) return;

    setIsLoading(true);
    try {
      // Create new offer with counter amount
      const newOffer = await offerService.createOffer({
        conversation_id: conversation.id,
        property_id: conversation.property?.id,
        amount: offer.counter_amount,
        message: `Accepting your counter offer of ${formatCurrency(offer.counter_amount)}`
      });
      
      setOffer(newOffer);
      onAction({ type: 'accept_counter_offer', data: newOffer });
    } catch (error) {
      console.error('Error accepting counter offer:', error);
      alert('Failed to accept counter offer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return offerService.formatCurrency(amount);
  };

  const getOfferPercentage = (offerAmount: number, askingPrice: number) => {
    if (!askingPrice) return 0;
    return Math.round((offerAmount / askingPrice) * 100);
  };

  // Buyer Views
  if (userRole === 'buyer') {
    // Loading state
    if (isLoading && !offer) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Make an Offer</h4>
          </div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      );
    }

    // No offer made yet
    if (!offer) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <DollarSign className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Make an Offer</h4>
          </div>
          
          {!isMakingOffer ? (
            <div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600 mb-1">Asking Price</p>
                <p className="text-xl font-semibold text-gray-900">
                  {offerService.formatCurrency(propertyPrice)}
                </p>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Submit an offer to purchase this property.
              </p>
              
              <button
                onClick={() => setIsMakingOffer(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Make an Offer
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">Asking Price</p>
                <p className="text-lg font-semibold text-gray-900">
                  {offerService.formatCurrency(propertyPrice)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Offer Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">£</span>
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    placeholder="Enter offer amount"
                    className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                {offerAmount && (
                  <p className="text-xs text-gray-600 mt-1">
                    {getOfferPercentage(parseFloat(offerAmount), propertyPrice)}% of asking price
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your offer or add conditions..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleMakeOffer}
                  disabled={!offerAmount || parseFloat(offerAmount) <= 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Offer
                </button>
                <button
                  onClick={() => setIsMakingOffer(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Offer pending
    if (offer && offer.status === 'pending') {
      return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <TrendingUp className="w-5 h-5 text-amber-600 mr-2" />
            <h4 className="font-medium text-gray-900">Offer Submitted</h4>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Your Offer:</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(offer.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Asking Price:</span>
              <span className="text-sm text-gray-700">
                {formatCurrency(propertyPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Percentage:</span>
              <span className="text-sm font-medium text-amber-600">
                {getOfferPercentage(offer.amount, propertyPrice)}%
              </span>
            </div>
            {offer.message && (
              <div className="bg-white rounded-md p-2">
                <p className="text-sm text-gray-700">
                  <strong>Your message:</strong> {offer.message}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-amber-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Awaiting seller response</span>
            </div>
            <button
              onClick={handleWithdrawOffer}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Withdraw Offer
            </button>
          </div>
        </div>
      );
    }

    // Offer accepted
    if (offer && offer.status === 'accepted') {
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Offer Accepted! 🎉</h4>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Accepted Offer:</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(offer.amount)}
              </span>
            </div>
          </div>
          
          <div className="bg-green-100 rounded-md p-3">
            <p className="text-sm text-green-800 font-medium mb-2">
              Congratulations! Your offer has been accepted.
            </p>
            <p className="text-sm text-green-700">
              The seller will be in touch with next steps for the purchase process.
            </p>
          </div>
        </div>
      );
    }

    // Offer countered by seller
    if (offer && offer.status === 'countered') {
      return (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
            <h4 className="font-medium text-gray-900">Counter Offer Received! 💰</h4>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Your Original Offer:</span>
              <span className="text-lg font-medium text-gray-700 line-through">
                {formatCurrency(offer.amount)}
              </span>
            </div>
            <div className="bg-amber-100 rounded-md p-3">
              <p className="text-sm text-amber-800 font-medium mb-1">
                🎯 Seller's Counter Offer:
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(offer.counter_amount!)}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                The seller is interested but would prefer this amount
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleAcceptCounterOffer}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : `✅ Accept ${formatCurrency(offer.counter_amount!)}`}
            </button>
            <button
              onClick={() => {
                setOffer(null);
                setIsMakingOffer(true);
              }}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Make Counter Offer
            </button>
          </div>
        </div>
      );
    }

    // Offer rejected
    if (offer && offer.status === 'rejected') {
      return (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <h4 className="font-medium text-gray-900">Offer Declined</h4>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Your Offer:</span>
              <span className="text-lg font-medium text-gray-700">
                {formatCurrency(offer.amount)}
              </span>
            </div>
            {offer.counter_amount && (
              <div className="bg-blue-50 rounded-md p-3">
                <p className="text-sm text-blue-800 font-medium mb-1">
                  Counter Offer Suggested:
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(offer.counter_amount)}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {offer.counter_amount && (
              <button
                onClick={handleAcceptCounterOffer}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : `Accept ${formatCurrency(offer.counter_amount)}`}
              </button>
            )}
            <button
              onClick={() => {
                setOffer(null);
                setIsMakingOffer(true);
              }}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {offer.counter_amount ? 'Counter Again' : 'Make New Offer'}
            </button>
          </div>
        </div>
      );
    }
  }

  // Seller Views
  if (userRole === 'seller') {
    // Loading state
    if (isLoading && !offer) {
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
            <h4 className="font-medium text-gray-700">Offers</h4>
          </div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      );
    }

    // No offers yet
    if (!offer) {
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
            <h4 className="font-medium text-gray-700">Offers</h4>
          </div>
          <div className="text-center py-2">
            <p className="text-sm text-gray-600 mb-1">No offers yet</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(propertyPrice)}
            </p>
            <p className="text-xs text-gray-500">Asking price</p>
          </div>
        </div>
      );
    }

    // New offer to respond to
    if (offer && offer.status === 'pending') {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-gray-900">New Offer Received</h4>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Buyer's Offer:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(offer.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Your Asking Price:</span>
              <span className="text-sm text-gray-700">
                {formatCurrency(propertyPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Offer Percentage:</span>
              <span className={`text-sm font-medium ${
                getOfferPercentage(offer.amount, propertyPrice) >= 90 
                  ? 'text-green-600' 
                  : getOfferPercentage(offer.amount, propertyPrice) >= 80 
                  ? 'text-amber-600' 
                  : 'text-red-600'
              }`}>
                {getOfferPercentage(offer.amount, propertyPrice)}%
              </span>
            </div>
            {offer.message && (
              <div className="bg-white rounded-md p-2">
                <p className="text-sm text-gray-700">
                  <strong>Buyer message:</strong> {offer.message}
                </p>
              </div>
            )}
          </div>
          
          {!isCountering ? (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSellerResponse('accept')}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Accept Offer
                </button>
                <button
                  onClick={() => setIsCountering(true)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Counter Offer
                </button>
              </div>
              <button
                onClick={() => handleSellerResponse('reject')}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Decline Offer
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Counter Offer Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">£</span>
                  <input
                    type="number"
                    value={counterOfferAmount}
                    onChange={(e) => setCounterOfferAmount(e.target.value)}
                    placeholder="Enter counter offer"
                    className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const amount = parseFloat(counterOfferAmount);
                    if (amount > 0) {
                      handleSellerResponse('reject', amount);
                    }
                  }}
                  disabled={!counterOfferAmount || parseFloat(counterOfferAmount) <= 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  Send Counter
                </button>
                <button
                  onClick={() => setIsCountering(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Counter offer sent - waiting for buyer response
    if (offer && offer.status === 'countered') {
      return (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
            <h4 className="font-medium text-gray-900">Counter Offer Sent</h4>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Original Offer:</span>
              <span className="text-lg font-medium text-gray-700 line-through">
                {formatCurrency(offer.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Your Counter Offer:</span>
              <span className="text-2xl font-bold text-amber-600">
                {formatCurrency(offer.counter_amount!)}
              </span>
            </div>
          </div>
          
          <div className="bg-amber-100 rounded-md p-3">
            <p className="text-sm text-amber-800">
              🕐 <strong>Waiting for buyer response...</strong>
            </p>
            <p className="text-xs text-amber-700 mt-1">
              The buyer is considering your counter offer of {formatCurrency(offer.counter_amount!)}. 
              They can accept it, make a new counter offer, or withdraw their interest.
            </p>
          </div>
        </div>
      );
    }

    // Offer accepted
    if (offer && offer.status === 'accepted') {
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Offer Accepted</h4>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sale Price:</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(offer.amount)}
              </span>
            </div>
          </div>
          
          <div className="bg-green-100 rounded-md p-3">
            <p className="text-sm text-green-800">
              You've accepted this offer. The buyer will proceed with the purchase process.
            </p>
          </div>
        </div>
      );
    }
  }

  return null;
};

export default OfferCard;
