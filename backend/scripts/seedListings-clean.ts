import { uploadImageToSupabase } from './uploadImageToSupabase';

const API_URL = 'http://localhost:4000/api/listings';
const seller_id = '67b6024e-a5f7-4c19-8950-04f865ed59a8';

// Clean seed data using the standardized schema
const listings = [
  {
    title: 'Modern 3 Bedroom House in Richmond',
    description: 'A stunning modern house with spacious rooms, a large garden, and off-street parking.',
    price: 650000,
    bedrooms: 3,
    bathrooms: 2,
    receptions: 2,
    property_type: 'detached',
    address: {
      line1: '123 Main Street',
      city: 'Richmond',
      postcode: 'SW1A 1AA',
      displayAddress: '123 Main Street, Richmond SW1A 1AA',
    },
    coordinates: { lat: 51.4613, lng: -0.3037 },
    images: [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', caption: 'Front view' },
      { url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b', caption: 'Living room' },
      { url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae', caption: 'Garden' },
      { url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd', caption: 'Floor plan', isFloorPlan: true },
    ],
    key_features: ['Garden', 'Parking', 'Modern kitchen', 'Close to station'],
    square_feet: 1200,
    year_built: 2015,
    tenure: 'freehold',
    council_tax_band: 'D',
    epc_rating: 'B',
    epc_certificate_url: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    chain_free: true,
    parking_spaces: 2,
    reason_for_sale: 'Upsizing',
    completion_timeline: 'Flexible',
    virtual_tour_url: 'https://my.matterport.com/show/?m=example',
    status: 'active',
    seller_id,
    seller_name: 'John Doe',
    seller_response_time: '1h',
    view_count: 12,
    save_count: 3,
    price_history: [
      { date: new Date().toISOString(), price: 650000, event: 'listed' },
    ],
    nearby_schools: [
      { name: 'Richmond Primary', type: 'Primary', distance: '0.3 miles', ofstedRating: 'Good' },
      { name: 'St. Mary\'s', type: 'Secondary', distance: '0.7 miles', ofstedRating: 'Outstanding' },
    ],
    transport_links: [
      { type: 'Tube', name: 'Richmond Station', distance: '0.5 miles' },
      { type: 'Bus', name: 'Main Street', distance: '0.1 miles' },
    ],
  },
  {
    title: 'Luxury Flat in Central London',
    description: 'A luxury flat with city views, concierge, and gym access.',
    price: 1200000,
    bedrooms: 2,
    bathrooms: 2,
    receptions: 1,
    property_type: 'flat',
    address: {
      line1: '456 Queen\'s Road',
      city: 'London',
      postcode: 'W1A 2AB',
      displayAddress: '456 Queen\'s Road, London W1A 2AB',
    },
    coordinates: { lat: 51.5138, lng: -0.0984 },
    images: [
      { url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b', caption: 'Living room' },
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', caption: 'Bedroom' },
      { url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd', caption: 'Floor plan', isFloorPlan: true },
    ],
    key_features: ['Concierge', 'Gym', 'Balcony', 'City views'],
    square_feet: 900,
    year_built: 2020,
    tenure: 'leasehold',
    leasehold_years: 125,
    ground_rent: 300,
    service_charge: 2500,
    council_tax_band: 'F',
    epc_rating: 'A',
    epc_certificate_url: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    chain_free: false,
    parking_spaces: 1,
    reason_for_sale: 'Relocating abroad',
    completion_timeline: '3 months',
    virtual_tour_url: 'https://my.matterport.com/show/?m=example2',
    status: 'active',
    seller_id,
    seller_name: 'Jane Smith',
    seller_response_time: '2h',
    view_count: 8,
    save_count: 2,
    price_history: [
      { date: new Date().toISOString(), price: 1200000, event: 'listed' },
    ],
    nearby_schools: [
      { name: 'Central London Primary', type: 'Primary', distance: '0.4 miles', ofstedRating: 'Outstanding' },
    ],
    transport_links: [
      { type: 'Tube', name: 'Oxford Circus', distance: '0.2 miles' },
      { type: 'Bus', name: 'Queen\'s Road', distance: '0.1 miles' },
    ],
  },
  {
    title: 'Cozy Bungalow Near the Coast',
    description: 'A charming bungalow just minutes from the beach.',
    price: 350000,
    bedrooms: 2,
    bathrooms: 1,
    receptions: 1,
    property_type: 'bungalow',
    address: {
      line1: '789 Seaside Lane',
      city: 'Brighton',
      postcode: 'BN1 1AA',
      displayAddress: '789 Seaside Lane, Brighton BN1 1AA',
    },
    coordinates: { lat: 50.8225, lng: -0.1372 },
    images: [
      { url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae', caption: 'Front view' },
      { url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd', caption: 'Floor plan', isFloorPlan: true },
    ],
    key_features: ['Beach access', 'Garden', 'Quiet area'],
    square_feet: 700,
    year_built: 2005,
    tenure: 'freehold',
    council_tax_band: 'C',
    epc_rating: 'B',
    epc_certificate_url: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    chain_free: true,
    parking_spaces: 1,
    reason_for_sale: 'Downsizing',
    completion_timeline: 'Immediate',
    virtual_tour_url: 'https://my.matterport.com/show/?m=example3',
    status: 'active',
    seller_id,
    seller_name: 'Bob Johnson',
    seller_response_time: '4h',
    view_count: 5,
    save_count: 1,
    price_history: [
      { date: new Date().toISOString(), price: 350000, event: 'listed' },
    ],
    nearby_schools: [
      { name: 'Brighton Beach Primary', type: 'Primary', distance: '0.6 miles', ofstedRating: 'Good' },
    ],
    transport_links: [
      { type: 'Bus', name: 'Seaside Lane', distance: '0.1 miles' },
    ],
  },
];

async function seedListings() {
  try {
    // Upload images to Supabase and update URLs
    console.log('Uploading images to Supabase...');
    
    for (const listing of listings) {
      const updatedImages = [];
      
      for (const image of listing.images) {
        try {
          const supabaseUrl = await uploadImageToSupabase(image.url);
          updatedImages.push({
            ...image,
            url: supabaseUrl
          });
        } catch (error) {
          console.error(`Failed to upload image ${image.url}:`, error);
          // Keep original URL as fallback
          updatedImages.push(image);
        }
      }
      
      listing.images = updatedImages;
    }

    // Insert each listing
    console.log('Inserting listings...');
    for (const listing of listings) {
      try {
        const response = await fetch(`${API_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(listing),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error creating listing:', errorData);
          continue;
        }

        const result = await response.json();
        console.log('✓ Created listing:', result.title);
      } catch (error) {
        console.error('Error creating listing:', error);
      }
    }

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seedListings();
