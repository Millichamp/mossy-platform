-- Row Level Security (RLS) Policies
-- Ensures users can only access viewing requests and offers for their own conversations

-- ============================================
-- VIEWING REQUESTS RLS
-- ============================================

-- Enable RLS on viewing_requests table
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view viewing requests where they are either buyer or seller
CREATE POLICY "Users can view their viewing requests" ON viewing_requests
  FOR SELECT USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id
  );

-- Policy: Only buyers can create viewing requests
CREATE POLICY "Buyers can create viewing requests" ON viewing_requests
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id AND
    -- Ensure the user is actually the buyer in the conversation
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND buyer_id = auth.uid()
    )
  );

-- Policy: Buyers can update their own requests (cancel), sellers can respond
CREATE POLICY "Users can update their viewing requests" ON viewing_requests
  FOR UPDATE USING (
    -- Buyers can cancel their own requests
    (auth.uid() = buyer_id AND status = 'pending') OR
    -- Sellers can respond to requests
    (auth.uid() = seller_id AND status = 'pending')
  )
  WITH CHECK (
    -- Buyers can only cancel
    (auth.uid() = buyer_id AND status IN ('cancelled')) OR
    -- Sellers can confirm or reject
    (auth.uid() = seller_id AND status IN ('confirmed', 'rejected'))
  );

-- Policy: Only buyers can delete (cancel) their requests
CREATE POLICY "Buyers can delete their viewing requests" ON viewing_requests
  FOR DELETE USING (
    auth.uid() = buyer_id AND 
    status = 'pending'
  );

-- ============================================
-- OFFERS RLS
-- ============================================

-- Enable RLS on offers table
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view offers where they are either buyer or seller
CREATE POLICY "Users can view their offers" ON offers
  FOR SELECT USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id
  );

-- Policy: Only buyers can create offers
CREATE POLICY "Buyers can create offers" ON offers
  FOR INSERT WITH CHECK (
    auth.uid() = buyer_id AND
    -- Ensure the user is actually the buyer in the conversation
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND buyer_id = auth.uid()
    )
  );

-- Policy: Buyers can update their own offers (withdraw), sellers can respond
CREATE POLICY "Users can update their offers" ON offers
  FOR UPDATE USING (
    -- Buyers can withdraw their own offers
    (auth.uid() = buyer_id AND status = 'pending') OR
    -- Sellers can respond to offers
    (auth.uid() = seller_id AND status = 'pending')
  )
  WITH CHECK (
    -- Buyers can only withdraw
    (auth.uid() = buyer_id AND status IN ('withdrawn')) OR
    -- Sellers can accept or reject
    (auth.uid() = seller_id AND status IN ('accepted', 'rejected'))
  );

-- Policy: Only buyers can delete (withdraw) their offers
CREATE POLICY "Buyers can delete their offers" ON offers
  FOR DELETE USING (
    auth.uid() = buyer_id AND 
    status = 'pending'
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is participant in conversation
CREATE OR REPLACE FUNCTION is_conversation_participant(conversation_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_uuid 
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Users can view their viewing requests" ON viewing_requests IS 
  'Users can only see viewing requests where they are buyer or seller';

COMMENT ON POLICY "Buyers can create viewing requests" ON viewing_requests IS 
  'Only conversation buyers can create viewing requests';

COMMENT ON POLICY "Users can view their offers" ON offers IS 
  'Users can only see offers where they are buyer or seller';

COMMENT ON POLICY "Buyers can create offers" ON offers IS 
  'Only conversation buyers can create offers';

COMMENT ON FUNCTION is_conversation_participant(UUID) IS 
  'Helper function to check if current user is participant in conversation';
