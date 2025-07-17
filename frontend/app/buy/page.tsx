
import { useEffect, useState } from 'react';
import PropertyCard from '@/components/PropertyCard';

interface Property {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  city: string;
  postcode: string;
  images?: string[];
  propertyType?: string;
}

export default function BuyPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProperties() {
      try {
        const res = await fetch('http://localhost:4000/api/properties');
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
                location={`${property.address}, ${property.city}, ${property.postcode}`}
                imageUrl={property.images && property.images.length > 0 ? property.images[0] : '/placeholder-property.jpg'}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ...existing code...