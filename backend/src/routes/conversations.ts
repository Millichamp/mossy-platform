import { Router } from 'express';
import { supabase } from '../../lib/supabaseClient';

const router = Router();

// Middleware to extract user ID from request (simplified for now)
// In production, you'd validate JWT tokens properly
const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  
  // Extract user ID from Authorization header (Bearer token format)
  // For now, we'll expect the user ID directly for simplicity
  const userId = authHeader.replace('Bearer ', '');
  req.userId = userId;
  next();
};

// Start a new conversation or get existing one
router.post('/', requireAuth, async (req: any, res) => {
  try {
    const { propertyId, initialMessage } = req.body;
    const buyerId = req.userId;

    if (!propertyId || !initialMessage) {
      return res.status(400).json({ error: 'propertyId and initialMessage are required' });
    }

    // Get property and seller info
    const { data: property, error: propertyError } = await supabase
      .from('listings')
      .select('seller_id, title')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.seller_id === buyerId) {
      return res.status(400).json({ error: 'Cannot start conversation with yourself' });
    }

    // Check if conversation already exists
    let { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('property_id', propertyId)
      .eq('buyer_id', buyerId)
      .single();

    // Create new conversation if it doesn't exist
    if (!conversation) {
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert([{
          property_id: propertyId,
          buyer_id: buyerId,
          seller_id: property.seller_id
        }])
        .select()
        .single();

      if (createError) {
        return res.status(400).json({ error: createError.message });
      }

      conversation = newConversation;
    }

    // Add initial message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversation.id,
        sender_id: buyerId,
        content: initialMessage
      }])
      .select('*')
      .single();

    if (messageError) {
      return res.status(400).json({ error: messageError.message });
    }

    // Update conversation with last message info
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: initialMessage.substring(0, 100),
        seller_unread_count: 1
      })
      .eq('id', conversation.id);

    res.status(201).json({ conversation, message });

  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's conversations
router.get('/', requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { role = 'buyer', status = 'active', propertyId } = req.query;

    let query = supabase
      .from('conversations')
      .select(`
        *,
        property:listings(id, title, images, price, address, bedrooms, bathrooms, property_type, receptions, parking_spaces),
        viewing_requests(id, status, preferred_date, preferred_time, message, created_at, updated_at)
      `)
      .eq('status', status)
      .order('last_message_at', { ascending: false });

    // Filter by user role
    if (role === 'buyer') {
      query = query.eq('buyer_id', userId);
      if (status === 'archived') {
        query = query.eq('buyer_archived', true);
      } else {
        query = query.eq('buyer_archived', false);
      }
    } else {
      query = query.eq('seller_id', userId);
      if (status === 'archived') {
        query = query.eq('seller_archived', true);
      } else {
        query = query.eq('seller_archived', false);
      }
    }

    // Filter by property if specified
    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Debug: Log the first conversation to see the data structure
    if (data && data.length > 0) {
      console.log('Sample conversation data:', JSON.stringify(data[0], null, 2));
    }

    res.json(data);

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a conversation
router.get('/:conversationId/messages', requireAuth, async (req: any, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;
    const { page = 1, limit = 50 } = req.query;

    // Verify user has access to this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (!conversation || (conversation.buyer_id !== userId && conversation.seller_id !== userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Reverse to show oldest first for chat display
    messages.reverse();

    res.json(messages);

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a message
router.post('/:conversationId/messages', requireAuth, async (req: any, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;
    const { content, messageType = 'text' } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user has access to this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (!conversation || (conversation.buyer_id !== userId && conversation.seller_id !== userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
        message_type: messageType
      }])
      .select('*')
      .single();

    if (messageError) {
      return res.status(400).json({ error: messageError.message });
    }

    // Update conversation metadata
    const updateData: any = {
      last_message_at: new Date().toISOString(),
      last_message_preview: content.substring(0, 100)
    };

    // Get current conversation to increment unread count
    const { data: currentConversation } = await supabase
      .from('conversations')
      .select('buyer_unread_count, seller_unread_count')
      .eq('id', conversationId)
      .single();

    // Increment unread count for recipient
    if (userId === conversation.buyer_id) {
      updateData.seller_unread_count = (currentConversation?.seller_unread_count || 0) + 1;
    } else {
      updateData.buyer_unread_count = (currentConversation?.buyer_unread_count || 0) + 1;
    }

    await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);

    res.status(201).json(message);

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark messages as read
router.put('/:conversationId/mark-read', requireAuth, async (req: any, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Verify user has access to this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (!conversation || (conversation.buyer_id !== userId && conversation.seller_id !== userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark all unread messages as read for this user
    await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    // Reset unread count for this user
    const updateData = userId === conversation.buyer_id 
      ? { buyer_unread_count: 0 }
      : { seller_unread_count: 0 };

    await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);

    res.json({ success: true });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all conversations for messages page (both as buyer and seller)
router.get('/all', requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { status = 'active' } = req.query;

    // Get conversations where user is buyer
    const { data: buyerConversations, error: buyerError } = await supabase
      .from('conversations')
      .select(`
        *,
        property:listings(id, title, images, price, address, bedrooms, bathrooms, property_type, receptions, parking_spaces),
        viewing_requests(id, status, preferred_date, preferred_time, message, created_at, updated_at)
      `)
      .eq('buyer_id', userId)
      .eq('status', status)
      .eq('buyer_archived', false);

    if (buyerError) {
      return res.status(500).json({ error: buyerError.message });
    }

    // Get conversations where user is seller
    const { data: sellerConversations, error: sellerError } = await supabase
      .from('conversations')
      .select(`
        *,
        property:listings(id, title, images, price, address, bedrooms, bathrooms, property_type, receptions, parking_spaces),
        viewing_requests(id, status, preferred_date, preferred_time, message, created_at, updated_at)
      `)
      .eq('seller_id', userId)
      .eq('status', status)
      .eq('seller_archived', false);

    if (sellerError) {
      return res.status(500).json({ error: sellerError.message });
    }

    // Combine and mark user role for each conversation
    const allConversations = [
      ...(buyerConversations || []).map(conv => ({ ...conv, userRole: 'buyer' })),
      ...(sellerConversations || []).map(conv => ({ ...conv, userRole: 'seller' }))
    ];

    // Sort by last message time
    allConversations.sort((a, b) => 
      new Date(b.last_message_at || b.created_at).getTime() - 
      new Date(a.last_message_at || a.created_at).getTime()
    );

    res.json(allConversations);

  } catch (error) {
    console.error('Error fetching all conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
