"use client";

import { useState } from "react";
import { X, MessageCircle, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { messagingService } from "../lib/messagingService";

interface MakeOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    title: string;
    price: number;
    address: { displayAddress: string };
    seller_id: string;
  };
  onOfferSubmitted?: () => void;
}

export default function MakeOfferModal({ 
  isOpen, 
  onClose, 
  property, 
  onOfferSubmitted 
}: MakeOfferModalProps) {
  const { user } = useAuth();
  const [offerAmount, setOfferAmount] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [chainFree, setChainFree] = useState(false);
  const [hasDeposit, setHasDeposit] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !offerAmount) return;

    setLoading(true);
    try {
      // Create the offer message
      const offerMessage = `🏠 **OFFER SUBMITTED**

**Property:** ${property.title}
**Address:** ${property.address.displayAddress}
**Asking Price:** £${property.price.toLocaleString()}
**My Offer:** £${parseInt(offerAmount).toLocaleString()}

**Details:**
• Preferred Move-in Date: ${moveInDate || 'Flexible'}
• Chain Free: ${chainFree ? 'Yes' : 'No'}
• Deposit Available: ${hasDeposit ? 'Yes' : 'No'}

${additionalNotes ? `**Additional Notes:**\n${additionalNotes}` : ''}

I'm interested in proceeding with this offer. Please let me know if you'd like to discuss further.`;

      // Use the messaging service to start conversation with the offer message
      await messagingService.startConversation(property.id, offerMessage);

      setStep('success');
      onOfferSubmitted?.();
    } catch (error) {
      console.error('Error submitting offer:', error);
      alert('Failed to submit offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString();
  };

  const handleOfferAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setOfferAmount(formatted);
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Offer Submitted Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              Your offer has been sent to the seller. They'll receive a notification and can respond through the messaging system.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900">{property.title}</h3>
            <p className="text-gray-600">{property.address.displayAddress}</p>
            <p className="text-xl font-bold text-blue-600 mt-2">
              £{property.price.toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Your Offer Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="text"
                  value={offerAmount}
                  onChange={handleOfferAmountChange}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your offer amount"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Asking price: £{property.price.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Preferred Move-in Date
              </label>
              <input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="chainFree"
                  checked={chainFree}
                  onChange={(e) => setChainFree(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="chainFree" className="ml-3 text-sm text-gray-700">
                  I am chain-free (no property to sell)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasDeposit"
                  checked={hasDeposit}
                  onChange={(e) => setHasDeposit(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasDeposit" className="ml-3 text-sm text-gray-700">
                  I have my deposit ready
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional information you'd like to share with the seller..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your offer will be sent as a message to the seller. 
                They can respond and negotiate through the messaging system.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !offerAmount}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Submitting...' : 'Submit Offer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
