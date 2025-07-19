import express from 'express';
import { viewingRequestService } from '../services/ViewingRequestService';
import { CreateViewingRequestRequest, UpdateViewingRequestRequest } from '../types/viewingRequests';

const router = express.Router();

// Helper function to get user ID from request (you'll need to implement auth middleware)
const getUserId = (req: express.Request): string => {
  // TODO: Implement proper auth middleware to extract user ID from JWT token
  // For now, we'll use a header or query parameter
  return req.headers['user-id'] as string || req.query.userId as string;
};

/**
 * POST /api/viewing-requests
 * Create a new viewing request
 */
router.post('/', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const request: CreateViewingRequestRequest = req.body;
    
    // Validate required fields
    if (!request.conversation_id || !request.property_id || !request.preferred_date || !request.preferred_time) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: conversation_id, property_id, preferred_date, preferred_time' 
      });
    }

    // Check if user can create a viewing request
    const canCreate = await viewingRequestService.canCreateViewingRequest(request.conversation_id, userId);
    if (!canCreate) {
      return res.status(403).json({ 
        success: false, 
        error: 'Cannot create viewing request. Either not authorized or request already exists.' 
      });
    }

    const viewingRequest = await viewingRequestService.create(request, userId);
    
    res.status(201).json({
      success: true,
      data: viewingRequest,
      message: 'Viewing request created successfully'
    });
  } catch (error: any) {
    console.error('Error creating viewing request:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/viewing-requests/conversation/:conversationId
 * Get viewing request for a specific conversation
 */
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { conversationId } = req.params;
    const viewingRequest = await viewingRequestService.getByConversationId(conversationId, userId);
    
    res.json({
      success: true,
      data: viewingRequest
    });
  } catch (error: any) {
    console.error('Error fetching viewing request:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * PUT /api/viewing-requests/:id
 * Update viewing request status
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    const request: UpdateViewingRequestRequest = req.body;
    
    // Validate required fields
    if (!request.status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: status' 
      });
    }

    const viewingRequest = await viewingRequestService.update(id, request, userId);
    
    res.json({
      success: true,
      data: viewingRequest,
      message: 'Viewing request updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating viewing request:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * DELETE /api/viewing-requests/:id
 * Cancel viewing request
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    const success = await viewingRequestService.delete(id, userId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Viewing request cancelled successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Viewing request not found or cannot be cancelled'
      });
    }
  } catch (error: any) {
    console.error('Error deleting viewing request:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

/**
 * GET /api/viewing-requests/user
 * Get all viewing requests for the current user
 */
router.get('/user', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const viewingRequests = await viewingRequestService.getByUserId(userId);
    
    res.json({
      success: true,
      data: viewingRequests
    });
  } catch (error: any) {
    console.error('Error fetching user viewing requests:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
