'use client';

import React, { useState } from 'react';
import { messagingService } from '../../lib/messagingService';
import { useAuth } from '../../context/AuthContext';
import ChatWindow from './ChatWindow';

interface ContactSellerButtonProps {
  propertyId: string;
  propertyTitle: string;
  sellerId: string;
  className?: string;
}

const ContactSellerButton: React.FC<ContactSellerButtonProps> = ({ 
  propertyId, 
  propertyTitle, 
  sellerId,
  className = '' 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();

  const handleContactSeller = () => {
    if (!user) {
      alert('Please log in to contact the seller');
      return;
    }

    if (user.id === sellerId) {
      alert('You cannot contact yourself');
      return;
    }

    setMessage(`Hi! I'm interested in your property "${propertyTitle}". Could you provide more information?`);
    setShowModal(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    try {
      const response = await messagingService.startConversation(propertyId, message.trim());
      setConversationId(response.conversation.id);
      setShowModal(false);
      setShowChat(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setMessage('');
  };

  const closeChat = () => {
    setShowChat(false);
    setConversationId(null);
  };

  return (
    <>
      <button
        onClick={handleContactSeller}
        className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold ${className}`}
      >
        Contact Seller
      </button>

      {/* Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Contact Seller</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Property: <span className="font-medium">{propertyTitle}</span>
              </p>
            </div>

            <form onSubmit={handleSendMessage}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to the seller..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!message.trim() || loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {showChat && conversationId && (
        <ChatWindow
          conversationId={conversationId}
          onClose={closeChat}
        />
      )}
    </>
  );
};

export default ContactSellerButton;
