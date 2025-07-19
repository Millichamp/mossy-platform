'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { viewingRequestService, ViewingRequest } from '../../lib/viewingRequestService';

interface ViewingRequestCardProps {
  conversation: any;
  userRole: 'buyer' | 'seller';
  onAction: (action: any) => void;
}

const ViewingRequestCard: React.FC<ViewingRequestCardProps> = ({
  conversation,
  userRole,
  onAction
}) => {
  const [viewingRequest, setViewingRequest] = useState<ViewingRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingViewing, setIsRequestingViewing] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');

  // Load viewing request data on component mount
  useEffect(() => {
    const loadViewingRequest = async () => {
      if (!conversation?.id) return;
      
      setIsLoading(true);
      try {
        const request = await viewingRequestService.getViewingRequest(conversation.id);
        setViewingRequest(request);
      } catch (error) {
        console.error('Error loading viewing request:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadViewingRequest();

    // Subscribe to real-time updates
    const unsubscribe = viewingRequestService.subscribeToViewingRequest(
      conversation.id,
      (request) => {
        setViewingRequest(request);
      }
    );

    return unsubscribe;
  }, [conversation?.id]);

  const handleRequestViewing = async () => {
    if (!selectedDate || !selectedTime || !conversation?.id) return;
    
    setIsLoading(true);
    try {
      const requestData = {
        conversation_id: conversation.id,
        property_id: conversation.property_id,
        preferred_date: selectedDate,
        preferred_time: selectedTime,
        message: message.trim() || undefined
      };

      const newRequest = await viewingRequestService.createViewingRequest(requestData);
      setViewingRequest(newRequest);

      setIsRequestingViewing(false);
      setSelectedDate('');
      setSelectedTime('');
      setMessage('');
      
      // Check if this was an update or new request
      const actionType = viewingRequest ? 'update_viewing_request' : 'request_viewing';
      onAction({ type: actionType, data: newRequest });
      
      // Show success message
      if (viewingRequest) {
        alert('Your viewing request has been updated successfully!');
      }
    } catch (error) {
      console.error('Error creating viewing request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create viewing request. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellerResponse = async (action: 'accept' | 'reject') => {
    if (!viewingRequest?.id) return;

    setIsLoading(true);
    try {
      const status = action === 'accept' ? 'confirmed' : 'rejected';
      const updatedRequest = await viewingRequestService.updateViewingRequest(
        viewingRequest.id,
        { status }
      );
      
      setViewingRequest(updatedRequest);
      onAction({ type: 'seller_response', data: { action, request: updatedRequest } });
    } catch (error) {
      console.error('Error updating viewing request:', error);
      alert('Failed to update viewing request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!viewingRequest?.id) return;

    setIsLoading(true);
    try {
      await viewingRequestService.cancelViewingRequest(viewingRequest.id);
      setViewingRequest(null);
      onAction({ type: 'cancel_viewing', data: { id: viewingRequest.id } });
    } catch (error) {
      console.error('Error cancelling viewing request:', error);
      alert('Failed to cancel viewing request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Buyer Views
  if (userRole === 'buyer') {
    // Loading state
    if (isLoading && !viewingRequest) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Property Viewing</h4>
          </div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      );
    }

    // No request made yet
    if (!viewingRequest) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Property Viewing</h4>
          </div>
          
          {!isRequestingViewing ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Schedule a viewing to see this property in person.
              </p>
              <button
                onClick={() => setIsRequestingViewing(true)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : (viewingRequest ? 'Request New Viewing' : 'Request Viewing')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any specific requirements or questions..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleRequestViewing}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {viewingRequest ? 'Update Request' : 'Send Request'}
                </button>
                <button
                  onClick={() => setIsRequestingViewing(false)}
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

    // Request pending
    if (viewingRequest.status === 'pending') {
      return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <Clock className="w-5 h-5 text-amber-600 mr-2" />
            <h4 className="font-medium text-gray-900">Viewing Request Sent</h4>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Requested:</strong> {formatDateTime(`${viewingRequest.preferred_date}T${viewingRequest.preferred_time}`)}
            </p>
            {viewingRequest.message && (
              <p className="text-sm text-gray-700">
                <strong>Message:</strong> {viewingRequest.message}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-amber-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Awaiting seller response</span>
            </div>
            <button
              onClick={handleCancelRequest}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Cancel Request
            </button>
          </div>
        </div>
      );
    }

    // Request confirmed
    if (viewingRequest.status === 'confirmed') {
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Viewing Confirmed</h4>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Date & Time:</strong> {formatDateTime(`${viewingRequest.preferred_date}T${viewingRequest.preferred_time}`)}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Property:</strong> {
                typeof conversation.property?.address === 'string' 
                  ? conversation.property.address 
                  : (conversation.property?.address as any)?.displayAddress || 
                    (conversation.property?.address as any)?.line1 || 
                    'Address not available'
              }
            </p>
          </div>
          
          <div className="bg-green-100 rounded-md p-3">
            <p className="text-sm text-green-800">
              Your viewing has been confirmed! The seller will be in touch with any additional details.
            </p>
          </div>
        </div>
      );
    }

    // Request rejected
    if (viewingRequest.status === 'rejected') {
      return (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <h4 className="font-medium text-gray-900">Viewing Request Declined</h4>
          </div>
          
          <p className="text-sm text-gray-700 mb-4">
            Unfortunately, your viewing request was declined. You can try requesting a different time.
          </p>
          
          <button
            onClick={() => setViewingRequest(null)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Request Different Time
          </button>
        </div>
      );
    }
  }

  // Seller Views
  if (userRole === 'seller') {
    // Loading state
    if (isLoading && !viewingRequest) {
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <h4 className="font-medium text-gray-700">Viewing Requests</h4>
          </div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      );
    }

    // No requests yet
    if (!viewingRequest) {
      return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center mb-2">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <h4 className="font-medium text-gray-700">Viewing Requests</h4>
          </div>
          <p className="text-sm text-gray-600">
            No viewing requests yet. Buyers can request to view your property.
          </p>
        </div>
      );
    }

    // New request to respond to
    if (viewingRequest.status === 'pending') {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-gray-900">New Viewing Request</h4>
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Requested:</strong> {formatDateTime(`${viewingRequest.preferred_date}T${viewingRequest.preferred_time}`)}
            </p>
            {viewingRequest.message && (
              <p className="text-sm text-gray-700">
                <strong>Buyer message:</strong> {viewingRequest.message}
              </p>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleSellerResponse('accept')}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Accept
            </button>
            <button
              onClick={() => handleSellerResponse('reject')}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Decline
            </button>
          </div>
        </div>
      );
    }

    // Viewing confirmed
    if (viewingRequest.status === 'confirmed') {
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm p-4">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h4 className="font-medium text-gray-900">Viewing Confirmed</h4>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <strong>Date & Time:</strong> {formatDateTime(`${viewingRequest.preferred_date}T${viewingRequest.preferred_time}`)}
            </p>
            <div className="bg-green-100 rounded-md p-3">
              <p className="text-sm text-green-800">
                You've confirmed this viewing. Make sure to be available at the scheduled time.
              </p>
            </div>
          </div>
        </div>
      );
    }
  }

  return null;
};

export default ViewingRequestCard;
