import React from 'react';
import Badge from '../ui/Badge';
import { resolveViewingBadgeState, ViewingRequestData, BadgeAction } from '../../utils/badgeStateResolver';

export interface ViewingRequestBadgeProps {
  viewingRequest?: ViewingRequestData | null;
  userRole: 'buyer' | 'seller';
  conversationId: string;
  onAction?: (action: BadgeAction, data?: any) => void;
  className?: string;
}

const ViewingRequestBadge: React.FC<ViewingRequestBadgeProps> = ({
  viewingRequest = null,
  userRole,
  conversationId,
  onAction,
  className = ''
}) => {
  const badgeState = resolveViewingBadgeState(viewingRequest, userRole);

  const handleClick = () => {
    if (badgeState.isActionable && badgeState.actionType && onAction) {
      onAction(badgeState.actionType, {
        conversationId,
        viewingRequest,
        userRole
      });
    }
  };

  return (
    <Badge
      variant={badgeState.variant}
      size="sm"
      icon={badgeState.icon}
      onClick={badgeState.isActionable ? handleClick : undefined}
      className={className}
    >
      {badgeState.text}
    </Badge>
  );
};

export default ViewingRequestBadge;
