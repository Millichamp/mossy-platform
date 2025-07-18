'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CongratulationsModalProps {
  isOpen: boolean;
  listingId: string;
  propertyTitle: string;
  onClose: () => void;
}

export const CongratulationsModal: React.FC<CongratulationsModalProps> = ({
  isOpen,
  listingId,
  propertyTitle,
  onClose,
}) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleViewListing();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleViewListing = () => {
    onClose();
    router.push(`/property/${listingId}?created=true`);
  };

  const handleCreateAnother = () => {
    onClose();
    router.push('/sell');
  };

  const handleGoToDashboard = () => {
    onClose();
    router.push('/dashboard');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
        {/* Success Icon */}
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Congratulations! 🎉
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-4">
          Your property listing <strong>&quot;{propertyTitle}&quot;</strong> has been successfully published!
        </p>

        {/* Auto-redirect notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800">
            Automatically redirecting to your listing in{' '}
            <span className="font-semibold">{countdown}</span> seconds...
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewListing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            View My Listing
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={handleCreateAnother}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              Create Another
            </button>
            
            <button
              onClick={handleGoToDashboard}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Your listing is now live and can be viewed by potential buyers.
            You can manage it from your dashboard at any time.
          </p>
        </div>
      </div>
    </div>
  );
};
