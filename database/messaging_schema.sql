-- Enhanced database schema for messaging system
-- Building on existing structure

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id),
  seller_id UUID REFERENCES auth.users(id),
  
  -- Conversation metadata
  status VARCHAR(20) DEFAULT 'active', -- active, archived, blocked
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,
  
  -- Unread tracking
  buyer_unread_count INTEGER DEFAULT 0,
  seller_unread_count INTEGER DEFAULT 0,
  
  -- Archive flags (for hiding without deleting)
  buyer_archived BOOLEAN DEFAULT false,
  seller_archived BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique conversation per property-buyer pair
  UNIQUE(property_id, buyer_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  
  -- Message content
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- text, system, offer_related
  
  -- Message status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- For soft delete if needed later
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_conversations_buyer ON conversations(buyer_id, status);
CREATE INDEX idx_conversations_seller ON conversations(seller_id, status);
CREATE INDEX idx_conversations_property ON conversations(property_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = false;
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- RLS Policies for security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only access conversations they're part of
CREATE POLICY "conversation_access" ON conversations
FOR ALL USING (
  auth.uid() = buyer_id OR auth.uid() = seller_id
);

-- Users can only access messages in conversations they're part of
CREATE POLICY "message_access" ON messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_id 
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- Only allow users to send messages in their conversations
CREATE POLICY "message_insert" ON messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_id 
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);
