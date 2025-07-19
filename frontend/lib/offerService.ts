// Frontend service for offers API calls
import { supabase } from './supabaseClient';

export interface Offer {
  id: string;
  conversation_id: string;
  buyer_id: string;
  seller_id: string;
  property_id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'countered';
  message?: string;
  seller_response?: string;
  counter_amount?: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOfferRequest {
  conversation_id: string;
  property_id: string;
  amount: number;
  message?: string;
  expires_at?: string;
}

export interface UpdateOfferRequest {
  status: 'accepted' | 'rejected' | 'withdrawn' | 'countered';
  seller_response?: string;
  counter_amount?: number;
}

class OfferService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  /**
   * Create a new offer
   */
  async createOffer(request: CreateOfferRequest): Promise<Offer> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id, // Temporary auth method
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create offer');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  /**
   * Get offer for a conversation
   */
  async getOffer(conversationId: string): Promise<Offer | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/offers/conversation/${conversationId}`, {
        headers: {
          'user-id': user.id,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch offer');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching offer:', error);
      throw error;
    }
  }

  /**
   * Get offer history for a conversation
   */
  async getOfferHistory(conversationId: string): Promise<Offer[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/offers/conversation/${conversationId}/history`, {
        headers: {
          'user-id': user.id,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch offer history');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching offer history:', error);
      throw error;
    }
  }

  /**
   * Update offer status
   */
  async updateOffer(id: string, request: UpdateOfferRequest): Promise<Offer> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/offers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id,
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update offer');
      }

      return result.data;
    } catch (error) {
      console.error('Error updating offer:', error);
      throw error;
    }
  }

  /**
   * Withdraw offer
   */
  async withdrawOffer(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/offers/${id}`, {
        method: 'DELETE',
        headers: {
          'user-id': user.id,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to withdraw offer');
      }

      return result.success;
    } catch (error) {
      console.error('Error withdrawing offer:', error);
      throw error;
    }
  }

  /**
   * Get all offers for the current user
   */
  async getUserOffers(): Promise<Offer[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`${this.baseUrl}/offers/user`, {
        headers: {
          'user-id': user.id,
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch user offers');
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching user offers:', error);
      throw error;
    }
  }

  /**
   * Calculate offer percentage for a property
   */
  async calculateOfferPercentage(propertyId: string, amount: number): Promise<{ percentage: number; amount: number; propertyId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/offers/${propertyId}/percentage?amount=${amount}`);

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to calculate offer percentage');
      }

      return result.data;
    } catch (error) {
      console.error('Error calculating offer percentage:', error);
      throw error;
    }
  }

  /**
   * Subscribe to offer changes for a conversation
   */
  subscribeToOffer(conversationId: string, callback: (offer: Offer | null) => void) {
    const channel = supabase
      .channel(`offer_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'offers',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('Offer change:', payload);
          if (payload.eventType === 'DELETE') {
            callback(null);
          } else {
            callback(payload.new as Offer);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  formatPercentage(percentage: number): string {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  }
}

export const offerService = new OfferService();
