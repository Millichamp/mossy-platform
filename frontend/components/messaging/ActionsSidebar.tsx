'use client';

import React from 'react';
import ViewingRequestCard from './ViewingRequestCard';
import OfferCard from './OfferCard';

interface ActionsSidebarProps {
  conversation: any;
  userRole: 'buyer' | 'seller';
  onViewingAction: (action: any) => void;
  onOfferAction: (action: any) => void;
}

const ActionsSidebar: React.FC<ActionsSidebarProps> = ({
  conversation,
  userRole,
  onViewingAction,
  onOfferAction
}) => {
  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 space-y-4 overflow-y-auto">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Actions</h3>
          <p className="text-sm text-gray-600 mb-4">
            Manage your viewing requests and offers for this property.
          </p>
        </div>

        {/* Viewing Request Card */}
        <ViewingRequestCard
          conversation={conversation}
          userRole={userRole}
          onAction={onViewingAction}
        />

        {/* Offer Card */}
        <OfferCard
          conversation={conversation}
          userRole={userRole}
          onAction={onOfferAction}
        />
      </div>
    </div>
  );
};

export default ActionsSidebar;
