const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...\n');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? '✓ Present' : '✗ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Try to query the auth users (should work even if empty)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('\n❌ Connection failed:', error.message);
      process.exit(1);
    }
    
    console.log('\n✅ Connection successful!');
    console.log('\n📋 Next steps:');
    console.log('   1. Go to: https://apqpsyugdmvrzaprugvw.supabase.co/project/apqpsyugdmvrzaprugvw/editor');
    console.log('   2. Click "SQL Editor" in the left sidebar');
    console.log('   3. Click "New Query"');
    console.log('   4. Copy the contents of: supabase/migrations/001_initial_schema.sql');
    console.log('   5. Paste and click "Run"');
    console.log('   6. Verify tables are created in the "Table Editor"');
    console.log('\n   Then run: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

testConnection();
