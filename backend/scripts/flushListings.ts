// scripts/flushListings.ts
// Script to delete all rows from the listings table in Supabase

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function flushListings() {
  const { error } = await supabase.from('listings').delete().not('id', 'is', null);
  if (error) {
    console.error('Error deleting listings:', error.message);
    process.exit(1);
  } else {
    console.log('All listings deleted successfully.');
  }
}

flushListings();
