import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Heart } from 'lucide-react';

interface SavedPropertyCardProps {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  imageUrl: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
  saving?: boolean;
  hasUnreadMessages?: boolean;
  unreadCount?: number;
  conversationId?: string;
  onMessageClick?: () => void;
}

export default function SavedPropertyCard({
  id,
  title,
  price,
  bedrooms,
  bathrooms,
  location,
  imageUrl,
  isSaved = false,
  onToggleSave,
  saving = false,
  hasUnreadMessages = false,
  unreadCount = 0,
  conversationId,
  onMessageClick
}: SavedPropertyCardProps) {
  // Only use imageUrl if it's a valid, non-empty string and starts with http or /
  const validImageUrl =
    typeof imageUrl === 'string' && imageUrl.trim() &&
    (imageUrl.startsWith('http') || imageUrl.startsWith('/'))
      ? imageUrl
      : '/placeholder-property.jpg';

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onMessageClick) {
      onMessageClick();
    } else if (conversationId) {
      window.location.href = `/conversation/${conversationId}`;
    } else {
      // If no conversation exists yet, we could create one or show a modal
      console.log('No conversation exists for this property yet');
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleSave) {
      onToggleSave();
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:from-white hover:to-gray-100 transition-all duration-300 relative group border border-gray-200">
      <Link href={`/property/${id}`} className="block" tabIndex={-1} prefetch={false}>
        <div className="relative h-48 w-full">
          <Image
            src={validImageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex space-x-2">
            {/* Message button */}
            <button
              onClick={handleMessageClick}
              className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                hasUnreadMessages 
                  ? 'bg-green-600 text-white shadow-lg' 
                  : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
              title={hasUnreadMessages ? `${unreadCount} unread messages` : 'Send message'}
            >
              <div className="relative">
                <MessageCircle className="w-4 h-4" />
                {hasUnreadMessages && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </button>

            {/* Save button */}
            {onToggleSave && (
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
                  isSaved
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/90 text-gray-700 hover:bg-white'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save property'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/property/${id}`} className="block hover:text-green-600 transition-colors">
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
            {title}
          </h3>
        </Link>
        
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold text-xl mb-2">
          £{price.toLocaleString()}
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-1">{location}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" />
            </svg>
            {bedrooms} beds
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
            </svg>
            {bathrooms} baths
          </span>
        </div>

        {/* Message status indicator */}
        {hasUnreadMessages && (
          <div className="mt-3 flex items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <MessageCircle className="w-4 h-4 mr-2" />
            <span className="font-medium">
              {unreadCount === 1 ? '1 new message' : `${unreadCount} new messages`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
