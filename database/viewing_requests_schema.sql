-- Viewing Requests Table
-- This table manages property viewing requests between buyers and sellers

CREATE TABLE viewing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Status management
  status TEXT CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')) DEFAULT 'pending',
  
  -- Date and time information
  requested_date TIMESTAMPTZ NOT NULL,
  confirmed_date TIMESTAMPTZ,
  
  -- Messages between parties
  buyer_message TEXT,
  seller_message TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints to ensure data integrity
  CONSTRAINT viewing_request_future_date CHECK (requested_date > NOW()),
  CONSTRAINT viewing_request_confirmed_date_valid CHECK (
    (status = 'confirmed' AND confirmed_date IS NOT NULL) OR 
    (status != 'confirmed' AND confirmed_date IS NULL)
  ),
  
  -- Only one active viewing request per conversation
  CONSTRAINT viewing_request_unique_active UNIQUE (conversation_id, status) 
    WHERE status IN ('pending', 'confirmed')
);

-- Add comments for documentation
COMMENT ON TABLE viewing_requests IS 'Manages property viewing requests between buyers and sellers';
COMMENT ON COLUMN viewing_requests.status IS 'Current status: pending, confirmed, rejected, cancelled';
COMMENT ON COLUMN viewing_requests.requested_date IS 'Date and time requested by buyer';
COMMENT ON COLUMN viewing_requests.confirmed_date IS 'Date and time confirmed by seller (if accepted)';
COMMENT ON COLUMN viewing_requests.buyer_message IS 'Optional message from buyer with request';
COMMENT ON COLUMN viewing_requests.seller_message IS 'Optional response message from seller';
