import Image from 'next/image';
import Link from 'next/link';

interface PropertyCardProps {
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
}

export default function PropertyCard({
  id,
  title,
  price,
  bedrooms,
  bathrooms,
  location,
  imageUrl,
  isSaved = false,
  onToggleSave,
  saving = false
}: PropertyCardProps) {
  // Only use imageUrl if it's a valid, non-empty string and starts with http or /
  const validImageUrl =
    typeof imageUrl === 'string' && imageUrl.trim() &&
    (imageUrl.startsWith('http') || imageUrl.startsWith('/'))
      ? imageUrl
      : '/placeholder-property.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative">
      <Link href={`/property/${id}`} className="block group" tabIndex={-1} prefetch={false}>
        <div className="relative h-48 w-full">
          <Image
            src={validImageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          {onToggleSave && (
            <button
              className={`absolute top-2 right-2 z-10 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-colors ${saving ? 'opacity-50 cursor-wait' : ''}`}
              onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleSave(); }}
              disabled={saving}
              aria-label={isSaved ? 'Unsave property' : 'Save property'}
            >
              {saving ? (
                <svg className="w-6 h-6 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : isSaved ? (
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
              ) : (
                <svg className="w-6 h-6 text-gray-400 hover:text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
              )}
            </button>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-2xl font-bold text-green-600 mb-2">
            £{price.toLocaleString()}
          </p>
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <span className="mr-4">{bedrooms} bed</span>
            <span>{bathrooms} bath</span>
          </div>
          <div className="text-gray-500 text-xs">{location}</div>
        </div>
      </Link>
    </div>
  );
}