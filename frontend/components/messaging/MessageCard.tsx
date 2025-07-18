'use client';

import React from 'react';
import Link from 'next/link';

interface MessageCardProps {
  conversation: any;
  userRole: 'buyer' | 'seller';
  otherUserName?: string;
}

export default function MessageCard({ conversation, userRole, otherUserName }: MessageCardProps) {
  const { property } = conversation;
  const unreadCount = userRole === 'buyer' ? conversation.buyer_unread_count : conversation.seller_unread_count;
  
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

  return (
    <Link 
      href={`/conversation/${conversation.id}`}
      className="block bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:from-white hover:to-gray-100 transition-all duration-200"
    >
      <div className="p-4">
        {/* Property Title */}
        <div className="mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {property.title}
          </h3>
          <p className="text-sm text-gray-600">
            {typeof property.address === 'string' 
              ? property.address 
              : property.address?.displayAddress || property.address?.line1 || 'Address not available'
            } • ${property.price?.toLocaleString()}
          </p>
        </div>

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
    </Link>
  );
}
