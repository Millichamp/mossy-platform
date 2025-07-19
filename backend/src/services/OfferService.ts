import { supabase } from '../../lib/supabaseClient';
import { 
  Offer, 
  CreateOfferRequest, 
  UpdateOfferRequest,
  OfferWithDetails,
  OfferService 
} from '../types/viewingRequests';

export class OfferServiceImpl implements OfferService {
  
  /**
   * Create a new offer
   */
  async create(request: CreateOfferRequest, userId: string): Promise<Offer> {
    try {
      // First, verify the user is the buyer in this conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id, buyer_id, seller_id, property_id')
        .eq('id', request.conversation_id)
        .eq('buyer_id', userId)
        .single();

      if (convError || !conversation) {
        throw new Error('Conversation not found or unauthorized');
      }

      // Create the offer
      const offerData = {
        conversation_id: request.conversation_id,
        buyer_id: userId,
        seller_id: conversation.seller_id,
        property_id: request.property_id,
        amount: request.amount,
        message: request.message,
        expires_at: request.expires_at,
        status: 'pending' as const
      };

      const { data, error } = await supabase
        .from('offers')
        .insert(offerData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create offer: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Get offer by conversation ID
   */
  async getByConversationId(conversationId: string, userId: string): Promise<Offer | null> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('conversation_id', conversationId)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No offer found
        }
        throw new Error(`Failed to fetch offer: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching offer:', error);
      throw error;
    }
  }

  /**
   * Update offer status
   */
  async update(id: string, request: UpdateOfferRequest, userId: string): Promise<Offer> {
    try {
      // First check if user has permission to update this offer
      const { data: existing, error: fetchError } = await supabase
        .from('offers')
        .select('*')
        .eq('id', id)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .single();

      if (fetchError || !existing) {
        throw new Error('Offer not found or unauthorized');
      }

      // Validate status transitions
      const validTransitions = this.getValidStatusTransitions(existing.status, userId, existing.buyer_id);
      if (!validTransitions.includes(request.status)) {
        throw new Error(`Invalid status transition from ${existing.status} to ${request.status}`);
      }

      const updateData = {
        status: request.status,
        seller_response: request.seller_response,
        counter_amount: request.counter_amount,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update offer: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    }
  }

  /**
   * Delete (withdraw) offer
   */
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id)
        .eq('buyer_id', userId) // Only buyers can delete their offers
        .eq('status', 'pending'); // Only pending offers can be deleted

      if (error) {
        throw new Error(`Failed to delete offer: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  }

  /**
   * Get all offers for a user
   */
  async getByUserId(userId: string): Promise<OfferWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          listings!property_id(id, title, location, price)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch offers: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user offers:', error);
      throw error;
    }
  }

  /**
   * Get valid status transitions based on current status and user role
   */
  private getValidStatusTransitions(currentStatus: string, userId: string, buyerId: string): string[] {
    const isBuyer = userId === buyerId;

    switch (currentStatus) {
      case 'pending':
        if (isBuyer) {
          return ['withdrawn']; // Buyers can withdraw pending offers
        } else {
          return ['accepted', 'rejected', 'countered']; // Sellers can accept, reject, or counter
        }
      default:
        return []; // No valid transitions from other statuses
    }
  }

  /**
   * Check if user can create an offer for this conversation
   */
  async canCreateOffer(conversationId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is the buyer in this conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('buyer_id')
        .eq('id', conversationId)
        .eq('buyer_id', userId)
        .single();

      if (convError || !conversation) {
        return false;
      }

      // Check if there's already an active offer
      const { data: existingOffer, error: offerError } = await supabase
        .from('offers')
        .select('id')
        .eq('conversation_id', conversationId)
        .in('status', ['pending', 'countered'])
        .single();

      // If there's an existing active offer, can't create another
      return offerError?.code === 'PGRST116'; // No rows found
    } catch (error) {
      console.error('Error checking offer eligibility:', error);
      return false;
    }
  }

  /**
   * Calculate percentage difference from property price
   */
  async calculateOfferPercentage(offerAmount: number, propertyId: string): Promise<number> {
    try {
      const { data: property, error } = await supabase
        .from('listings')
        .select('price')
        .eq('id', propertyId)
        .single();

      if (error || !property) {
        throw new Error('Property not found');
      }

      return ((offerAmount - property.price) / property.price) * 100;
    } catch (error) {
      console.error('Error calculating offer percentage:', error);
      return 0;
    }
  }

  /**
   * Get offer history for a conversation
   */
  async getOfferHistory(conversationId: string, userId: string): Promise<Offer[]> {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('conversation_id', conversationId)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch offer history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching offer history:', error);
      throw error;
    }
  }
}

export const offerService = new OfferServiceImpl();
