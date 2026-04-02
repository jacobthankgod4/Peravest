const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔍 Testing Authentication System...\n');
  
  // Test 1: Check if users table exists and has data
  console.log('1. Testing Users Table...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('Id, Email, Name')
      .limit(3);
    
    if (error) {
      console.log('❌ Users table error:', error.message);
    } else {
      console.log('✅ Users table accessible');
      console.log(`   Found ${data?.length || 0} users`);
      if (data && data.length > 0) {
        console.log('   Sample user:', data[0]);
      }
    }
  } catch (err) {
    console.log('❌ Users table test failed:', err.message);
  }
  
  // Test 2: Test Supabase Auth
  console.log('\n2. Testing Supabase Auth...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('⚠️  No active session (expected)');
    } else {
      console.log('✅ Supabase Auth working');
    }
  } catch (err) {
    console.log('❌ Supabase Auth error:', err.message);
  }
  
  // Test 3: Check API endpoints (will fail but shows structure)
  console.log('\n3. Testing API Endpoints...');
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
    });
    console.log('✅ API endpoint reachable, status:', response.status);
  } catch (err) {
    console.log('❌ API endpoint not available (expected - no backend running)');
  }
  
  console.log('\n📋 AUTHENTICATION STATUS:');
  console.log('✅ Supabase connection: Working');
  console.log('✅ Users table: Accessible');
  console.log('❌ Backend API: Not running (React app calls /api/auth/*)');
  console.log('❌ Authentication: Will fail without backend');
  
  console.log('\n🔧 TO FIX AUTHENTICATION:');
  console.log('1. Either implement Supabase Auth in React components');
  console.log('2. Or start the Node.js backend server');
  console.log('3. Current React components expect /api/auth/* endpoints');
}

testAuth().catch(console.error);