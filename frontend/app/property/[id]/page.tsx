"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { MapPin, Bed, Bath, Home, Ruler, Calendar, BadgeCheck, ShieldCheck, FileText, Heart, Share2, Printer, Eye, Info, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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
  propertyType: 'detached' | 'semi-detached' | 'terraced' | 'flat' | 'bungalow';
  bedrooms: number;
  bathrooms: number;
  receptions: number;
  squareFeet?: number;
  yearBuilt?: number;
  tenure: 'freehold' | 'leasehold' | 'share-of-freehold';
  councilTaxBand: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  epcRating: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  epcCertificateUrl?: string;
  serviceCharge?: number;
  groundRent?: number;
  status: 'active' | 'under-offer' | 'sold';
  listedDate: string;
  priceHistory: Array<{date: string; price: number; event: 'listed' | 'reduced' | 'increased'}>;
  viewCount: number;
  saveCount: number;
  chainFree: boolean;
  reasonForSale?: string;
  completionTimeline?: string;
  images: Array<{url: string; caption?: string; isFloorPlan?: boolean}>;
  virtualTourUrl?: string;
  sellerId: string;
  sellerName: string;
  sellerResponseTime: string;
  coordinates: {lat: number; lng: number};
  nearbySchools: Array<{name: string; type: string; distance: string; ofstedRating?: string}>;
  transportLinks: Array<{type: string; name: string; distance: string}>;
  description: string;
  keyFeatures: string[];
}

