// Script to check environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking Environment Variables...\n');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const optionalVars = [
  'OPENAI_API_KEY',
  'WHAPI_API_TOKEN',
  'WHAPI_API_URL',
  'NEXT_PUBLIC_APP_URL',
];

let hasErrors = false;

console.log('✅ Required Variables:');
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✓ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`   ✗ ${varName}: MISSING!`);
    hasErrors = true;
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✓ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`   - ${varName}: Not set`);
  }
});

if (hasErrors) {
  console.log('\n❌ Some required variables are missing!');
  console.log('\n💡 Make sure your .env.local file contains:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_key');
  process.exit(1);
} else {
  console.log('\n✅ All required variables are set!');
}
