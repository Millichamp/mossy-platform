
const API_URL = 'http://localhost:4000/api/listings';
const seller_id = '67b6024e-a5f7-4c19-8950-04f865ed59a8';

const listings = [
  {
    title: 'Modern 3 Bedroom House in Richmond',
    price: 650000,
    address: {
      line1: '123 Main Street',
      city: 'Richmond',
      postcode: 'SW1A 1AA',
      displayAddress: '123 Main Street, Richmond SW1A 1AA',
    },
    bedrooms: 3,
    bathrooms: 2,
    receptions: 2,
    squareFeet: 1200,
    yearBuilt: 2015,
    tenure: 'freehold',
    councilTaxBand: 'D',
    epcRating: 'B',
    epcCertificateUrl: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    serviceCharge: 0,
    groundRent: 0,
    status: 'active',
    listedDate: new Date().toISOString(),
    priceHistory: [
      { date: new Date().toISOString(), price: 650000, event: 'listed' },
    ],
    viewCount: 12,
    saveCount: 3,
    chainFree: true,
    reasonForSale: 'Upsizing',
    completionTimeline: 'Flexible',
    images: [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', caption: 'Front view' },
      { url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b', caption: 'Living room' },
      { url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae', caption: 'Garden', isFloorPlan: false },
      { url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd', caption: 'Floor plan', isFloorPlan: true },
    ],
    virtualTourUrl: 'https://my.matterport.com/show/?m=example',
    seller_id,
    sellerName: 'John Doe',
    sellerResponseTime: '1h',
    coordinates: { lat: 51.4613, lng: -0.3037 },
    nearbySchools: [
      { name: 'Richmond Primary', type: 'Primary', distance: '0.3 miles', ofstedRating: 'Good' },
      { name: 'St. Mary’s', type: 'Secondary', distance: '0.7 miles', ofstedRating: 'Outstanding' },
    ],
    transportLinks: [
      { type: 'Tube', name: 'Richmond Station', distance: '0.5 miles' },
      { type: 'Bus', name: 'Main Street', distance: '0.1 miles' },
    ],
    description: 'A stunning modern house with spacious rooms, a large garden, and off-street parking.',
    keyFeatures: ['Garden', 'Parking', 'Modern kitchen', 'Close to station'],
  },
  {
    title: 'Luxury Flat in Central London',
    price: 1200000,
    address: {
      line1: "456 Queen's Road",
      city: 'London',
      postcode: 'W1A 2AB',
      displayAddress: "456 Queen's Road, London W1A 2AB",
    },
    bedrooms: 2,
    bathrooms: 2,
    receptions: 1,
    squareFeet: 900,
    yearBuilt: 2020,
    tenure: 'leasehold',
    councilTaxBand: 'F',
    epcRating: 'A',
    epcCertificateUrl: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    serviceCharge: 2500,
    groundRent: 300,
    status: 'active',
    listedDate: new Date().toISOString(),
    priceHistory: [
      { date: new Date().toISOString(), price: 1200000, event: 'listed' },
    ],
    viewCount: 8,
    saveCount: 2,
    chainFree: false,
    reasonForSale: 'Relocating abroad',
    completionTimeline: '3 months',
    images: [
      { url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b', caption: 'Living room' },
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', caption: 'Bedroom' },
      { url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd', caption: 'Floor plan', isFloorPlan: true },
    ],
    virtualTourUrl: 'https://my.matterport.com/show/?m=example2',
    seller_id,
    sellerName: 'Jane Smith',
    sellerResponseTime: '2h',
    coordinates: { lat: 51.5138, lng: -0.0984 },
    nearbySchools: [
      { name: 'Central London Primary', type: 'Primary', distance: '0.4 miles', ofstedRating: 'Outstanding' },
    ],
    transportLinks: [
      { type: 'Tube', name: 'Oxford Circus', distance: '0.2 miles' },
      { type: 'Bus', name: 'Queen’s Road', distance: '0.1 miles' },
    ],
    description: 'A luxury flat with city views, concierge, and gym access.',
    keyFeatures: ['Concierge', 'Gym', 'Balcony', 'City views'],
  },
  {
    title: 'Cozy Bungalow Near the Coast',
    price: 350000,
    address: {
      line1: '789 Seaside Lane',
      city: 'Brighton',
      postcode: 'BN1 1AA',
      displayAddress: '789 Seaside Lane, Brighton BN1 1AA',
    },
    bedrooms: 2,
    bathrooms: 1,
    receptions: 1,
    squareFeet: 700,
    yearBuilt: 2005,
    tenure: 'freehold',
    councilTaxBand: 'B',
    epcRating: 'C',
    epcCertificateUrl: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    serviceCharge: 0,
    groundRent: 0,
    status: 'active',
    listedDate: new Date().toISOString(),
    priceHistory: [
      { date: new Date().toISOString(), price: 350000, event: 'listed' },
    ],
    viewCount: 5,
    saveCount: 1,
    chainFree: true,
    reasonForSale: 'Downsizing',
    completionTimeline: 'Immediate',
    images: [
      { url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae', caption: 'Front view' },
      { url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd', caption: 'Floor plan', isFloorPlan: true },
    ],
    virtualTourUrl: 'https://my.matterport.com/show/?m=example3',
    seller_id,
    sellerName: 'Bob Johnson',
    sellerResponseTime: '4h',
    coordinates: { lat: 50.8225, lng: -0.1372 },
    nearbySchools: [
      { name: 'Brighton Beach Primary', type: 'Primary', distance: '0.6 miles', ofstedRating: 'Good' },
    ],
    transportLinks: [
      { type: 'Bus', name: 'Seaside Lane', distance: '0.1 miles' },
    ],
    description: 'A charming bungalow just minutes from the beach.',
    keyFeatures: ['Beach access', 'Garden', 'Quiet area'],
  },
];

async function seed() {
  for (const listing of listings) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listing),
    });
    const data = await res.json();
    console.log('Created:', data);
  }
}

seed();
