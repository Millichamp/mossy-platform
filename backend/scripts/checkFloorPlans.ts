import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function checkFloorPlans() {
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, floor_plan')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Floor plan data for first 5 listings:');
  data.forEach(listing => {
    console.log(`- ${listing.title}: ${listing.floor_plan || 'No floor plan'}`);
  });
}

checkFloorPlans();
