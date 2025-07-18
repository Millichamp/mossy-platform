-- Clean up duplicate columns in listings table
-- Run these commands in Supabase SQL Editor

-- Step 1: Add missing snake_case columns if they don't exist
ALTER TABLE listings ADD COLUMN IF NOT EXISTS epc_rating TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS council_tax_band TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS completion_timeline TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS ground_rent NUMERIC;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS key_features JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS listed_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS nearby_schools JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS price_history JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS reason_for_sale TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_response_time TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS service_charge NUMERIC;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS square_feet INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS transport_links JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS epc_certificate_url TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS chain_free BOOLEAN DEFAULT false;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS parking_spaces INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS leasehold_years INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS property_type TEXT;

-- Step 2: Migrate data from camelCase columns to snake_case columns (if camelCase columns exist)
-- This will only run if the camelCase columns exist
DO $$
BEGIN
  -- Migrate epcRating to epc_rating
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'epcRating') THEN
    EXECUTE 'UPDATE listings SET epc_rating = COALESCE(epc_rating, "epcRating")';
  END IF;
  
  -- Migrate councilTaxBand to council_tax_band
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'councilTaxBand') THEN
    EXECUTE 'UPDATE listings SET council_tax_band = COALESCE(council_tax_band, "councilTaxBand")';
  END IF;
  
  -- Migrate completionTimeline to completion_timeline
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'completionTimeline') THEN
    EXECUTE 'UPDATE listings SET completion_timeline = COALESCE(completion_timeline, "completionTimeline")';
  END IF;
  
  -- Migrate groundRent to ground_rent
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'groundRent') THEN
    EXECUTE 'UPDATE listings SET ground_rent = COALESCE(ground_rent, CAST("groundRent" AS NUMERIC))';
  END IF;
  
  -- Migrate keyFeatures to key_features
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'keyFeatures') THEN
    EXECUTE 'UPDATE listings SET key_features = COALESCE(key_features, CAST("keyFeatures" AS JSONB))';
  END IF;
  
  -- Migrate listedDate to listed_date
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'listedDate') THEN
    EXECUTE 'UPDATE listings SET listed_date = COALESCE(listed_date, CAST("listedDate" AS TIMESTAMP WITH TIME ZONE))';
  END IF;
  
  -- Migrate nearbySchools to nearby_schools
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'nearbySchools') THEN
    EXECUTE 'UPDATE listings SET nearby_schools = COALESCE(nearby_schools, CAST("nearbySchools" AS JSONB))';
  END IF;
  
  -- Migrate priceHistory to price_history
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'priceHistory') THEN
    EXECUTE 'UPDATE listings SET price_history = COALESCE(price_history, CAST("priceHistory" AS JSONB))';
  END IF;
  
  -- Migrate reasonForSale to reason_for_sale
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'reasonForSale') THEN
    EXECUTE 'UPDATE listings SET reason_for_sale = COALESCE(reason_for_sale, "reasonForSale")';
  END IF;
  
  -- Migrate saveCount to save_count
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'saveCount') THEN
    EXECUTE 'UPDATE listings SET save_count = COALESCE(save_count, CAST("saveCount" AS INTEGER))';
  END IF;
  
  -- Migrate sellerName to seller_name
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'sellerName') THEN
    EXECUTE 'UPDATE listings SET seller_name = COALESCE(seller_name, "sellerName")';
  END IF;
  
  -- Migrate sellerResponseTime to seller_response_time
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'sellerResponseTime') THEN
    EXECUTE 'UPDATE listings SET seller_response_time = COALESCE(seller_response_time, "sellerResponseTime")';
  END IF;
  
  -- Migrate serviceCharge to service_charge
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'serviceCharge') THEN
    EXECUTE 'UPDATE listings SET service_charge = COALESCE(service_charge, CAST("serviceCharge" AS NUMERIC))';
  END IF;
  
  -- Migrate squareFeet to square_feet
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'squareFeet') THEN
    EXECUTE 'UPDATE listings SET square_feet = COALESCE(square_feet, CAST("squareFeet" AS INTEGER))';
  END IF;
  
  -- Migrate transportLinks to transport_links
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'transportLinks') THEN
    EXECUTE 'UPDATE listings SET transport_links = COALESCE(transport_links, CAST("transportLinks" AS JSONB))';
  END IF;
  
  -- Migrate viewCount to view_count
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'viewCount') THEN
    EXECUTE 'UPDATE listings SET view_count = COALESCE(view_count, CAST("viewCount" AS INTEGER))';
  END IF;
  
  -- Migrate virtualTourUrl to virtual_tour_url
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'virtualTourUrl') THEN
    EXECUTE 'UPDATE listings SET virtual_tour_url = COALESCE(virtual_tour_url, "virtualTourUrl")';
  END IF;
  
  -- Migrate yearBuilt to year_built
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'yearBuilt') THEN
    EXECUTE 'UPDATE listings SET year_built = COALESCE(year_built, CAST("yearBuilt" AS INTEGER))';
  END IF;
  
  -- Migrate epcCertificateUrl to epc_certificate_url
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'epcCertificateUrl') THEN
    EXECUTE 'UPDATE listings SET epc_certificate_url = COALESCE(epc_certificate_url, "epcCertificateUrl")';
  END IF;
  
  -- Migrate chainFree to chain_free
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'chainFree') THEN
    EXECUTE 'UPDATE listings SET chain_free = COALESCE(chain_free, CAST("chainFree" AS BOOLEAN))';
  END IF;
  
