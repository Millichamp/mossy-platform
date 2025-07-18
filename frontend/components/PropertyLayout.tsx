import React from "react";
import FloatingChat from "./messaging/FloatingChat";
import LoginPrompt from "./LoginPrompt";
import { useAuth } from "../context/AuthContext";

interface PropertyLayoutProps {
  children: React.ReactNode;
  property?: any; // Will be properly typed when refactored
  isOwner: boolean;
}

const PropertyLayout: React.FC<PropertyLayoutProps> = ({ children, property, isOwner }) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {children}
        </div>
      </div>
      
      {/* Floating Chat - only show for logged-in non-owners */}
      {property && user && !isOwner && (
        <FloatingChat
          propertyId={property.id}
          propertyTitle={property.title}
          propertyPrice={property.price}
          propertyAddress={property.address?.displayAddress || property.address?.line1 || 'Address not available'}
          sellerId={property.seller_id}
        />
      )}

      {/* Login Prompt - show for anonymous users on property pages */}
      {property && !user && (
        <LoginPrompt propertyTitle={property.title} />
      )}
    </div>
  );
};

export default PropertyLayout;
