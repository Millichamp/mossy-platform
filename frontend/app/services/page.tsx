"use client";

import { useState } from "react";

const serviceProviders = [
  {
    id: 1,
    business_name: "ProPhoto UK",
    service_type: "photography",
    description: "Professional property photography for listings.",
    price_range: "£100-£300",
    rating: 4.8,
    verified: true,
  },
  {
    id: 2,
    business_name: "ConveyXpress",
    service_type: "conveyancing",
    description: "Fast, reliable conveyancing services.",
    price_range: "£800-£1500",
    rating: 4.6,
    verified: true,
  },
  {
    id: 3,
    business_name: "MoveEasy",
    service_type: "moving",
    description: "Stress-free moving and removals.",
    price_range: "£300-£900",
    rating: 4.7,
    verified: false,
  },
  {
    id: 4,
    business_name: "NegotiNation",
    service_type: "negotiation",
    description: "Expert negotiators to get you the best deal.",
    price_range: "£200-£500",
    rating: 4.9,
    verified: true,
  },
];

const serviceTypes = [
  { value: "all", label: "All Services" },
  { value: "photography", label: "Photography" },
  { value: "conveyancing", label: "Conveyancing" },
  { value: "negotiation", label: "Negotiation" },
  { value: "moving", label: "Moving" },
];

export default function ServicesPage() {
  const [filter, setFilter] = useState("all");

  const filteredProviders =
    filter === "all"
      ? serviceProviders
      : serviceProviders.filter((sp) => sp.service_type === filter);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Services Marketplace</h1>
        <div className="mb-6 flex gap-4 flex-wrap">
          {serviceTypes.map((type) => (
            <button
              key={type.value}
              className={`px-4 py-2 rounded-md border font-medium transition-colors duration-150 ${
                filter === type.value
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
              }`}
              onClick={() => setFilter(type.value)}
            >
              {type.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProviders.map((sp) => (
            <div
              key={sp.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col gap-2 border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-gray-900">{sp.business_name}</span>
                {sp.verified && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Verified</span>
                )}
              </div>
              <span className="text-sm text-gray-500 capitalize">{sp.service_type}</span>
              <p className="text-gray-700 text-sm mb-2">{sp.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">{sp.rating}</span>
                <span className="text-gray-400 text-xs">/ 5</span>
              </div>
              <div className="text-green-700 font-bold mt-2">{sp.price_range}</div>
              <button className="mt-4 bg-green-600 text-white py-1.5 px-4 rounded-md hover:bg-green-700 transition">View Profile</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
