import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vqlybihufqliujmgwcgz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxbHliaWh1ZnFsaXVqbWd3Y2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTEzMTAsImV4cCI6MjA4NTc4NzMxMH0.f-wsdShTFX-r0OuIaMN1ZzxWcYKDVDhwNEAmZGODzwE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  console.log('Testing Supabase signup...\n');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);
  console.log('\n---\n');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'https://peravest.vercel.app/auth/callback'
      }
    });
    
    if (error) {
      console.error('ERROR:', error);
      console.error('Error Code:', error.status);
      console.error('Error Message:', error.message);
      console.error('Full Error:', JSON.stringify(error, null, 2));
    } else {
      console.log('SUCCESS:', data);
    }
  } catch (err) {
    console.error('EXCEPTION:', err);
  }
}

testSignup();
