import { supabase } from '../../lib/supabaseClient';
import { 
  ViewingRequest, 
  CreateViewingRequestRequest, 
  UpdateViewingRequestRequest,
  ViewingRequestWithDetails,
  ViewingRequestService 
} from '../types/viewingRequests';

export class ViewingRequestServiceImpl implements ViewingRequestService {
  
  /**
   * Create a new viewing request
   */
  async create(request: CreateViewingRequestRequest, userId: string): Promise<ViewingRequest> {
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

      // Cancel any existing active requests for this conversation
      console.log(`Cancelling any existing viewing requests for conversation ${request.conversation_id}`);
      const { error: cancelError } = await supabase
        .from('viewing_requests')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', request.conversation_id)
        .in('status', ['pending', 'confirmed']);

      if (cancelError) {
        console.error('Error cancelling existing requests:', cancelError);
        // Don't throw here, continue with creation
      } else {
        console.log('Successfully cancelled any existing active requests');
      }

      // Small delay to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log(`Creating new viewing request for conversation ${request.conversation_id}`);

      // Create new viewing request
      const viewingRequestData = {
        conversation_id: request.conversation_id,
        buyer_id: userId,
        seller_id: conversation.seller_id,
        property_id: request.property_id,
        preferred_date: request.preferred_date,
        preferred_time: request.preferred_time,
        message: request.message,
        status: 'pending' as const
      };

      // Better approach: Check for existing requests and handle appropriately
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Attempt ${attempts}: Checking for existing requests and handling gracefully...`);
        
        try {
          // Check if there are any existing requests (any status) and mark them as superseded
          const { data: existingRequests } = await supabase
            .from('viewing_requests')
            .select('id, status, created_at')
            .eq('conversation_id', request.conversation_id)
            .eq('buyer_id', userId);

          console.log(`Found ${existingRequests?.length || 0} existing requests:`, existingRequests);

          if (existingRequests && existingRequests.length > 0) {
            // Update ALL existing requests to 'superseded' status (not just active ones)
            console.log('Updating all existing requests to superseded status...');
            
            const { error: updateError } = await supabase
              .from('viewing_requests')
              .update({ 
                status: 'superseded',
                updated_at: new Date().toISOString()
              })
              .eq('conversation_id', request.conversation_id)
              .eq('buyer_id', userId);

            if (updateError) {
              console.error('Error updating existing requests:', updateError);
            } else {
              console.log('Successfully updated all existing requests to superseded');
            }
          }

          // Wait for database consistency
          await new Promise(resolve => setTimeout(resolve, 200 * attempts));

          // Create the new request
          const { data: newData, error: insertError } = await supabase
            .from('viewing_requests')
            .insert(viewingRequestData)
            .select()
            .single();

          if (!insertError && newData) {
            console.log(`Successfully created viewing request on attempt ${attempts}`);
            return newData;
          }

          if (insertError) {
            console.error(`Insert error on attempt ${attempts}:`, insertError);
            if (!insertError.message.includes('duplicate key value violates unique constraint')) {
              // If it's not a constraint error, throw it immediately
              throw insertError;
            }
            console.log(`Constraint error on attempt ${attempts}, will retry...`);
          }
          
        } catch (error) {
          console.error(`Attempt ${attempts} failed:`, error);
          if (attempts === maxAttempts) {
            // Last attempt - show what records exist for debugging
            const { data: allRecords } = await supabase
              .from('viewing_requests')
              .select('id, status, created_at')
              .eq('conversation_id', request.conversation_id);
            
            console.error('All records for this conversation:', allRecords);
            throw new Error(`Failed to create viewing request after ${maxAttempts} attempts. Last error: ${error}. All records: ${JSON.stringify(allRecords)}`);
          }
        }
      }

      throw new Error('All attempts exhausted');
    } catch (error) {
      console.error('Error creating viewing request:', error);
      throw error;
    }
  }

  /**
   * Get viewing request by conversation ID
   */
  async getByConversationId(conversationId: string, userId: string): Promise<ViewingRequest | null> {
    try {
      // Get the most recent active viewing request (pending or confirmed first, then most recent)
      const { data, error } = await supabase
        .from('viewing_requests')
        .select('*')
        .eq('conversation_id', conversationId)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('status', { ascending: true }) // 'pending' comes before 'superseded' alphabetically
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Failed to fetch viewing request: ${error.message}`);
      }

      // Return the most recent active request, or null if none found
      const activeRequest = data?.find(req => req.status === 'pending' || req.status === 'confirmed') || data?.[0];
      
      return activeRequest || null;
    } catch (error) {
      console.error('Error fetching viewing request:', error);
      throw error;
    }
  }

  /**
   * Update viewing request status
   */
  async update(id: string, request: UpdateViewingRequestRequest, userId: string): Promise<ViewingRequest> {
    try {
      // First check if user has permission to update this request
      const { data: existing, error: fetchError } = await supabase
        .from('viewing_requests')
        .select('*')
        .eq('id', id)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .single();

      if (fetchError || !existing) {
        throw new Error('Viewing request not found or unauthorized');
      }

      // Validate status transitions
      const validTransitions = this.getValidStatusTransitions(existing.status, userId, existing.buyer_id);
      if (!validTransitions.includes(request.status)) {
        throw new Error(`Invalid status transition from ${existing.status} to ${request.status}`);
      }

      const updateData = {
        status: request.status,
        seller_response: request.seller_response,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('viewing_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update viewing request: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating viewing request:', error);
      throw error;
    }
  }

  /**
   * Delete (cancel) viewing request
   */
  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('viewing_requests')
        .delete()
        .eq('id', id)
        .eq('buyer_id', userId) // Only buyers can delete their requests
        .eq('status', 'pending'); // Only pending requests can be deleted

      if (error) {
        throw new Error(`Failed to delete viewing request: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting viewing request:', error);
      throw error;
    }
  }

  /**
   * Get all viewing requests for a user
   */
  async getByUserId(userId: string): Promise<ViewingRequestWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('viewing_requests')
        .select(`
          *,
          listings!property_id(id, title, location, price)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch viewing requests: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user viewing requests:', error);
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
          return ['cancelled']; // Buyers can cancel pending requests
        } else {
          return ['confirmed', 'rejected']; // Sellers can confirm or reject
        }
      case 'confirmed':
        return ['completed']; // Both parties can mark as completed
      default:
        return []; // No valid transitions from other statuses
    }
  }

  /**
   * Check if user can create a viewing request for this conversation
   */
  async canCreateViewingRequest(conversationId: string, userId: string): Promise<boolean> {
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

      // Check if there's already an active viewing request
      const { data: existingRequest, error: requestError } = await supabase
        .from('viewing_requests')
        .select('id')
        .eq('conversation_id', conversationId)
        .in('status', ['pending', 'confirmed'])
        .single();

      // If there's an existing active request, can't create another
      return requestError?.code === 'PGRST116'; // No rows found
    } catch (error) {
      console.error('Error checking viewing request eligibility:', error);
      return false;
    }
  }
}

export const viewingRequestService = new ViewingRequestServiceImpl();
