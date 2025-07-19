'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  User, 
  MessageCircle, 
  MapPin, 
  Home,
  Bath,
  Car,
  Bed
} from 'lucide-react';
import ViewingRequestBadge from '../badges/ViewingRequestBadge';
import { BadgeAction } from '../../utils/badgeStateResolver';

interface MessageCardProps {
  conversation: any;
  userRole: 'buyer' | 'seller';
  otherUserName?: string;
}

export default function MessageCard({ conversation, userRole, otherUserName }: MessageCardProps) {
  const { property, viewing_requests } = conversation;
  const unreadCount = userRole === 'buyer' ? conversation.buyer_unread_count : conversation.seller_unread_count;

  // Get the latest viewing request from the array
  const latest_viewing_request = viewing_requests && viewing_requests.length > 0 
    ? viewing_requests.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : null;

  // Debug: Log viewing request data
  console.log('MessageCard - Conversation ID:', conversation.id);
  console.log('MessageCard - All viewing requests:', viewing_requests);
  console.log('MessageCard - Latest viewing request:', latest_viewing_request);
  console.log('MessageCard - User role:', userRole);

  // Handle viewing request actions
  const handleViewingAction = (action: BadgeAction, data?: any) => {
    console.log('Viewing action:', action, data);
    // TODO: Implement viewing request actions
    // This will trigger modals/flows for:
    // - request-viewing: Open viewing request modal
    // - re-request-viewing: Open re-request modal  
    // - approve-viewing: Open approval modal
    // - decline-viewing: Decline with message
    // - cancel-viewing: Cancel confirmation
    // - mark-completed: Mark as completed
  };
  
  // Format the last message timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get the other user ID and role description
  const getOtherUserInfo = () => {
    if (userRole === 'buyer') {
      return {
        userId: conversation.seller_id,
        roleLabel: 'Property Owner'
      };
    } else {
      return {
        userId: conversation.buyer_id,
        roleLabel: 'Interested Buyer'
      };
    }
  };

  const otherUser = getOtherUserInfo();

  // Get property image URL with proper fallback handling
  const getPropertyImageUrl = () => {
    // Check if property has images array and it's not empty
    if (property?.images) {
      let images = property.images;
      
      // If images is a JSON string, parse it
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch (e) {
          console.warn('Failed to parse images JSON:', e);
          return '/placeholder-property.jpg';
        }
      }
      
      // Check if we have a valid array with images
      if (Array.isArray(images) && images.length > 0) {
        const firstImage = images[0];
        
        // Handle object format: {url: "...", caption: "..."}
        if (typeof firstImage === 'object' && firstImage.url) {
          return firstImage.url;
        }
        
        // Handle direct URL string format
        if (typeof firstImage === 'string' && firstImage.trim()) {
          return firstImage;
        }
      }
    }
    
    // Check if property has a single image URL property
    if (property?.imageUrl && typeof property.imageUrl === 'string' && property.imageUrl.trim()) {
      return property.imageUrl;
    }
    
    // Return placeholder as fallback
    return '/placeholder-property.jpg';
  };

  return (
    <Link 
      href={`/conversation/${conversation.id}`}
      className="block bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:from-white hover:to-gray-100 transition-all duration-200"
    >
      <div className="p-4">
        <div className="flex gap-4">
          {/* Property Thumbnail */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-gray-100">
              {getPropertyImageUrl() !== '/placeholder-property.jpg' ? (
                <Image
                  src={getPropertyImageUrl()}
                  alt={property?.title || 'Property'}
                  fill
                  className="object-cover"
                  onError={() => {
                    console.warn('Image failed to load');
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Home className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {property ? (
              <>
                {/* Header with Property Title and Viewing Status */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-lg font-bold text-green-700 mt-1">
                      £{property.price?.toLocaleString('en-GB')}
                    </p>
                  </div>
                  
                  {/* Viewing Request Badge */}
                  <ViewingRequestBadge
                    viewingRequest={latest_viewing_request}
                    userRole={userRole}
                    conversationId={conversation.id}
                    onAction={handleViewingAction}
                    className="ml-2 flex-shrink-0"
                  />
                </div>

                {/* Property Details */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  {property.bedrooms && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
                    </span>
                  )}
                  {property.bathrooms && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
                    </span>
                  )}
                  {property.property_type && (
                    <span className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {property.property_type}
                    </span>
                  )}
                  {property.receptions && (
                    <span className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      {property.receptions} reception{property.receptions !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {typeof property.address === 'string' 
                      ? property.address 
                      : property.address?.displayAddress || property.address?.line1 || 'Address not available'
                    }
                  </span>
                </div>
              </>
            ) : (
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Conversation
                </h3>
              </div>
            )}

            {/* Other User Info */}
            <div className="mb-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">
                  {otherUserName || `User ${otherUser.userId.slice(0, 8)}...`}
                </span>
                <span className="text-gray-500 ml-1">({otherUser.roleLabel})</span>
              </p>
            </div>

            {/* Last Message Preview */}
            {conversation.last_message_preview && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {conversation.last_message_preview}
                </p>
              </div>
            )}

            {/* Footer with timestamp and unread count */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {formatTimestamp(conversation.last_message_at || conversation.created_at)}
              </span>
              
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
