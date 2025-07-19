// Frontend service for viewing requests API calls
import { supabase } from './supabaseClient';

export interface ViewingRequest {
  id: string;
  conversation_id: string;
  buyer_id: string;
  seller_id: string;
  property_id: string;
  preferred_date: string;
  preferred_time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'superseded';
  message?: string;
  seller_response?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateViewingRequestRequest {
  conversation_id: string;
  property_id: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
}

export interface UpdateViewingRequestRequest {
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'superseded';
  seller_response?: string;
}

class ViewingRequestService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  /**
   * Create a new viewing request
   */
  async createViewingRequest(request: CreateViewingRequestRequest): Promise<ViewingRequest> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/viewing-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id, // Temporary auth method
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create viewing request');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating viewing request:', error);
      throw error;
    }
  }

  /**
   * Get viewing request for a conversation
   */
  async getViewingRequest(conversationId: string): Promise<ViewingRequest | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/viewing-requests/conversation/${conversationId}`, {
        headers: {
          'user-id': user.id,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch viewing request');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching viewing request:', error);
      throw error;
    }
  }

  /**
   * Update viewing request status
   */
  async updateViewingRequest(id: string, request: UpdateViewingRequestRequest): Promise<ViewingRequest> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/viewing-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id,
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update viewing request');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating viewing request:', error);
      throw error;
    }
  }

  /**
   * Cancel viewing request
   */
  async cancelViewingRequest(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/viewing-requests/${id}`, {
        method: 'DELETE',
        headers: {
          'user-id': user.id,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel viewing request');
      }

      return result.success;
    } catch (error) {
      console.error('Error cancelling viewing request:', error);
      throw error;
    }
  }

  /**
   * Get all viewing requests for the current user
   */
  async getUserViewingRequests(): Promise<ViewingRequest[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/viewing-requests/user`, {
        headers: {
          'user-id': user.id,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user viewing requests');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching user viewing requests:', error);
      throw error;
    }
  }

  /**
   * Subscribe to viewing request changes for a conversation
   */
  subscribeToViewingRequest(conversationId: string, callback: (request: ViewingRequest | null) => void) {
    const channel = supabase
      .channel(`viewing_request_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'viewing_requests',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log('Viewing request change:', payload);
          
          if (payload.eventType === 'DELETE') {
            callback(null);
          } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // For INSERT/UPDATE, we need to get the most recent active request
            // since there might be multiple records now (superseded + active)
            try {
              const activeRequest = await this.getViewingRequest(conversationId);
              callback(activeRequest);
            } catch (error) {
              console.error('Error fetching updated viewing request:', error);
              // Fallback to payload data if API call fails
              const request = payload.new as ViewingRequest;
              // Only show active requests (not superseded ones)
              if (request.status !== 'superseded') {
                callback(request);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const viewingRequestService = new ViewingRequestService();
