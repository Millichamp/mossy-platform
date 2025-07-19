import { BadgeVariant } from '../components/ui/Badge';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

export type ViewingRequestStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'rejected' 
  | 'cancelled' 
  | 'completed'
  | 'superseded';

export interface ViewingRequestData {
  id: string;
  status: ViewingRequestStatus;
  requested_date?: string;
  preferred_date?: string;
  preferred_time?: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface BadgeState {
  variant: BadgeVariant;
  text: string;
  icon: typeof Calendar;
  showDate?: boolean;
  dateValue?: string;
  isActionable?: boolean;
  actionType?: BadgeAction;
}

export type BadgeAction = 
  | 'request-viewing'
  | 're-request-viewing'  
  | 'approve-viewing'
  | 'decline-viewing'
  | 'cancel-viewing'
  | 'mark-completed';

/**
 * Smart date formatting for viewing requests
 */
export function formatViewingDate(dateString: string, timeString?: string): string {
  const viewingDate = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const viewingDateOnly = new Date(viewingDate.getFullYear(), viewingDate.getMonth(), viewingDate.getDate());
  
  // Format time if provided
  const timeDisplay = timeString ? ` ${timeString}` : '';
  
  if (viewingDateOnly.getTime() === today.getTime()) {
    return `Today${timeDisplay}`;
  } else if (viewingDateOnly.getTime() === tomorrow.getTime()) {
    return `Tomorrow${timeDisplay}`;
  } else if (viewingDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // Within a week - show day name
    return viewingDate.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }) + timeDisplay;
  } else {
    // Show full date
    return viewingDate.toLocaleDateString('en-GB', { 
      month: 'short', 
      day: 'numeric', 
      year: viewingDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    }) + timeDisplay;
  }
}

/**
 * Resolve badge state based on viewing request status and user role
 */
export function resolveViewingBadgeState(
  viewingRequest: ViewingRequestData | null,
  userRole: 'buyer' | 'seller'
): BadgeState {
  
  // Debug: Log input data
  console.log('resolveViewingBadgeState - viewingRequest:', viewingRequest);
  console.log('resolveViewingBadgeState - userRole:', userRole);
  
  // No viewing request exists
  if (!viewingRequest) {
    if (userRole === 'buyer') {
      return {
        variant: 'cta',
        text: 'Request Viewing',
        icon: Eye,
        isActionable: true,
        actionType: 'request-viewing'
      };
    } else {
      return {
        variant: 'neutral',
        text: 'No Viewing Requests',
        icon: Calendar,
        isActionable: false
      };
    }
  }

  const { status, preferred_date, preferred_time } = viewingRequest;

  // Handle each status based on user role
  switch (status) {
    case 'pending':
      if (userRole === 'buyer') {
        return {
          variant: 'warning',
          text: 'Viewing Request Sent',
          icon: Clock,
          showDate: true,
          dateValue: preferred_date ? formatViewingDate(preferred_date, preferred_time) : undefined,
          isActionable: false
        };
      } else {
        return {
          variant: 'warning',
          text: 'Viewing Request Pending',
          icon: AlertCircle,
          showDate: true,
          dateValue: preferred_date ? formatViewingDate(preferred_date, preferred_time) : undefined,
          isActionable: true,
          actionType: 'approve-viewing'
        };
      }

    case 'confirmed':
      const displayDate = preferred_date;
      const dateText = displayDate ? formatViewingDate(displayDate, preferred_time) : 'Date TBC';
      
      return {
        variant: 'success',
        text: `Viewing: ${dateText}`,
        icon: CheckCircle,
        showDate: false, // Date is in the text
        isActionable: false // Will add completion action later
      };

    case 'rejected':
      if (userRole === 'buyer') {
        return {
          variant: 'danger',
          text: 'Viewing Declined',
          icon: XCircle,
          isActionable: true,
          actionType: 're-request-viewing'
        };
      } else {
        return {
          variant: 'neutral',
          text: 'Viewing Declined',
          icon: XCircle,
          isActionable: false
        };
      }

    case 'cancelled':
      return {
        variant: 'neutral',
        text: 'Viewing Cancelled',
        icon: XCircle,
        isActionable: false
      };

    case 'completed':
      return {
        variant: 'neutral',
        text: 'Viewing Completed',
        icon: CheckCircle,
        isActionable: false
      };

    case 'superseded':
      return {
        variant: 'neutral',
        text: 'Request Superseded',
        icon: Clock,
        isActionable: false
      };

    default:
      return {
        variant: 'neutral',
        text: 'Unknown Status',
        icon: AlertCircle,
        isActionable: false
      };
  }
}
