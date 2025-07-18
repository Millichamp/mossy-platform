import { uploadImageToSupabase } from './uploadImageToSupabase';

const API_URL = 'http://localhost:4000/api/listings';
const seller_id = '67b6024e-a5f7-4c19-8950-04f865ed59a8';

// Comprehensive seed data with all fields for testing the new property page
const listings = [
  {
    title: 'Stunning Victorian House in Richmond',
    description: 'A beautiful Victorian house with modern amenities, perfect for families. Features include period details, spacious rooms, and a private garden with mature trees.',
    price: 850000,
    bedrooms: 4,
    bathrooms: 3,
    receptions: 2,
    property_type: 'house',
    address: {
      line1: '123 Garden Street',
      city: 'Richmond',
      postcode: 'TW9 1AA',
      displayAddress: '123 Garden Street, Richmond TW9 1AA',
    },
    coordinates: { lat: 51.4613, lng: -0.3037 },
    images: [
      { url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', caption: 'Beautiful Victorian exterior' },
      { url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e', caption: 'Modern fitted kitchen' },
      { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', caption: 'Spacious living room' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', caption: 'Master bedroom' },
      { url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd', caption: 'Private garden' },
    ],
    floor_plan: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
    key_features: ['Period features', 'Modern kitchen', 'Large garden', 'Off-street parking', 'High ceilings', 'Original fireplaces'],
    square_feet: 1800,
    year_built: 1900,
    tenure: 'freehold',
    council_tax_band: 'F',
    epc_rating: 'C',
    epc_certificate_url: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    chain_free: true,
    parking_spaces: 2,
    garage: true,
    garden: true,
    garden_size: 'Large rear garden (50ft)',
    furnished: 'Unfurnished',
    pets_allowed: true,
    smoking_allowed: false,
    broadband_speed: 'Superfast (67 Mbps)',
    heating_type: 'Gas central heating',
    double_glazing: true,
    alarm_system: true,
    energy_rating: 'C',
    reason_for_sale: 'Moving abroad for work',
    completion_timeline: '6-8 weeks',
    virtual_tour_url: 'https://my.matterport.com/show/?m=example1',
    status: 'active',
    seller_id,
    seller_name: 'John Smith',
    seller_email: 'john.smith@email.com',
    seller_phone: '+44 7123 456789',
    seller_response_time: 'Within 1 hour',
    agent_name: 'Richmond Estate Agents',
    agent_phone: '+44 20 8123 4567',
    agent_email: 'sales@richmondestate.co.uk',
    view_count: 12,
    save_count: 3,
    price_history: [
      { date: new Date().toISOString(), price: 850000, event: 'listed' },
    ],
    nearby_schools: [
      { name: 'Richmond Primary', type: 'Primary', distance: '0.3 miles', ofstedRating: 'Good' },
      { name: 'St. Mary\'s Catholic School', type: 'Secondary', distance: '0.7 miles', ofstedRating: 'Outstanding' },
    ],
    transport_links: [
      { type: 'Tube', name: 'Richmond Station', distance: '0.5 miles' },
      { type: 'Bus', name: 'Main Street', distance: '0.1 miles' },
    ],
  },
  {
    title: 'Luxury Penthouse in Central London',
    description: 'An exceptional penthouse apartment with panoramic city views, concierge service, and premium amenities. Located in the heart of Mayfair with easy access to Hyde Park.',
    price: 1200000,
    bedrooms: 2,
    bathrooms: 2,
    receptions: 1,
    property_type: 'flat',
    address: {
      line1: '456 Queen\'s Road',
      city: 'London',
      postcode: 'W1A 2AB',
      displayAddress: '456 Queen\'s Road, Mayfair, London W1A 2AB',
    },
    coordinates: { lat: 51.5138, lng: -0.0984 },
    images: [
      { url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b', caption: 'Luxury living room with city views' },
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', caption: 'Master bedroom suite' },
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', caption: 'Designer kitchen' },
      { url: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be', caption: 'Private terrace' },
    ],
    floor_plan: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
    key_features: ['24/7 Concierge', 'Private gym', 'Roof terrace', 'City views', 'Secure parking', 'Designer interiors'],
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
    garage: false,
    garden: false,
    garden_size: 'Private terrace (200 sq ft)',
    furnished: 'Part furnished',
    pets_allowed: false,
    smoking_allowed: false,
    broadband_speed: 'Ultrafast (1000 Mbps)',
    heating_type: 'Underfloor heating',
    double_glazing: true,
    alarm_system: true,
    energy_rating: 'A',
    reason_for_sale: 'Relocating abroad',
    completion_timeline: '3 months',
    virtual_tour_url: 'https://my.matterport.com/show/?m=example2',
    status: 'active',
    seller_id,
    seller_name: 'Jane Smith',
    seller_email: 'jane.smith@email.com',
    seller_phone: '+44 7987 654321',
    seller_response_time: 'Within 2 hours',
    agent_name: 'Mayfair Luxury Properties',
    agent_phone: '+44 20 7123 4567',
    agent_email: 'info@mayfairluxury.co.uk',
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
    title: 'Charming Coastal Cottage in Brighton',
    description: 'A delightful seaside cottage just minutes from the beach. Perfect for holiday lets or a peaceful coastal lifestyle. Recently renovated with modern comforts.',
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
      { url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae', caption: 'Charming cottage exterior' },
      { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858', caption: 'Cozy living space' },
      { url: 'https://images.unsplash.com/photo-1556909114-4f6e4d1a938c', caption: 'Compact kitchen' },
    ],
    floor_plan: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
    key_features: ['Beach access', 'Cottage garden', 'Quiet location', 'Period charm', 'Sea glimpses'],
    square_feet: 700,
    year_built: 2005,
    tenure: 'freehold',
    council_tax_band: 'C',
    epc_rating: 'B',
    epc_certificate_url: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    chain_free: true,
    parking_spaces: 1,
    garage: false,
    garden: true,
    garden_size: 'Small cottage garden',
    furnished: 'Fully furnished',
    pets_allowed: true,
    smoking_allowed: false,
    broadband_speed: 'Fast (35 Mbps)',
    heating_type: 'Electric heating',
    double_glazing: true,
    alarm_system: false,
    energy_rating: 'B',
    reason_for_sale: 'Downsizing to city apartment',
    completion_timeline: 'Immediate',
    virtual_tour_url: 'https://my.matterport.com/show/?m=example3',
    status: 'active',
    seller_id,
    seller_name: 'Bob Johnson',
    seller_email: 'bob.johnson@email.com',
    seller_phone: '+44 7456 789123',
    seller_response_time: 'Within 4 hours',
    agent_name: 'Brighton Coastal Properties',
    agent_phone: '+44 1273 123456',
    agent_email: 'hello@brightoncoastal.co.uk',
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
  {
    title: 'Modern Family Home in Manchester',
    description: 'A contemporary 3-bedroom house in a popular family area. Features include open-plan living, fitted kitchen, and private driveway. Perfect for growing families.',
    price: 275000,
    bedrooms: 3,
    bathrooms: 2,
    receptions: 1,
    property_type: 'house',
    address: {
      line1: '42 Maple Drive',
      city: 'Manchester',
      postcode: 'M14 5PQ',
      displayAddress: '42 Maple Drive, Manchester M14 5PQ',
    },
    coordinates: { lat: 53.4808, lng: -2.2426 },
    images: [
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', caption: 'Modern exterior' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', caption: 'Open-plan living' },
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', caption: 'Fitted kitchen' },
      { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', caption: 'Family bathroom' },
    ],
    floor_plan: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
    key_features: ['Open-plan living', 'Fitted kitchen', 'Family bathroom', 'Private driveway', 'Double glazing', 'Gas central heating'],
    square_feet: 1100,
    year_built: 2015,
    tenure: 'freehold',
    council_tax_band: 'D',
    epc_rating: 'B',
    epc_certificate_url: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    chain_free: true,
    parking_spaces: 2,
    garage: true,
    garden: true,
    garden_size: 'Medium rear garden',
    furnished: 'Unfurnished',
    pets_allowed: true,
    smoking_allowed: false,
    broadband_speed: 'Superfast (80 Mbps)',
    heating_type: 'Gas central heating',
    double_glazing: true,
    alarm_system: true,
    energy_rating: 'B',
    reason_for_sale: 'Upgrading to larger property',
    completion_timeline: '8-10 weeks',
    virtual_tour_url: 'https://my.matterport.com/show/?m=example4',
    status: 'active',
    seller_id,
    seller_name: 'Sarah Wilson',
    seller_email: 'sarah.wilson@email.com',
    seller_phone: '+44 7234 567890',
    seller_response_time: 'Within 3 hours',
    agent_name: 'Manchester Family Homes',
    agent_phone: '+44 161 234 5678',
    agent_email: 'info@manchesterfamily.co.uk',
    view_count: 15,
    save_count: 4,
    price_history: [
      { date: new Date().toISOString(), price: 275000, event: 'listed' },
    ],
    nearby_schools: [
      { name: 'Maple Primary School', type: 'Primary', distance: '0.2 miles', ofstedRating: 'Outstanding' },
      { name: 'Manchester High School', type: 'Secondary', distance: '0.8 miles', ofstedRating: 'Good' },
    ],
    transport_links: [
      { type: 'Bus', name: 'Maple Drive', distance: '0.1 miles' },
      { type: 'Tram', name: 'Didsbury Village', distance: '0.5 miles' },
    ],
  },
  {
    title: 'Elegant Georgian Townhouse in Bath',
    description: 'A stunning period townhouse in the heart of Bath. This Grade II listed property combines historical character with modern comfort and style.',
    price: 650000,
    bedrooms: 3,
    bathrooms: 2,
    receptions: 2,
    property_type: 'house',
    address: {
      line1: '18 Royal Crescent',
      city: 'Bath',
      postcode: 'BA1 2LR',
      displayAddress: '18 Royal Crescent, Bath BA1 2LR',
    },
    coordinates: { lat: 51.3862, lng: -2.3637 },
    images: [
      { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227', caption: 'Georgian facade' },
      { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2', caption: 'Period living room' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', caption: 'Master bedroom' },
      { url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e', caption: 'Period kitchen' },
    ],
    floor_plan: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
    key_features: ['Grade II listed', 'Period features', 'High ceilings', 'Sash windows', 'Central location', 'Historic character'],
    square_feet: 1400,
    year_built: 1800,
    tenure: 'freehold',
    council_tax_band: 'F',
    epc_rating: 'D',
    epc_certificate_url: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    chain_free: false,
    parking_spaces: 0,
    garage: false,
    garden: false,
    garden_size: 'Shared garden access',
    furnished: 'Unfurnished',
    pets_allowed: false,
    smoking_allowed: false,
    broadband_speed: 'Fast (40 Mbps)',
    heating_type: 'Gas central heating',
    double_glazing: false,
    alarm_system: true,
    energy_rating: 'D',
    reason_for_sale: 'Estate sale',
    completion_timeline: '12 weeks',
    virtual_tour_url: 'https://my.matterport.com/show/?m=example5',
    status: 'active',
    seller_id,
    seller_name: 'Estate of Margaret Thompson',
    seller_email: 'estate@solicitors.co.uk',
    seller_phone: '+44 1225 123456',
    seller_response_time: 'Within 24 hours',
    agent_name: 'Bath Heritage Properties',
    agent_phone: '+44 1225 654321',
    agent_email: 'sales@bathheritage.co.uk',
    view_count: 22,
    save_count: 7,
    price_history: [
      { date: new Date().toISOString(), price: 650000, event: 'listed' },
    ],
    nearby_schools: [
      { name: 'Bath Abbey Primary', type: 'Primary', distance: '0.3 miles', ofstedRating: 'Outstanding' },
      { name: 'Ralph Allen School', type: 'Secondary', distance: '1.2 miles', ofstedRating: 'Good' },
    ],
    transport_links: [
      { type: 'Bus', name: 'Royal Crescent', distance: '0.1 miles' },
      { type: 'Train', name: 'Bath Spa Station', distance: '0.8 miles' },
    ],
  },
  {
    title: 'Stylish Converted Warehouse Apartment',
    description: 'A unique loft-style apartment in a converted Victorian warehouse. Features exposed brick walls, high ceilings, and industrial-style windows.',
    price: 425000,
    bedrooms: 1,
    bathrooms: 1,
    receptions: 1,
    property_type: 'flat',
    address: {
      line1: '12 Industrial Way',
      city: 'Birmingham',
      postcode: 'B2 4QA',
      displayAddress: '12 Industrial Way, Birmingham B2 4QA',
    },
    coordinates: { lat: 52.4862, lng: -1.8904 },
    images: [
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688', caption: 'Industrial loft living' },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', caption: 'Open-plan bedroom area' },
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', caption: 'Modern kitchen' },
    ],
    floor_plan: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd',
    key_features: ['Exposed brick walls', 'High ceilings', 'Industrial windows', 'Open-plan living', 'City center location'],
    square_feet: 650,
    year_built: 1880,
    tenure: 'leasehold',
    leasehold_years: 99,
    ground_rent: 250,
    service_charge: 1200,
    council_tax_band: 'C',
    epc_rating: 'C',
    epc_certificate_url: 'https://www.gov.uk/government/collections/energy-performance-certificates',
    chain_free: true,
    parking_spaces: 0,
    garage: false,
    garden: false,
    garden_size: 'None',
    furnished: 'Part furnished',
    pets_allowed: true,
    smoking_allowed: false,
    broadband_speed: 'Superfast (100 Mbps)',
    heating_type: 'Electric heating',
    double_glazing: true,
    alarm_system: false,
    energy_rating: 'C',
    reason_for_sale: 'Buying larger property',
    completion_timeline: '4-6 weeks',
    virtual_tour_url: 'https://my.matterport.com/show/?m=example6',
    status: 'active',
    seller_id,
    seller_name: 'Mike Turner',
    seller_email: 'mike.turner@email.com',
    seller_phone: '+44 7345 678901',
    seller_response_time: 'Within 2 hours',
    agent_name: 'Birmingham City Properties',
    agent_phone: '+44 121 123 4567',
    agent_email: 'sales@birminghamcity.co.uk',
    view_count: 18,
    save_count: 6,
    price_history: [
      { date: new Date().toISOString(), price: 425000, event: 'listed' },
    ],
    nearby_schools: [
      { name: 'City Center Academy', type: 'Secondary', distance: '0.5 miles', ofstedRating: 'Good' },
    ],
    transport_links: [
      { type: 'Bus', name: 'Industrial Way', distance: '0.1 miles' },
      { type: 'Train', name: 'Birmingham New Street', distance: '0.3 miles' },
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

    console.log('Seeding completed successfully!');
    console.log(`Created ${listings.length} comprehensive property listings.`);
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seedListings();
