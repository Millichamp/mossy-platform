import { supabase } from './supabaseClient';

interface Conversation {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  status: 'active' | 'archived';
  created_at: string;
  last_message_at: string;
  last_message_preview: string;
  buyer_unread_count: number;
  seller_unread_count: number;
  buyer_archived: boolean;
  seller_archived: boolean;
  property?: {
    id: string;
    title: string;
    images: string[];
    price: number;
    address: string;
    bedrooms?: number;
    bathrooms?: number;
    property_type?: string;
    receptions?: number;
    parking_spaces?: number;
  };
  latest_viewing_request?: {
    id: string;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'superseded';
    preferred_date?: string;
    preferred_time?: string;
    message?: string;
    created_at: string;
    updated_at: string;
  };
  viewing_requests?: {
    id: string;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'superseded';
    preferred_date?: string;
    preferred_time?: string;
    message?: string;
    created_at: string;
    updated_at: string;
  }[];
  buyer?: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      first_name?: string;
      last_name?: string;
    };
  };
  seller?: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'offer';
  is_read: boolean;
  read_at?: string;
  created_at: string;
  deleted_at?: string;
  sender?: {
    id: string;
    email: string;
    raw_user_meta_data?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class MessagingService {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.user?.id || ''}`,
      'Content-Type': 'application/json'
    };
  }

  async startConversation(propertyId: string, initialMessage: string) {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        propertyId,
        initialMessage
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start conversation');
    }

    return response.json();
  }

  async getConversations(role: 'buyer' | 'seller' = 'buyer', status: 'active' | 'archived' = 'active', propertyId?: string): Promise<Conversation[]> {
    const headers = await this.getAuthHeaders();
    let url = `${API_BASE}/conversations?role=${role}&status=${status}`;
    if (propertyId) {
      url += `&propertyId=${propertyId}`;
    }
    
    const response = await fetch(url, {
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch conversations');
    }

    return response.json();
  }

  // Get all conversations for messages page (both buyer and seller roles)
  async getAllConversations(status: 'active' | 'archived' = 'active'): Promise<Conversation[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/conversations/all?status=${status}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch conversations');
    }

    return response.json();
  }

  async getConversationByProperty(propertyId: string): Promise<Conversation | null> {
    try {
      const conversations = await this.getConversations('buyer', 'active', propertyId);
      return conversations.length > 0 ? conversations[0] : null;
    } catch (error) {
      console.error('Error getting conversation for property:', error);
      return null;
    }
  }

  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<Message[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch messages');
    }

    return response.json();
  }

  async sendMessage(conversationId: string, content: string, messageType: 'text' | 'image' | 'document' | 'offer' = 'text'): Promise<Message> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content,
        messageType
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
  }

  async markAsRead(conversationId: string): Promise<void> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE}/conversations/${conversationId}/mark-read`, {
      method: 'PUT',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark messages as read');
    }

    return response.json();
  }

  // Helper function to get user details (simplified version)
  async getUserDetails(userId: string) {
    try {
      // For now, return basic info - in future we can add a backend endpoint
      // or use Supabase RLS policies to safely query user profiles
      return {
        id: userId,
        email: 'Loading...', // Will be enhanced later
        name: `User ${userId.slice(0, 8)}...`, // Truncated ID for now
        avatar: null
      };
    } catch (error) {
      console.warn('Could not fetch user details:', error);
      return {
        id: userId,
        email: 'Unknown User',
        name: 'Unknown User',
        avatar: null
      };
    }
  }

  // Enhanced method to get conversations with user details
  async getConversationsWithUsers(role: 'buyer' | 'seller' = 'buyer', status: 'active' | 'archived' = 'active', propertyId?: string): Promise<Conversation[]> {
    const conversations = await this.getConversations(role, status, propertyId);
    
    // Enhance with user details for display
    const enhancedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = role === 'buyer' ? conv.seller_id : conv.buyer_id;
        const userDetails = await this.getUserDetails(otherUserId);
        
        return {
          ...conv,
          otherUser: userDetails
        };
      })
    );
    
    return enhancedConversations;
  }

  // Real-time subscriptions with fallback
  subscribeToMessages(conversationId: string, onMessage: (message: any) => void) {
    try {
      return supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            onMessage(payload.new);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time messaging connected');
          } else if (status === 'CHANNEL_ERROR') {
            console.log('⚠️ Real-time connection unavailable, using backup sync');
          }
        });
    } catch (error) {
      console.warn('Realtime subscription failed:', error);
      return null;
    }
  }

  subscribeToConversations(userId: string, onUpdate: (conversation: any) => void) {
    try {
      return supabase
        .channel(`conversations:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'conversations',
            filter: `or(buyer_id.eq.${userId},seller_id.eq.${userId})`
          },
          (payload) => {
            onUpdate(payload.new);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time conversation updates connected');
          } else if (status === 'CHANNEL_ERROR') {
            console.log('⚠️ Real-time conversation updates unavailable');
          }
        });
    } catch (error) {
      console.warn('Realtime subscription failed:', error);
      return null;
    }
  }
}

export const messagingService = new MessagingService();
export type { Conversation, Message };
