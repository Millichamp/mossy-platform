"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { useEffect } from "react";

function formatDate(dateStr: string) {
  const daysAgo = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  return daysAgo === 0 ? "Listed today" : `Listed ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
}

export default function PropertyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [mainImage, setMainImage] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:4000/api/properties/${id}`);
        if (!res.ok) throw new Error("Property not found");
        const data = await res.json();
        setProperty(data);
        // Optionally fetch related properties here
      } catch (err: any) {
        setError(err.message || "Error loading property");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProperty();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading property...</div>;
  }
  if (error || !property) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error || "Property not found"}</div>;
  }

  // Related properties placeholder (could fetch from backend based on location/price)
  // setRelated([...])

  return (
    <main className="bg-gray-50 min-h-screen pb-12">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto pt-8 px-4">
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
            <Image src={property.images && property.images[mainImage] ? property.images[mainImage] : "/placeholder-property.jpg"} alt={property.title} fill className="object-cover" />
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">{mainImage+1}/{property.images?.length || 1}</span>
            <button className="absolute top-2 right-2 bg-white bg-opacity-80 rounded p-1 text-xs">⛶</button>
          </div>
          <div className="flex gap-2 mt-2">
            {(property.images || ["/placeholder-property.jpg"]).map((img: string, i: number) => (
              <button key={i} onClick={() => setMainImage(i)} className={`h-14 w-20 rounded overflow-hidden border ${mainImage===i?"border-green-600":"border-gray-200"}`}>
                <Image src={img} alt="thumb" width={80} height={56} className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Property Header */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{property.title}</h1>
            <div className="text-3xl font-bold text-green-700 mb-1">£{property.price.toLocaleString()}</div>
            <div className="text-gray-600 mb-1">{property.address}, {property.city}, {property.postcode}</div>
            <span className={`inline-block text-xs px-2 py-0.5 rounded font-semibold ${property.status==="active"?"bg-green-100 text-green-700":property.status==="under_offer"?"bg-yellow-100 text-yellow-700":"bg-gray-200 text-gray-500"}`}>{property.status.replace("_"," ").replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span className="ml-2 text-xs text-gray-400">{formatDate(property.listedDate)}</span>
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="sticky top-16 z-40 bg-white border-b py-2 mt-4 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex gap-4 items-center">
          <button className="text-gray-500 hover:text-red-500 text-xl">♡</button>
          <button className="text-gray-500 hover:text-green-600 text-xl">Share</button>
          <button className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 transition">Request Viewing</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-300 transition">Make Enquiry</button>
          {property.status === "active" && (
            <button className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition">Make Offer</button>
          )}
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div className="flex flex-col items-center"><span>🛏️</span><span>{property.bedrooms} Bedrooms</span></div>
          <div className="flex flex-col items-center"><span>🛁</span><span>{property.bathrooms} Bathrooms</span></div>
          <div className="flex flex-col items-center"><span>🏠</span><span>{property.propertyType.charAt(0).toUpperCase()+property.propertyType.slice(1)}</span></div>
          {property.garden && <div className="flex flex-col items-center"><span>🌳</span><span>Garden</span></div>}
          <div className="flex flex-col items-center"><span>🅿️</span><span>{property.parking} Parking</span></div>
          <div className="flex flex-col items-center"><span>⚡</span><span>EPC {property.epcRating}</span></div>
        </div>
      </section>

      {/* Description Section */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <div className="text-gray-700 mb-2">
          {property.description.length > 200 && !descExpanded ? (
            <>
              {property.description.slice(0, 200)}... <button className="text-green-600 underline" onClick={()=>setDescExpanded(true)}>Read more</button>
            </>
          ) : property.description.length > 200 ? (
            <>
              {property.description} <button className="text-green-600 underline" onClick={()=>setDescExpanded(false)}>Read less</button>
            </>
          ) : property.description}
        </div>
        <div className="mb-2">
          {property.features?.map((l: string, i: number) => (
            <span key={i} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded mr-2 mb-2">
              {l}
            </span>
          ))}
        </div>
      </section>

      {/* Property Details Table */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <h2 className="text-lg font-semibold mb-2">Property Details</h2>
        <table className="w-full text-sm bg-white rounded shadow overflow-hidden">
          <tbody>
            <tr><td className="font-semibold py-2 px-2">Price</td><td>£{property.price.toLocaleString()}</td></tr>
            <tr><td className="font-semibold py-2 px-2">Type</td><td>{property.propertyType.charAt(0).toUpperCase()+property.propertyType.slice(1)}</td></tr>
            <tr><td className="font-semibold py-2 px-2">Bedrooms</td><td>{property.bedrooms}</td></tr>
            <tr><td className="font-semibold py-2 px-2">Bathrooms</td><td>{property.bathrooms}</td></tr>
            <tr><td className="font-semibold py-2 px-2">Council Tax Band</td><td>{property.councilTaxBand}</td></tr>
            <tr><td className="font-semibold py-2 px-2">Tenure</td><td>{property.tenure.charAt(0).toUpperCase()+property.tenure.slice(1)}</td></tr>
            <tr><td className="font-semibold py-2 px-2">Chain Free</td><td>{property.chainFree ? "Yes" : "No"}</td></tr>
          </tbody>
        </table>
      </section>

      {/* Location Section */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <h2 className="text-lg font-semibold mb-2">Location & Amenities</h2>
        <div className="w-full h-64 bg-gray-200 rounded mb-2 flex items-center justify-center">Map Placeholder</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div><span className="font-semibold">Nearby amenities:</span> Shops, Parks, Cafes</div>
          <div><span className="font-semibold">Transport links:</span> Tube, Bus, Train</div>
          <div><span className="font-semibold">School catchment:</span> Richmond Primary, St. Mary's</div>
        </div>
      </section>

      {/* Seller Information */}
      <section className="max-w-5xl mx-auto px-4 mt-6">
        <h2 className="text-lg font-semibold mb-2">Seller Information</h2>
        <div className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold">{property.sellerName.slice(0, 2) + "***"}</div>
            <div className="text-xs text-gray-500">Member since Jan 2024</div>
            <div className="text-xs text-gray-500">Response rate: 98% | Response time: 1h</div>
          </div>
          <Link href="#" className="text-green-600 hover:underline text-sm mt-2 md:mt-0">Other listings</Link>
        </div>
      </section>

      {/* Related Properties */}
      <section className="max-w-5xl mx-auto px-4 mt-10">
        <h2 className="text-lg font-semibold mb-4">Related Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((p, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <Image src={p.images[0]} alt={p.title} width={320} height={180} className="rounded mb-2 object-cover w-full h-32" />
              <div className="font-bold">{p.title}</div>
              <div className="text-green-700 font-semibold">£{p.price.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{p.bedrooms} bed • {p.bathrooms} bath</div>
              <Link href={`/property/${p.id}`} className="text-green-600 hover:underline text-sm">View</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