END $$;

-- Step 3: Drop the duplicate camelCase columns (if they exist)
ALTER TABLE listings DROP COLUMN IF EXISTS "epcRating";
ALTER TABLE listings DROP COLUMN IF EXISTS "councilTaxBand";
ALTER TABLE listings DROP COLUMN IF EXISTS "completionTimeline";
ALTER TABLE listings DROP COLUMN IF EXISTS "groundRent";
ALTER TABLE listings DROP COLUMN IF EXISTS "keyFeatures";
ALTER TABLE listings DROP COLUMN IF EXISTS "listedDate";
ALTER TABLE listings DROP COLUMN IF EXISTS "nearbySchools";
ALTER TABLE listings DROP COLUMN IF EXISTS "priceHistory";
ALTER TABLE listings DROP COLUMN IF EXISTS "reasonForSale";
ALTER TABLE listings DROP COLUMN IF EXISTS "saveCount";
ALTER TABLE listings DROP COLUMN IF EXISTS "sellerName";
ALTER TABLE listings DROP COLUMN IF EXISTS "sellerResponseTime";
ALTER TABLE listings DROP COLUMN IF EXISTS "serviceCharge";
ALTER TABLE listings DROP COLUMN IF EXISTS "squareFeet";
ALTER TABLE listings DROP COLUMN IF EXISTS "transportLinks";
ALTER TABLE listings DROP COLUMN IF EXISTS "viewCount";
ALTER TABLE listings DROP COLUMN IF EXISTS "virtualTourUrl";
ALTER TABLE listings DROP COLUMN IF EXISTS "yearBuilt";
ALTER TABLE listings DROP COLUMN IF EXISTS "epcCertificateUrl";
ALTER TABLE listings DROP COLUMN IF EXISTS "chainFree";

-- Step 4: Clean up other inconsistencies
ALTER TABLE listings DROP COLUMN IF EXISTS "city";
ALTER TABLE listings DROP COLUMN IF EXISTS "postcode";
ALTER TABLE listings DROP COLUMN IF EXISTS "features";
ALTER TABLE listings DROP COLUMN IF EXISTS "parking";
ALTER TABLE listings DROP COLUMN IF EXISTS "created_at";

-- Step 5: Ensure all required columns exist with correct data types
-- Set default values for existing rows if columns were just added
UPDATE listings SET 
  chain_free = COALESCE(chain_free, false),
  parking_spaces = COALESCE(parking_spaces, 0),
  save_count = COALESCE(save_count, 0),
  view_count = COALESCE(view_count, 0),
  listed_date = COALESCE(listed_date, NOW())
WHERE chain_free IS NULL OR parking_spaces IS NULL OR save_count IS NULL OR view_count IS NULL OR listed_date IS NULL;
