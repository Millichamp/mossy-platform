import { Router } from 'express';
import { supabase } from '../../lib/supabaseClient';

const router = Router();

// Get all saved properties for a user
router.get('/', async (req, res) => {
  const { user_id } = req.query;
  console.log('GET /api/saved-properties called with user_id:', user_id);
  if (!user_id) {
    console.error('Missing user_id in query');
    return res.status(400).json({ error: 'user_id is required' });
  }
  try {
    const { data, error } = await supabase
      .from('saved_properties')
      .select('property_id')
      .eq('user_id', user_id);
    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(500).json({ error: error.message });
    }
    console.log('Saved property IDs found:', data);
    res.json(data.map((row: any) => row.property_id));
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Save a property for a user
router.post('/', async (req, res) => {
  const { user_id, property_id } = req.body;
  console.log('POST /api/saved-properties', req.body);
  if (!user_id || !property_id) {
    console.error('Missing user_id or property_id in body');
    return res.status(400).json({ error: 'user_id and property_id are required' });
  }
  try {
    const { data, error } = await supabase
      .from('saved_properties')
      .insert([{ user_id, property_id }])
      .select()
      .single();
    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

// Unsave a property for a user
router.delete('/', async (req, res) => {
  const { user_id, property_id } = req.body;
  console.log('DELETE /api/saved-properties', req.body);
  if (!user_id || !property_id) {
    console.error('Missing user_id or property_id in body');
    return res.status(400).json({ error: 'user_id and property_id are required' });
  }
  try {
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', user_id)
      .eq('property_id', property_id);
    if (error) {
      console.error('Supabase error:', error.message);
      return res.status(400).json({ error: error.message });
    }
    res.status(204).end();
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

export default router;
