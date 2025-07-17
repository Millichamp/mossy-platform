"use client";

import { useEffect, useState } from 'react';
import PropertyCard from '@/components/PropertyCard';
import { useAuth } from '../../context/AuthContext';

interface Property {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  address: {
    line1: string;
    city: string;
    postcode: string;
    displayAddress: string;
  };
  images: Array<{ url: string; caption?: string; isFloorPlan?: boolean }>;
  propertyType?: string;
}

export default function BuyPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState<string | null>(null); // property id being saved/unsaved

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch('http://localhost:4000/api/listings');
        if (!res.ok) throw new Error('Failed to fetch properties');
        const data = await res.json();
        setProperties(data);
      } catch (err: any) {
        setError(err.message || 'Error loading properties');
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  // Fetch saved property IDs for the logged-in user
  useEffect(() => {
    if (!user) {
      setSavedIds([]);
      return;
    }
    fetch(`http://localhost:4000/api/saved-properties?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setSavedIds(Array.isArray(data) ? data : []);
      })
      .catch(() => setSavedIds([]));
  }, [user]);

  // Save/unsave handlers
  const handleToggleSave = async (propertyId: string) => {
    if (!user) return;
    setSaving(propertyId);
    const isSaved = savedIds.includes(propertyId);
    try {
      if (isSaved) {
        await fetch('http://localhost:4000/api/saved-properties', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, property_id: propertyId })
        });
        setSavedIds(ids => ids.filter(id => id !== propertyId));
      } else {
        await fetch('http://localhost:4000/api/saved-properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, property_id: propertyId })
        });
        setSavedIds(ids => [...ids, propertyId]);
      }
    } catch (e) {
      // Optionally show error
    } finally {
      setSaving(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Properties for Sale
        </h1>
        {/* Search filters will go here later */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <p className="text-gray-600">Search filters coming soon...</p>
        </div>
        {/* Property Grid */}
        {loading ? (
          <div className="text-gray-500">Loading properties...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                price={property.price}
                bedrooms={property.bedrooms}
                bathrooms={property.bathrooms}
                location={property.address.displayAddress}
                imageUrl={property.images && property.images.length > 0 ? property.images[0].url : '/placeholder-property.jpg'}
                isSaved={savedIds.includes(property.id)}
                onToggleSave={() => handleToggleSave(property.id)}
                saving={saving === property.id}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ...existing code...