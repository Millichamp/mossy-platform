-- Offers Table
-- This table manages property purchase offers between buyers and sellers

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Offer details
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  
  -- Messages between parties
  buyer_message TEXT,
  seller_message TEXT,
  
  -- Counter offer functionality
  counter_offer_amount DECIMAL(10,2) CHECK (counter_offer_amount > 0),
  
  -- Expiration (optional)
  expires_at TIMESTAMPTZ,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints to ensure data integrity
  CONSTRAINT offer_amount_reasonable CHECK (amount >= 1000 AND amount <= 50000000), -- £1K to £50M
  CONSTRAINT offer_counter_amount_reasonable CHECK (
    counter_offer_amount IS NULL OR 
    (counter_offer_amount >= 1000 AND counter_offer_amount <= 50000000)
  ),
  CONSTRAINT offer_expiry_future CHECK (expires_at IS NULL OR expires_at > created_at),
  
  -- Only one active offer per conversation
  CONSTRAINT offer_unique_active UNIQUE (conversation_id, status) 
    WHERE status IN ('pending', 'accepted')
);

-- Add comments for documentation
COMMENT ON TABLE offers IS 'Manages property purchase offers between buyers and sellers';
COMMENT ON COLUMN offers.amount IS 'Offer amount in GBP (minimum £1,000, maximum £50,000,000)';
COMMENT ON COLUMN offers.status IS 'Current status: pending, accepted, rejected, withdrawn';
COMMENT ON COLUMN offers.buyer_message IS 'Optional message from buyer with offer';
COMMENT ON COLUMN offers.seller_message IS 'Optional response message from seller';
COMMENT ON COLUMN offers.counter_offer_amount IS 'Counter offer amount suggested by seller';
COMMENT ON COLUMN offers.expires_at IS 'Optional expiration date for the offer';