export default function PropertyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showFloorPlans, setShowFloorPlans] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function fetchProperty() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:4000/api/listings/${id}`);
        if (!res.ok) throw new Error("Property not found");
        const data = await res.json();
        setProperty(data);
      } catch (e: any) {
        setError(e.message || "Error loading property");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProperty();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin w-8 h-8 text-green-500" />
      <span className="ml-2 text-gray-500">Loading property...</span>
    </div>
  );
  if (error || !property) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Info className="w-10 h-10 text-red-500 mb-2" />
      <h2 className="text-xl font-bold mb-2">Property not found</h2>
      <button className="text-green-600 underline" onClick={() => router.back()}><ChevronLeft className="inline w-4 h-4" /> Go Back</button>
    </div>
  );

  const heroImages = showFloorPlans
    ? property.images.filter(img => img.isFloorPlan)
    : property.images.filter(img => !img.isFloorPlan);

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black">
      </section>
        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-video bg-gray-200">
            {heroImages[activeImage] ? (
              <Image
                src={heroImages[activeImage].url}
                alt={heroImages[activeImage].caption || property.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
            )}
            {/* Floor plan toggle */}
            <button
              className="absolute top-4 left-4 bg-white bg-opacity-80 rounded px-3 py-1 text-sm text-green-700 shadow"
              onClick={() => setShowFloorPlans(f => !f)}
            >
              {showFloorPlans ? "Show Photos" : "Show Floor Plans"}
            </button>
            {/* Virtual tour */}
            {property.virtualTourUrl && (
              <a
                href={property.virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded shadow text-sm hover:bg-green-700"
              >
                Virtual Tour
              </a>
            )}
            {/* Gallery open button */}
            <button
              className="absolute bottom-4 right-4 bg-white bg-opacity-80 rounded px-3 py-1 text-sm text-green-700 shadow"
              onClick={() => setGalleryOpen(true)}
            >
              View all {heroImages.length} photos
            </button>
            {/* Carousel controls */}
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2"
              onClick={() => setActiveImage(i => (i - 1 + heroImages.length) % heroImages.length)}
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-green-600" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2"
              onClick={() => setActiveImage(i => (i + 1) % heroImages.length)}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-green-600" />
            </button>
          </div>
          {/* Thumbnails */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            {heroImages.slice(0, 10).map((img, idx) => (
              <button
                key={img.url}
                className={`relative w-20 h-14 border-2 ${activeImage === idx ? 'border-green-600' : 'border-transparent'} rounded overflow-hidden`}
                onClick={() => setActiveImage(idx)}
              >
                <Image src={img.url} alt={img.caption || property.title} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
        {/* Fullscreen gallery modal */}
        {galleryOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center">
            <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setGalleryOpen(false)}>&times;</button>
            <div className="max-w-4xl w-full flex flex-col items-center">
              <div className="relative aspect-video w-full bg-gray-200">
                <Image
                  src={heroImages[activeImage]?.url || ''}
                  alt={heroImages[activeImage]?.caption || property?.title || ''}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {heroImages.map((img, idx) => (
                  <button
                    key={img.url}
                    className={`relative w-20 h-14 border-2 ${activeImage === idx ? 'border-green-600' : 'border-transparent'} rounded overflow-hidden`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <Image src={img.url} alt={img.caption || property?.title || ''} fill className="object-cover" />
                  </button>
                ))}
              </div>
              <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {property?.saveCount ?? 0}</span>
            </div>
          </div>
        )}

      {/* Key Information Grid */}
      <section className="max-w-5xl mx-auto mt-6 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2"><Bed className="w-5 h-5 text-green-600" /> {property.bedrooms} Bedrooms</div>
          <div className="flex items-center gap-2"><Bath className="w-5 h-5 text-green-600" /> {property.bathrooms} Bathrooms</div>
          <div className="flex items-center gap-2"><Home className="w-5 h-5 text-green-600" /> {property.propertyType ? property.propertyType.replace('-', ' ') : 'N/A'}</div>
          <div className="flex items-center gap-2"><Ruler className="w-5 h-5 text-green-600" /> {property.squareFeet ? `${property.squareFeet} sqft` : 'N/A'}</div>
          <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-green-600" /> Built {property.yearBuilt || 'N/A'}</div>
          <div className="flex items-center gap-2"><BadgeCheck className="w-5 h-5 text-green-600" /> Council Tax {property.councilTaxBand}</div>
          <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-600" /> EPC {property.epcRating} {property.epcCertificateUrl && (<a href={property.epcCertificateUrl} target="_blank" rel="noopener noreferrer" className="underline text-xs ml-1">View</a>)}</div>
          <div className="flex items-center gap-2"><FileText className="w-5 h-5 text-green-600" /> {property.tenure.charAt(0).toUpperCase() + property.tenure.slice(1)}</div>
        </div>
      </section>

      {/* Tabbed Content Section */}
      <section className="max-w-5xl mx-auto mt-8 px-4">
        {/* Tabs: Overview, Location & Area, Floorplans, EPC */}
        {/* ...implement tab logic as needed... */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-2">Overview</h2>
          <p className="mb-2">{property.description}</p>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {property.keyFeatures.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      </section>

      {/* Seller Transparency Section */}
      <section className="max-w-5xl mx-auto mt-8 px-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Seller Transparency</h3>
          <p>Chain free: {property.chainFree ? 'Yes' : 'No'}</p>
          <p>Reason for sale: {property.reasonForSale || 'Not specified'}</p>
          <p>Preferred timeline: {property.completionTimeline || 'Not specified'}</p>
          <p>{property.viewCount} active viewings | {property.saveCount} offers received</p>
        </div>
      </section>

      {/* Map Section (placeholder) */}
      <section className="max-w-5xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-2">Location & Area</h2>
          <div className="mb-2"><MapPin className="inline w-5 h-5 text-green-600 mr-1" /> {property.address.displayAddress}</div>
          {/* TODO: Integrate Mapbox/Google Maps here */}
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">Map coming soon</div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Nearby Schools</h4>
              <ul className="text-sm">
                {property.nearbySchools.map((s, i) => (
                  <li key={i}>{s.name} ({s.type}, {s.distance}) {s.ofstedRating && <span className="ml-1 text-yellow-600">Ofsted: {s.ofstedRating}</span>}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Transport Links</h4>
              <ul className="text-sm">
                {property.transportLinks.map((t, i) => (
                  <li key={i}>{t.type}: {t.name} ({t.distance})</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
