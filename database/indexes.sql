-- Performance Indexes for Viewing Requests and Offers

-- ============================================
-- VIEWING REQUESTS INDEXES
-- ============================================

-- Primary lookup by conversation
CREATE INDEX idx_viewing_requests_conversation_id ON viewing_requests(conversation_id);

-- Lookup by participants
CREATE INDEX idx_viewing_requests_buyer_id ON viewing_requests(buyer_id);
CREATE INDEX idx_viewing_requests_seller_id ON viewing_requests(seller_id);

-- Status filtering
CREATE INDEX idx_viewing_requests_status ON viewing_requests(status);

-- Property lookup
CREATE INDEX idx_viewing_requests_property_id ON viewing_requests(property_id);

-- Date-based queries
CREATE INDEX idx_viewing_requests_requested_date ON viewing_requests(requested_date);
CREATE INDEX idx_viewing_requests_created_at ON viewing_requests(created_at);

-- Composite index for active requests
CREATE INDEX idx_viewing_requests_active ON viewing_requests(conversation_id, status) 
  WHERE status IN ('pending', 'confirmed');

-- ============================================
-- OFFERS INDEXES
-- ============================================

-- Primary lookup by conversation
CREATE INDEX idx_offers_conversation_id ON offers(conversation_id);

-- Lookup by participants
CREATE INDEX idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX idx_offers_seller_id ON offers(seller_id);

-- Status filtering
CREATE INDEX idx_offers_status ON offers(status);

-- Property lookup
CREATE INDEX idx_offers_property_id ON offers(property_id);

-- Amount-based queries (for analytics)
CREATE INDEX idx_offers_amount ON offers(amount);

-- Date-based queries
CREATE INDEX idx_offers_created_at ON offers(created_at);
CREATE INDEX idx_offers_expires_at ON offers(expires_at) WHERE expires_at IS NOT NULL;

-- Composite index for active offers
CREATE INDEX idx_offers_active ON offers(conversation_id, status) 
  WHERE status IN ('pending', 'accepted');

-- Composite index for latest offers per conversation
CREATE INDEX idx_offers_conversation_latest ON offers(conversation_id, created_at DESC);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON INDEX idx_viewing_requests_conversation_id IS 'Fast lookup of viewing requests by conversation';
COMMENT ON INDEX idx_viewing_requests_active IS 'Optimized for finding active viewing requests';
COMMENT ON INDEX idx_offers_conversation_id IS 'Fast lookup of offers by conversation';
COMMENT ON INDEX idx_offers_active IS 'Optimized for finding active offers';
COMMENT ON INDEX idx_offers_conversation_latest IS 'Optimized for finding latest offers per conversation';
