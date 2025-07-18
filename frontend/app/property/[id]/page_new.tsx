"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useParams } from "next/navigation";
import PropertyLayout from "../../../components/PropertyLayout";
import PropertyHero from "../../../components/PropertyHero";
import PropertyDetails from "../../../components/PropertyDetails";
import { Loader2 } from "lucide-react";

interface PropertyListing {
  id: string; 
  title: string;
  price: number;
  address: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    displayAddress: string;
  };
  property_type?: string;
  bedrooms: number;
  bathrooms: number;
  receptions?: number;
  square_feet?: number;
  year_built?: number;
  tenure?: string;
  council_tax_band?: string;
  energy_rating?: string;
  epc_certificate_url?: string;
  service_charge?: number;
  ground_rent?: number;
  status: 'active' | 'under-offer' | 'sold';
  listed_date?: string;
  view_count?: number;
  save_count?: number;
  chain_free?: boolean;
  reason_for_sale?: string;
  completion_timeline?: string;
  images?: Array<{url: string; caption?: string; is_floor_plan?: boolean}>;
  floor_plan_url?: string;
  virtual_tour_url?: string;
  seller_id: string;
  seller_name?: string;
  seller_response_time?: string;
  coordinates?: {lat: number; lng: number};
  nearby_schools?: Array<{name: string; type: string; distance: string; ofsted_rating?: string}>;
  transport_links?: Array<{type: string; name: string; distance: string}>;
  description: string;
  key_features?: string[];
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  garden?: boolean;
  furnished?: string;
  parking_spaces?: number;
}

export default function PropertyPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Check if user is the owner
  const isOwner = user?.id === property?.seller_id;

  // Save field function
  const handleSave = async (field: string, value: any) => {
    if (!property || !user) return;
    
    try {
      const body: any = { seller_id: user.id };
      body[field] = value;
      
      const res = await fetch(`http://localhost:4000/api/listings/${property.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      const result = await res.json();
      setProperty(prev => prev ? { ...prev, [field]: value } : prev);
    } catch (e) {
      console.error('Error saving:', e);
      throw e; // Re-throw to let EditableField handle the error
    }
  };

  useEffect(() => {
    // Check if redirected from successful listing creation
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        setShowSuccessBanner(true);
        // Remove the success parameter from URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    async function fetchProperty() {
      try {
        const res = await fetch(`http://localhost:4000/api/listings/${id}`);
        if (!res.ok) throw new Error('Property not found');
        const data = await res.json();
        setProperty(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Process images for hero component
  const imageUrls = property.images?.map(img => img.url) || [];

  return (
    <PropertyLayout property={property} isOwner={isOwner}>
      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">
                🎉 <strong>Congratulations!</strong> Your property listing has been created successfully and is now live.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessBanner(false)}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Property Hero Section */}
      <PropertyHero
        title={property.title}
        price={property.price}
        location={property.address.displayAddress}
        imageUrls={imageUrls}
        canEdit={isOwner}
        onSave={handleSave}
      />

      {/* Property Details Section */}
      <PropertyDetails
        property={property}
        canEdit={isOwner}
        onSave={handleSave}
      />
    </PropertyLayout>
  );
}
