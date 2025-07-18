import React from "react";

interface PropertyListingStep6Props {
  data: any;
  onPublish: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export const PropertyListingStep6: React.FC<PropertyListingStep6Props> = ({ data, onPublish, onBack, isSubmitting = false }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review your listing</h2>
        <p className="text-gray-600">Double-check everything looks correct before publishing</p>
      </div>

      {/* Property Details Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm mr-2">1</span>
          Property Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Title</p>
            <p className="font-medium">{data.title || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Property Type</p>
            <p className="font-medium">{data.propertyType || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bedrooms</p>
            <p className="font-medium">{data.bedrooms || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Bathrooms</p>
            <p className="font-medium">{data.bathrooms || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Receptions</p>
            <p className="font-medium">{data.receptions || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium text-emerald-600">{data.price ? formatPrice(data.price) : 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Location Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm mr-2">2</span>
          Location & Address
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{data.line1 || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">City</p>
            <p className="font-medium">{data.city || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Postcode</p>
            <p className="font-medium">{data.postcode || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address Display</p>
            <p className="font-medium">{data.displayAddress ? 'Visible' : 'Hidden'}</p>
          </div>
        </div>
        {(data.lat && data.lng) && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Map Preview</p>
            <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-sm">📍 Location Preview</p>
                <p className="text-xs">Lat: {data.lat.toFixed(4)}, Lng: {data.lng.toFixed(4)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Specifications Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm mr-2">3</span>
          Specifications
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Square Feet</p>
            <p className="font-medium">{data.squareFeet ? `${data.squareFeet} sq ft` : 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tenure</p>
            <p className="font-medium">{data.tenure || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Council Tax Band</p>
            <p className="font-medium">{data.councilTaxBand || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">EPC Rating</p>
            <p className="font-medium">{data.epcRating || 'Not provided'}</p>
          </div>
          {data.tenure === 'leasehold' && (
            <>
              <div>
                <p className="text-sm text-gray-500">Leasehold Years</p>
                <p className="font-medium">{data.leaseholdYears || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ground Rent</p>
                <p className="font-medium">{data.groundRent ? `£${data.groundRent}` : 'Not provided'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Description & Features Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm mr-2">4</span>
          Description & Features
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium">{data.description || 'Not provided'}</p>
          </div>
          {data.keyFeatures && data.keyFeatures.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Key Features</p>
              <div className="flex flex-wrap gap-2">
                {data.keyFeatures.map((feature: string, index: number) => (
                  <span key={index} className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Reason for Sale</p>
              <p className="font-medium">{data.reasonForSale || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Timeline</p>
              <p className="font-medium">{data.completionTimeline || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Photos & Media Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm mr-2">5</span>
          Photos & Media
        </h3>
        {data.images && data.images.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {data.images.map((image: any, index: number) => (
                <div key={index} className="relative">
                  <img 
                    src={image.url} 
                    alt={image.caption || `Property photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  {image.isMain && (
                    <span className="absolute top-1 left-1 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                      Main
                    </span>
                  )}
                  {image.isFloorPlan && (
                    <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      Floor Plan
                    </span>
                  )}
                  {image.caption && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{image.caption}</p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">{data.images.length} images uploaded</p>
          </div>
        ) : (
          <p className="text-gray-500">No images uploaded</p>
        )}
        {data.virtualTourUrl && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Virtual Tour</p>
            <a href={data.virtualTourUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">
              {data.virtualTourUrl}
            </a>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-emerald-50 rounded-lg p-4 text-center">
        <p className="text-emerald-800 font-semibold">🎉 Your listing is ready to publish!</p>
        <p className="text-emerald-600 text-sm mt-1">
          Once published, your property will be visible to potential buyers
        </p>
      </div>
      <div className="flex justify-between mt-6">
        <button type="button" onClick={onBack} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition">Back</button>
        <button 
          type="button" 
          onClick={onPublish} 
          disabled={isSubmitting}
          className={`px-6 py-2 rounded font-semibold transition ${
            isSubmitting 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isSubmitting ? 'Publishing...' : 'Publish Listing'}
        </button>
      </div>
    </div>
  );
};
