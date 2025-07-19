-- Update the viewing requests status management
-- Add 'superseded' status to handle multiple requests properly

-- First, add 'superseded' to the status check constraint
ALTER TABLE viewing_requests DROP CONSTRAINT IF EXISTS viewing_requests_status_check;
ALTER TABLE viewing_requests ADD CONSTRAINT viewing_requests_status_check 
  CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'superseded'));

-- Update the status comment to include all valid statuses
COMMENT ON COLUMN viewing_requests.status IS 'Current status: pending, confirmed, rejected, cancelled, completed, superseded';

-- The constraint should remain the same - only one pending or confirmed request per conversation
-- 'superseded' requests don't count as active, so they don't trigger the constraint

-- Status transition rules:
-- pending -> confirmed (seller accepts)
-- pending -> rejected (seller declines)  
-- pending -> cancelled (buyer cancels)
-- pending -> superseded (buyer makes new request)
-- confirmed -> cancelled (buyer cancels after confirmation)
-- Any status -> superseded (when buyer makes newer request)

-- This approach preserves the full conversation history while preventing constraint violations
