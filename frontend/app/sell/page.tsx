'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import ProtectedRoute from '../../components/ProtectedRoute';


export default function SellPage() {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    address: { line1: '', city: '', postcode: '', displayAddress: '' },
    bedrooms: '',
    bathrooms: '',
    receptions: '',
    squareFeet: '',
    yearBuilt: '',
    tenure: '',
    propertyType: '',
    councilTaxBand: '',
    epcRating: '',
    epcCertificateUrl: '',
    serviceCharge: '',
    groundRent: '',
    status: 'active',
    listedDate: '',
    priceHistory: [],
    viewCount: 0,
    saveCount: 0,
    chainFree: false,
    reasonForSale: '',
    completionTimeline: '',
    images: [{ url: '', caption: '', isFloorPlan: false }],
    virtualTourUrl: '',
    sellerName: '',
    sellerResponseTime: '',
    coordinates: { lat: '', lng: '' },
    nearbySchools: [{ name: '', type: '', distance: '', ofstedRating: '' }],
    transportLinks: [{ type: '', name: '', distance: '' }],
    keyFeatures: [''],
    description: '',
    parking: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');
    if (!user) {
      setError('You must be logged in to list a property.');
      setSubmitting(false);
      return;
    }
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        receptions: formData.receptions ? Number(formData.receptions) : undefined,
        squareFeet: formData.squareFeet ? Number(formData.squareFeet) : undefined,
        yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
        parking: formData.parking ? Number(formData.parking) : undefined,
        address: {
          line1: formData.address.line1,
          city: formData.address.city,
          postcode: formData.address.postcode,
          displayAddress: `${formData.address.line1}, ${formData.address.city} ${formData.address.postcode}`,
        },
        images: formData.images.filter(img => img.url),
        keyFeatures: formData.keyFeatures.filter(f => f),
        seller_id: user.id,
        listedDate: new Date().toISOString(),
        councilTaxBand: formData.councilTaxBand,
        epcRating: formData.epcRating,
        epcCertificateUrl: formData.epcCertificateUrl,
        serviceCharge: formData.serviceCharge ? Number(formData.serviceCharge) : undefined,
        groundRent: formData.groundRent ? Number(formData.groundRent) : undefined,
        status: formData.status,
        priceHistory: [],
        viewCount: 0,
        saveCount: 0,
        chainFree: formData.chainFree,
        reasonForSale: formData.reasonForSale,
        completionTimeline: formData.completionTimeline,
        virtualTourUrl: formData.virtualTourUrl,
        sellerName: formData.sellerName,
        sellerResponseTime: formData.sellerResponseTime,
        coordinates: formData.coordinates,
        nearbySchools: formData.nearbySchools.filter(s => s.name),
        transportLinks: formData.transportLinks.filter(t => t.name),
        description: formData.description,
      };
      const res = await fetch('http://localhost:4000/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create listing');
      setSuccess('Listing created successfully!');
      setFormData({
        title: '',
        price: '',
        address: { line1: '', city: '', postcode: '', displayAddress: '' },
        bedrooms: '',
        bathrooms: '',
        receptions: '',
        squareFeet: '',
        yearBuilt: '',
        tenure: '',
        propertyType: '',
        councilTaxBand: '',
        epcRating: '',
        epcCertificateUrl: '',
        serviceCharge: '',
        groundRent: '',
        status: 'active',
        listedDate: '',
        priceHistory: [],
        viewCount: 0,
        saveCount: 0,
        chainFree: false,
        reasonForSale: '',
        completionTimeline: '',
        images: [{ url: '', caption: '', isFloorPlan: false }],
        virtualTourUrl: '',
        sellerName: '',
        sellerResponseTime: '',
        coordinates: { lat: '', lng: '' },
        nearbySchools: [{ name: '', type: '', distance: '', ofstedRating: '' }],
        transportLinks: [{ type: '', name: '', distance: '' }],
        keyFeatures: [''],
        description: '',
        parking: '',
      });
    } catch (err: any) {
      setError(err.message || 'Error creating listing');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle flat and nested changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // For images (array of objects)
  const handleImageChange = (idx: number, field: 'url' | 'caption' | 'isFloorPlan', value: string | boolean) => {
    setFormData((prev) => {
      const arr = [...prev.images];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, images: arr };
    });
  };
  const addImageField = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, { url: '', caption: '', isFloorPlan: false }] }));
  };
  const removeImageField = (idx: number) => {
    setFormData((prev) => {
      const arr = [...prev.images];
      arr.splice(idx, 1);
      return { ...prev, images: arr };
    });
  };

  // For key features
  const handleKeyFeatureChange = (idx: number, value: string) => {
    setFormData((prev) => {
      const arr = [...prev.keyFeatures];
      arr[idx] = value;
      return { ...prev, keyFeatures: arr };
    });
  };
  const addKeyFeature = () => {
    setFormData((prev) => ({ ...prev, keyFeatures: [...prev.keyFeatures, ''] }));
  };
  const removeKeyFeature = (idx: number) => {
    setFormData((prev) => {
      const arr = [...prev.keyFeatures];
      arr.splice(idx, 1);
      return { ...prev, keyFeatures: arr };
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          List Your Property
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {success && <div className="mb-4 text-green-700 bg-green-100 rounded p-2">{success}</div>}
          {error && <div className="mb-4 text-red-700 bg-red-100 rounded p-2">{error}</div>}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Property Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Modern 3 Bedroom House in Richmond"
              required
            />
          </div>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Address Line 1</label>
              <input
                type="text"
                name="address.line1"
                value={formData.address.line1}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="123 Main Street"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">City</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="London"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Postcode</label>
              <input
                type="text"
                name="address.postcode"
                value={formData.address.postcode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="SW1A 1AA"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Property Type</label>
            <select
              name="propertyType"
              value={formData.propertyType || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select</option>
              <option value="detached">Detached</option>
              <option value="semi-detached">Semi-Detached</option>
              <option value="terraced">Terraced</option>
              <option value="flat">Flat</option>
              <option value="bungalow">Bungalow</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Price (£)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="650000"
                required
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Bedrooms
              </label>
              <select
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5+</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Bathrooms
              </label>
              <select
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Key Features</label>
            {formData.keyFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-center mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={e => handleKeyFeatureChange(idx, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. garden, parking, balcony"
                />
                <button type="button" onClick={() => removeKeyFeature(idx)} className="ml-2 text-red-600">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addKeyFeature} className="text-green-600 underline">Add Feature</button>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Images</label>
            {formData.images.map((img, idx) => (
              <div key={idx} className="flex flex-col md:flex-row md:items-center mb-2 gap-2">
                <input
                  type="text"
                  value={img.url}
                  onChange={e => handleImageChange(idx, 'url', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Image URL"
                />
                <input
                  type="text"
                  value={img.caption}
                  onChange={e => handleImageChange(idx, 'caption', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Caption (optional)"
                />
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={img.isFloorPlan}
                    onChange={e => handleImageChange(idx, 'isFloorPlan', e.target.checked)}
                    className="mr-1"
                  />
                  Floor Plan
                </label>
                <button type="button" onClick={() => removeImageField(idx)} className="text-red-600">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addImageField} className="text-green-600 underline">Add Image</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">EPC Rating</label>
              <input
                type="text"
                name="epcRating"
                value={formData.epcRating}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="B"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Council Tax Band</label>
              <input
                type="text"
                name="councilTaxBand"
                value={formData.councilTaxBand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="D"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Tenure</label>
              <input
                type="text"
                name="tenure"
                value={formData.tenure}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Freehold/Leasehold"
              />
            </div>
            <div className="flex items-center mt-8">
              <input
                type="checkbox"
                name="chainFree"
                checked={formData.chainFree}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-gray-700 text-sm font-bold">Chain Free</label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Parking Spaces
            </label>
            <input
              type="number"
              name="parking"
              value={formData.parking}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="2"
            />
          </div>


          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe your property..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
            disabled={submitting}
          >
            {submitting ? 'Listing...' : 'List Property'}
          </button>
        </form>
      </div>
    </main>
  );
}