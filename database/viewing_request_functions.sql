-- Function to handle viewing request creation with automatic cancellation of existing requests
-- This ensures atomicity and avoids constraint violations

CREATE OR REPLACE FUNCTION create_viewing_request_with_cancel(
  p_conversation_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID,
  p_property_id UUID,
  p_preferred_date DATE,
  p_preferred_time TIME,
  p_message TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  conversation_id UUID,
  buyer_id UUID,
  seller_id UUID,
  property_id UUID,
  preferred_date DATE,
  preferred_time TIME,
  message TEXT,
  status VARCHAR(20),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, cancel any existing active requests for this conversation
  UPDATE viewing_requests 
  SET 
    status = 'cancelled',
    updated_at = NOW()
  WHERE 
    viewing_requests.conversation_id = p_conversation_id 
    AND viewing_requests.status IN ('pending', 'confirmed');

  -- Then create the new request
  RETURN QUERY
  INSERT INTO viewing_requests (
    conversation_id,
    buyer_id,
    seller_id,
    property_id,
    preferred_date,
    preferred_time,
    message,
    status
  )
  VALUES (
    p_conversation_id,
    p_buyer_id,
    p_seller_id,
    p_property_id,
    p_preferred_date,
    p_preferred_time,
    p_message,
    'pending'
  )
  RETURNING 
    viewing_requests.id,
    viewing_requests.conversation_id,
    viewing_requests.buyer_id,
    viewing_requests.seller_id,
    viewing_requests.property_id,
    viewing_requests.preferred_date,
    viewing_requests.preferred_time,
    viewing_requests.message,
    viewing_requests.status,
    viewing_requests.created_at,
    viewing_requests.updated_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_viewing_request_with_cancel TO authenticated;

-- Alternative function using a more direct approach to handle conflicts
CREATE OR REPLACE FUNCTION handle_viewing_request_conflict(
  p_conversation_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID,
  p_property_id UUID,
  p_preferred_date DATE,
  p_preferred_time TIME,
  p_message TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  conversation_id UUID,
  buyer_id UUID,
  seller_id UUID,
  property_id UUID,
  preferred_date DATE,
  preferred_time TIME,
  message TEXT,
  status VARCHAR(20),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_id UUID;
BEGIN
  -- Find any existing active request
  SELECT viewing_requests.id INTO existing_id
  FROM viewing_requests 
  WHERE viewing_requests.conversation_id = p_conversation_id 
    AND viewing_requests.status IN ('pending', 'confirmed')
  LIMIT 1;

  -- If exists, update it
  IF existing_id IS NOT NULL THEN
    RETURN QUERY
    UPDATE viewing_requests 
    SET 
      preferred_date = p_preferred_date,
      preferred_time = p_preferred_time,
      message = p_message,
      status = 'pending',
      updated_at = NOW()
    WHERE viewing_requests.id = existing_id
    RETURNING 
      viewing_requests.id,
      viewing_requests.conversation_id,
      viewing_requests.buyer_id,
      viewing_requests.seller_id,
      viewing_requests.property_id,
      viewing_requests.preferred_date,
      viewing_requests.preferred_time,
      viewing_requests.message,
      viewing_requests.status,
      viewing_requests.created_at,
      viewing_requests.updated_at;
  ELSE
    -- If not exists, create new
    RETURN QUERY
    INSERT INTO viewing_requests (
      conversation_id,
      buyer_id,
      seller_id,
      property_id,
      preferred_date,
      preferred_time,
      message,
      status
    )
    VALUES (
      p_conversation_id,
      p_buyer_id,
      p_seller_id,
      p_property_id,
      p_preferred_date,
      p_preferred_time,
      p_message,
      'pending'
    )
    RETURNING 
      viewing_requests.id,
      viewing_requests.conversation_id,
      viewing_requests.buyer_id,
      viewing_requests.seller_id,
      viewing_requests.property_id,
      viewing_requests.preferred_date,
      viewing_requests.preferred_time,
      viewing_requests.message,
      viewing_requests.status,
      viewing_requests.created_at,
      viewing_requests.updated_at;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION handle_viewing_request_conflict TO authenticated;
