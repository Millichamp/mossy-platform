// ============================================
// VIEWING REQUESTS TYPES
// ============================================

export interface ViewingRequest {
  id: string;
  conversation_id: string;
  buyer_id: string;
  seller_id: string;
  property_id: string;
  preferred_date: string; // ISO date string
  preferred_time: string; // HH:mm format
  status: ViewingRequestStatus;
  message?: string;
  seller_response?: string;
  created_at: string;
  updated_at: string;
}

export type ViewingRequestStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'rejected' 
  | 'cancelled' 
  | 'completed'
  | 'superseded';

export interface CreateViewingRequestRequest {
  conversation_id: string;
  property_id: string;
  preferred_date: string;
  preferred_time: string;
  message?: string;
}

export interface UpdateViewingRequestRequest {
  status: ViewingRequestStatus;
  seller_response?: string;
}

// ============================================
// OFFERS TYPES
// ============================================

export interface Offer {
  id: string;
  conversation_id: string;
  buyer_id: string;
  seller_id: string;
  property_id: string;
  amount: number;
  status: OfferStatus;
  message?: string;
  seller_response?: string;
  counter_amount?: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export type OfferStatus = 
  | 'pending' 
  | 'accepted' 
  | 'rejected' 
  | 'withdrawn' 
  | 'countered';

export interface CreateOfferRequest {
  conversation_id: string;
  property_id: string;
  amount: number;
  message?: string;
  expires_at?: string;
}

export interface UpdateOfferRequest {
  status: OfferStatus;
  seller_response?: string;
  counter_amount?: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ViewingRequestWithDetails extends ViewingRequest {
  property?: {
    id: string;
    title: string;
    location: string;
    price: number;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface OfferWithDetails extends Offer {
  property?: {
    id: string;
    title: string;
    location: string;
    price: number;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
  };
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

// ============================================
// SERVICE TYPES
// ============================================

export interface ViewingRequestService {
  create(request: CreateViewingRequestRequest, userId: string): Promise<ViewingRequest>;
  getByConversationId(conversationId: string, userId: string): Promise<ViewingRequest | null>;
  update(id: string, request: UpdateViewingRequestRequest, userId: string): Promise<ViewingRequest>;
  delete(id: string, userId: string): Promise<boolean>;
  getByUserId(userId: string): Promise<ViewingRequestWithDetails[]>;
  canCreateViewingRequest(conversationId: string, userId: string): Promise<boolean>;
}

export interface OfferService {
  create(request: CreateOfferRequest, userId: string): Promise<Offer>;
  getByConversationId(conversationId: string, userId: string): Promise<Offer | null>;
  update(id: string, request: UpdateOfferRequest, userId: string): Promise<Offer>;
  delete(id: string, userId: string): Promise<boolean>;
  getByUserId(userId: string): Promise<OfferWithDetails[]>;
}
