import { Router } from 'express';
import { supabase } from '../../lib/supabaseClient';

const router = Router();

// Get all listings
router.get('/', async (req, res) => {
  const { seller_id } = req.query;
  let query = supabase.from('listings').select('*');
  if (seller_id) {
    query = query.eq('seller_id', seller_id);
  }
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get listing by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
  if (error || !data) return res.status(404).json({ error: error?.message || 'Listing not found' });
  res.json(data);
});

// Create listing
router.post('/', async (req, res) => {
  const { data, error } = await supabase.from('listings').insert([req.body]).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Update listing
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('listings').update(req.body).eq('id', id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Delete listing
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).end();
});

export default router;
