import React, { useState, useEffect } from "react";
import { Heart, Share2, MapPin, Camera, X, ChevronLeft, ChevronRight, Home } from "lucide-react";
import EditableField from "./EditableField";

interface PropertyHeroProps {
  title: string;
  price: number;
  location: string;
  imageUrls: string[];
  floorPlanUrl?: string;
  canEdit: boolean;
  onSave: (field: string, value: any) => Promise<void>;
}

const PropertyHero: React.FC<PropertyHeroProps> = ({
  title,
  price,
  location,
  imageUrls,
  floorPlanUrl,
  canEdit,
  onSave
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showFloorPlan, setShowFloorPlan] = useState(false);

  // Combine images and floor plan for gallery
  const allImages = [
    ...imageUrls,
    ...(floorPlanUrl ? [{ url: floorPlanUrl, isFloorPlan: true }] : [])
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const currentImage = allImages[selectedImageIndex];
  const isCurrentFloorPlan = typeof currentImage === 'object' && currentImage.isFloorPlan;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isGalleryOpen) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextImage();
          break;
        case 'Escape':
          event.preventDefault();
          closeGallery();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isGalleryOpen]);

  // Prevent body scroll when gallery is open
  useEffect(() => {
    if (isGalleryOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isGalleryOpen]);

  return (
    <div className="relative">
      {/* Image Gallery */}
      <div className="relative h-96 lg:h-[500px] bg-gray-200 overflow-hidden">
        {imageUrls && imageUrls.length > 0 ? (
          <div className="flex h-full gap-2 p-2">
            {/* Main Image - Fixed on Left */}
            <div className="flex-[0_0_100%] lg:flex-[0_0_70%] relative">
              <img
                src={imageUrls[0]}
                alt={title}
                className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => openGallery(0)}
              />
              {/* Image counter overlay */}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                1 / {allImages.length}
              </div>
              {/* Floor Plan indicator on mobile/tablet */}
              {floorPlanUrl && (
                <>
                  {/* Small mobile - just indicator */}
                  <div className="absolute top-4 left-4 md:hidden">
                    <div className="bg-blue-600 bg-opacity-95 text-white px-3 py-1 rounded-full text-xs flex items-center">
                      <Home className="w-3 h-3 mr-1" />
                      Floor Plan Available
                    </div>
                  </div>
                  
                  {/* Medium screens (tablets) - clickable button to floor plan */}
                  <div className="absolute top-4 left-4 hidden md:block lg:hidden">
                    <button
                      onClick={() => {
                        const floorPlanIndex = allImages.findIndex(img => 
                          typeof img === 'object' && img.isFloorPlan
                        );
                        openGallery(floorPlanIndex >= 0 ? floorPlanIndex : allImages.length - 1);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center shadow-lg transition-colors"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      View Floor Plan
                    </button>
                  </div>
                </>
              )}
              {/* View Gallery button on mobile/tablet */}
              <div className="absolute bottom-4 right-4 lg:hidden">
                <button
                  onClick={() => openGallery(0)}
                  className="bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg text-sm flex items-center hover:bg-opacity-75 transition-colors"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">View </span>Gallery
                </button>
              </div>
            </div>
            
            {/* Thumbnail Gallery - Right Side (Desktop Only) */}
            <div className="hidden lg:flex flex-[0_0_30%] flex-col gap-2 min-h-0">
              {/* ALWAYS show exactly 3 slots with floor plan GUARANTEED in bottom right when available */}
              
              {/* SLOT 0 (Top) - Property Image 2 */}
              <div className="flex-1 relative min-h-0">
                {imageUrls[1] ? (
                  <img
                    src={imageUrls[1]}
                    alt={`${title} 2`}
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(1)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg" />
                )}
              </div>

              {/* SLOT 1 (Middle) - Property Image 3 */}
              <div className="flex-1 relative min-h-0">
                {imageUrls[2] ? (
                  <img
                    src={imageUrls[2]}
                    alt={`${title} 3`}
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => openGallery(2)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg" />
                )}
              </div>

              {/* SLOT 2 (Bottom Right) - ALWAYS Floor Plan when available, otherwise Property Image 4 */}
              <div className="flex-1 relative min-h-0">
                {floorPlanUrl ? (
                  <div className="w-full h-full relative group min-h-0">
                    <img
                      src={floorPlanUrl}
                      alt="Floor Plan"
                      className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        const floorPlanIndex = allImages.findIndex(img => 
                          typeof img === 'object' && img.isFloorPlan
                        );
                        openGallery(floorPlanIndex >= 0 ? floorPlanIndex : allImages.length - 1);
                      }}
                    />
                    {/* Floor Plan Label Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-lg pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 p-1 pointer-events-none">
                      <div className="bg-blue-600 text-white px-2 py-1 rounded-sm text-xs font-bold flex items-center justify-center shadow-md border border-blue-500 w-full">
                        <Home className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="text-center leading-tight">FLOOR PLAN</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* No floor plan - show image 4 or empty slot */
                  <div className="w-full h-full relative">
                    {imageUrls[3] ? (
                      <img
                        src={imageUrls[3]}
                        alt={`${title} 4`}
                        className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openGallery(3)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-gray-400 text-center">
              <Camera className="w-16 h-16 mx-auto mb-4" />
              <p>No images available</p>
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2"
            >
              <X className="w-6 h-6 lg:w-8 lg:h-8" />
            </button>
            
            {/* Navigation Buttons - Desktop */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 p-2 hidden lg:block"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 p-2 hidden lg:block"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Mobile Navigation Buttons */}
            {allImages.length > 1 && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex gap-4 lg:hidden z-10">
                <button
                  onClick={prevImage}
                  className="bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}

            {/* Main Image */}
            <div className="max-w-5xl max-h-[70vh] lg:max-h-full flex items-center justify-center">
              <img
                src={typeof currentImage === 'string' ? currentImage : currentImage.url}
                alt={isCurrentFloorPlan ? "Floor Plan" : `${title} ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center lg:bottom-4">
              <div className="bg-black bg-opacity-60 px-4 py-2 rounded-lg">
                <div className="text-sm">
                  {isCurrentFloorPlan ? (
                    <div className="flex items-center justify-center">
                      <Home className="w-4 h-4 mr-2" />
                      Floor Plan
                    </div>
                  ) : (
                    `${selectedImageIndex + 1} of ${allImages.length}`
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail Strip - Desktop */}
            {allImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 hidden lg:flex gap-2 max-w-full overflow-x-auto pb-2">
                {allImages.map((img, index) => {
                  const imgUrl = typeof img === 'string' ? img : img.url;
                  const isFloorPlan = typeof img === 'object' && img.isFloorPlan;
                  return (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-16 h-16 relative cursor-pointer rounded border-2 overflow-hidden transition-all ${
                        index === selectedImageIndex ? 'border-white scale-110' : 'border-gray-500 hover:border-gray-300'
                      } ${isFloorPlan ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={imgUrl}
                        alt={isFloorPlan ? "Floor Plan" : `Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {isFloorPlan && (
                        <>
                          <div className="absolute inset-0 bg-blue-600 bg-opacity-10" />
                          <div className="absolute bottom-0 left-0 right-0 bg-blue-600 bg-opacity-95 text-white text-xs text-center py-0.5 font-medium">
                            <div className="flex items-center justify-center">
                              <Home className="w-2 h-2 mr-1" />
                              Plan
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Property Header */}
      <div className="p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            {/* Title */}
            <div className="mb-4">
              <EditableField
                value={title}
                field="title"
                type="text"
                canEdit={canEdit}
                onSave={onSave}
                className="text-2xl lg:text-3xl font-bold text-gray-900"
              />
            </div>

            {/* Location */}
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{location}</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <EditableField
                value={price}
                field="price"
                type="number"
                canEdit={canEdit}
                onSave={onSave}
                displayValue={formatPrice(price)}
                className="text-3xl lg:text-4xl font-bold text-green-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyHero;
