-- Update RLS policies to handle 'superseded' status

-- Update the existing policy to allow superseding requests
DROP POLICY IF EXISTS "Users can update their viewing requests" ON viewing_requests;

CREATE POLICY "Users can update their viewing requests" ON viewing_requests
  FOR UPDATE USING (
    -- Buyers can cancel their own requests or supersede them
    (auth.uid() = buyer_id AND status IN ('pending', 'confirmed')) OR
    -- Sellers can respond to pending requests
    (auth.uid() = seller_id AND status = 'pending')
  )
  WITH CHECK (
    -- Buyers can cancel or supersede
    (auth.uid() = buyer_id AND status IN ('cancelled', 'superseded')) OR
    -- Sellers can confirm or reject
    (auth.uid() = seller_id AND status IN ('confirmed', 'rejected'))
  );
