import { supabase } from '../lib/supabaseClient';

async function runMigration() {
  console.log('🚀 Starting viewing requests and offers schema migration...');
  
  try {
    // Test connection first
    console.log('� Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError);
      return;
    }
    
    console.log('✅ Supabase connection successful');
    
    // Since we can't execute raw SQL directly through the client,
    // let's check if the tables already exist and provide manual instructions
    console.log('� Checking if tables already exist...');
    
    const { data: viewingData, error: viewingError } = await supabase
      .from('viewing_requests')
      .select('id')
      .limit(1);
    
    const { data: offersData, error: offersError } = await supabase
      .from('offers')
      .select('id')
      .limit(1);
    
    if (!viewingError) {
      console.log('✅ viewing_requests table already exists');
    } else {
      console.log('📋 viewing_requests table needs to be created');
    }
    
    if (!offersError) {
      console.log('✅ offers table already exists');
    } else {
      console.log('💰 offers table needs to be created');
    }
    
    if (viewingError || offersError) {
      console.log('');
      console.log('🛠️  MANUAL SETUP REQUIRED:');
      console.log('Since we cannot execute raw SQL through the Supabase client,');
      console.log('please run the following SQL files in your Supabase dashboard:');
      console.log('');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run these files in order:');
      console.log('   - database/viewing_requests_schema.sql');
      console.log('   - database/offers_schema.sql');
      console.log('   - database/indexes.sql');
      console.log('   - database/rls_policies.sql');
      console.log('');
      console.log('📂 All files are ready in the database/ directory');
    } else {
      console.log('🎉 All tables exist! Database setup is complete!');
      console.log('');
      console.log('📋 Phase 2 Step 1 Complete - Database Setup ✅');
      console.log('📋 Ready for Step 2 - TypeScript interfaces and backend services');
    }
    
  } catch (error) {
    console.error('❌ Migration check failed:', error);
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration().then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
}

export { runMigration };
