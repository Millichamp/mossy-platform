import { Router } from 'express';
import { supabase } from '../../lib/supabaseClient';

const router = Router();

// Get all listings
router.get('/', async (req, res) => {
  const { seller_id } = req.query;
  let query = supabase.from('listings').select('*');
  if (seller_id) {
    query = query.eq('seller_id', seller_id);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get listing by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
  if (error || !data) return res.status(404).json({ error: error?.message || 'Listing not found' });
  res.json(data);
});

// Create listing
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('listings').insert([req.body]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Submit multi-step property listing form
router.post('/submit', async (req, res) => {
  try {
    console.log('Received form submission:', JSON.stringify(req.body, null, 2));
    
    const {
      // Step 1: Basic Details
      title,
      propertyType,
      bedrooms,
      bathrooms,
      receptions,
      
      // Step 2: Location & Address (these come as separate fields)
      postcode,
      line1,
      city,
      displayAddress,
      lat,
      lng,
      
      // Step 3: Specifications
      price,
      squareFeet,
      tenure,
      councilTaxBand,
      epcRating,
      leaseholdYears,
      groundRent,
      serviceCharge,
      
      // Step 4: Description & Features
      description,
      keyFeatures,
      reasonForSale,
      completionTimeline,
      
      // Step 5: Photos & Media
      images,
      floorPlan,
      virtualTourUrl,
      
      // Step 6: Additional data
      seller_id,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!title || !propertyType || !bedrooms || !bathrooms || !price || !description) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, propertyType, bedrooms, bathrooms, price, description' 
      });
    }

    // Prepare listing data for database (matching clean schema)
    const listingData: any = {
      title,
      description,
      price: parseInt(price),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      receptions: parseInt(receptions || 0),
      property_type: propertyType,
      seller_id,
      status,
      listed_date: new Date().toISOString(),
      view_count: 0,
      save_count: 0,
      chain_free: false, // TODO: Add to form
      parking_spaces: 0, // TODO: Add to form
      price_history: JSON.stringify([
        {
          date: new Date().toISOString(),
          price: parseInt(price),
          event: 'listed'
        }
      ])
    };

    // Add optional fields only if they exist
    if (line1 || city || postcode) {
      listingData.address = JSON.stringify({
        line1: line1 || '',
        city: city || '',
        postcode: postcode || '',
        displayAddress: displayAddress || line1 || ''
      });
    }

    if (images && images.length > 0) {
      listingData.images = JSON.stringify(images);
    }

    if (floorPlan) {
      listingData.floor_plan = floorPlan;
    }

    if (squareFeet) {
      listingData.square_feet = parseInt(squareFeet);
    }

    if (tenure) {
      listingData.tenure = tenure;
    }

    if (councilTaxBand) {
      listingData.council_tax_band = councilTaxBand;
    }

    if (epcRating) {
      listingData.epc_rating = epcRating;
    }

    if (keyFeatures && keyFeatures.length > 0) {
      listingData.key_features = JSON.stringify(keyFeatures);
    }

    if (virtualTourUrl) {
      listingData.virtual_tour_url = virtualTourUrl;
    }

    if (reasonForSale) {
      listingData.reason_for_sale = reasonForSale;
    }

    if (completionTimeline) {
      listingData.completion_timeline = completionTimeline;
    }

    if (lat && lng) {
      listingData.coordinates = JSON.stringify({
        lat: lat,
        lng: lng
      });
    }

    // Leasehold fields
    if (leaseholdYears) {
      listingData.leasehold_years = parseInt(leaseholdYears);
    }

    if (groundRent) {
      listingData.ground_rent = parseFloat(groundRent);
    }

    if (serviceCharge) {
      listingData.service_charge = parseFloat(serviceCharge);
    }

    console.log('Prepared listing data:', JSON.stringify(listingData, null, 2));

    const { data, error } = await supabase
      .from('listings')
      .insert([listingData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log('Successfully inserted listing:', data);
    res.status(201).json({ 
      message: 'Property listing submitted successfully',
      listing: data 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update listing
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { seller_id, ...updateData } = req.body;
    
    // First, check if the listing exists and get current data
    const { data: existingListing, error: fetchError } = await supabase
      .from('listings')
      .select('seller_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    // Verify that the seller_id matches the existing listing's seller_id
    if (seller_id && seller_id !== existingListing.seller_id) {
      return res.status(403).json({ error: 'Unauthorized: You can only edit your own listings' });
    }
    
    // Process the update data similar to the create endpoint
    const processedData: any = {};
    
    // Handle basic fields
    if (updateData.title) processedData.title = updateData.title;
    if (updateData.description) processedData.description = updateData.description;
    if (updateData.price) processedData.price = parseInt(updateData.price);
    if (updateData.bedrooms) processedData.bedrooms = parseInt(updateData.bedrooms);
    if (updateData.bathrooms) processedData.bathrooms = parseInt(updateData.bathrooms);
    if (updateData.receptions) processedData.receptions = parseInt(updateData.receptions);
    if (updateData.propertyType) processedData.property_type = updateData.propertyType;
    if (updateData.status) processedData.status = updateData.status;
    
    // Handle JSON fields
    if (updateData.images) processedData.images = JSON.stringify(updateData.images);
    if (updateData.floorPlan) processedData.floor_plan = updateData.floorPlan;
    if (updateData.keyFeatures) processedData.key_features = JSON.stringify(updateData.keyFeatures);
    if (updateData.address) processedData.address = JSON.stringify(updateData.address);
    if (updateData.coordinates) processedData.coordinates = JSON.stringify(updateData.coordinates);
    
    // Handle optional fields
    if (updateData.squareFeet) processedData.square_feet = parseInt(updateData.squareFeet);
    if (updateData.tenure) processedData.tenure = updateData.tenure;
    if (updateData.councilTaxBand) processedData.council_tax_band = updateData.councilTaxBand;
    if (updateData.epcRating) processedData.epc_rating = updateData.epcRating;
    if (updateData.virtualTourUrl) processedData.virtual_tour_url = updateData.virtualTourUrl;
    if (updateData.reasonForSale) processedData.reason_for_sale = updateData.reasonForSale;
    if (updateData.completionTimeline) processedData.completion_timeline = updateData.completionTimeline;
    if (updateData.leaseholdYears) processedData.leasehold_years = parseInt(updateData.leaseholdYears);
    if (updateData.groundRent) processedData.ground_rent = parseFloat(updateData.groundRent);
    if (updateData.serviceCharge) processedData.service_charge = parseFloat(updateData.serviceCharge);
    
    // Handle additional fields for editing
    if (updateData.yearBuilt) processedData.year_built = parseInt(updateData.yearBuilt);
    if (updateData.parkingSpaces) processedData.parking_spaces = parseInt(updateData.parkingSpaces);
    if (updateData.garden !== undefined) processedData.garden = updateData.garden === 'Yes' || updateData.garden === true;
    if (updateData.furnished) processedData.furnished = updateData.furnished;
    if (updateData.contactName) processedData.contact_name = updateData.contactName;
    if (updateData.contactPhone) processedData.contact_phone = updateData.contactPhone;
    if (updateData.contactEmail) processedData.contact_email = updateData.contactEmail;
    
    // Update the listing
    const { data, error } = await supabase
      .from('listings')
      .update(processedData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return res.status(400).json({ error: error.message });
    }
    
    console.log('Successfully updated listing:', data);
    res.json({ 
      message: 'Listing updated successfully',
      listing: data 
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete listing
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});

export default router;
