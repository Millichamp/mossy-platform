import express from 'express';
import { offerService } from '../services/OfferService';
import { CreateOfferRequest, UpdateOfferRequest } from '../types/viewingRequests';

const router = express.Router();

// Helper function to get user ID from request (you'll need to implement auth middleware)
const getUserId = (req: express.Request): string => {
  // TODO: Implement proper auth middleware to extract user ID from JWT token
  // For now, we'll use a header or query parameter
  return req.headers['user-id'] as string || req.query.userId as string;
};

/**
 * POST /api/offers
 * Create a new offer
 */
router.post('/', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const request: CreateOfferRequest = req.body;
    
    // Validate required fields
    if (!request.conversation_id || !request.property_id || !request.amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: conversation_id, property_id, amount' 
      });
    }

    // Validate amount is positive
    if (request.amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Offer amount must be greater than 0' 
      });
    }

    // Check if user can create an offer
    const canCreate = await offerService.canCreateOffer(request.conversation_id, userId);
    if (!canCreate) {
      return res.status(403).json({ 
        success: false, 
        error: 'Cannot create offer. Either not authorized or active offer already exists.' 
      });
    }

    const offer = await offerService.create(request, userId);
    
    res.status(201).json({
      success: true,
      data: offer,
      message: 'Offer created successfully'
    });
  } catch (error: any) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/offers/conversation/:conversationId
 * Get offer for a specific conversation
 */
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { conversationId } = req.params;
    const offer = await offerService.getByConversationId(conversationId, userId);
    
    res.json({
      success: true,
      data: offer
    });
  } catch (error: any) {
    console.error('Error fetching offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/offers/conversation/:conversationId/history
 * Get offer history for a specific conversation
 */
router.get('/conversation/:conversationId/history', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { conversationId } = req.params;
    const offers = await offerService.getOfferHistory(conversationId, userId);
    
    res.json({
      success: true,
      data: offers
    });
  } catch (error: any) {
    console.error('Error fetching offer history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * PUT /api/offers/:id
 * Update offer status
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    const request: UpdateOfferRequest = req.body;
    
    // Validate required fields
    if (!request.status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: status' 
      });
    }

    // Validate counter_amount if status is 'countered'
    if (request.status === 'countered' && (!request.counter_amount || request.counter_amount <= 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Counter amount is required and must be greater than 0 when countering an offer' 
      });
    }

    const offer = await offerService.update(id, request, userId);
    
    res.json({
      success: true,
      data: offer,
      message: 'Offer updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * DELETE /api/offers/:id
 * Withdraw offer
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    const success = await offerService.delete(id, userId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Offer withdrawn successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Offer not found or cannot be withdrawn'
      });
    }
  } catch (error: any) {
    console.error('Error withdrawing offer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/offers/user
 * Get all offers for the current user
 */
router.get('/user', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const offers = await offerService.getByUserId(userId);
    
    res.json({
      success: true,
      data: offers
    });
  } catch (error: any) {
    console.error('Error fetching user offers:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/offers/:propertyId/percentage
 * Calculate offer percentage for a property
 */
router.get('/:propertyId/percentage', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { amount } = req.query;
    
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount parameter is required'
      });
    }

    const percentage = await offerService.calculateOfferPercentage(Number(amount), propertyId);
    
    res.json({
      success: true,
      data: {
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        amount: Number(amount),
        propertyId
      }
    });
  } catch (error: any) {
    console.error('Error calculating offer percentage:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
