// DIAGNOSTIC SCRIPT - Run in Browser Console (F12)
// Copy and paste this entire script into browser console while on AddProperty page

console.log('=== PERAVEST PROPERTY INSERT DIAGNOSTIC ===\n');

(async () => {
  try {
    // 1. Check Authentication
    console.log('1. CHECKING AUTHENTICATION...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session:', session ? `✓ Logged in as ${session.user.email}` : '✗ Not logged in');
    if (sessionError) console.error('Session error:', sessionError);

    // 2. Check User Type
    console.log('\n2. CHECKING USER TYPE...');
    if (session?.user?.email) {
      const { data: userData, error: userError } = await supabase
        .from('user_accounts')
        .select('Email, User_Type')
        .eq('Email', session.user.email)
        .single();
      
      if (userData) {
        console.log(`User Type: ${userData.User_Type} (${userData.User_Type === 'admin' ? '✓ Admin' : '✗ Not Admin'})`);
      } else {
        console.log('✗ User not found in user_accounts table');
        if (userError) console.error('Error:', userError.message);
      }
    }

    // 3. Check RLS Policies
    console.log('\n3. CHECKING RLS POLICIES...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'property' })
      .catch(() => ({ data: null, error: 'RPC not available' }));
    
    if (policies) {
      console.log('RLS Policies:', policies);
    } else {
      console.log('Note: RLS policies check requires admin access');
    }

    // 4. Test Direct Insert
    console.log('\n4. TESTING DIRECT INSERT...');
    const testData = {
      Title: 'Test Property ' + Date.now(),
      Type: 'Residential',
      Address: '123 Test Street',
      City: 'Lagos',
      State: 'Lagos',
      Zip_Code: '12345',
      Images: '',
      Video: '',
      Description: 'Test description for diagnostic',
      Price: 5000000,
      Area: '1000',
      Bedroom: 3,
      Bathroom: 2,
      Built_Year: 2024,
      Ammenities: 'Pool, Gym',
      Status: 'active'
    };

    console.log('Inserting test data:', testData);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('property')
      .insert([testData])
      .select()
      .single();

    if (insertError) {
      console.error('✗ INSERT FAILED');
      console.error('Error Code:', insertError.code);
      console.error('Error Message:', insertError.message);
      console.error('Error Details:', insertError.details);
      console.error('Error Hint:', insertError.hint);
      
      if (insertError.code === 'PGRST301') {
        console.error('\n⚠️ RLS POLICY VIOLATION - Run this SQL in Supabase:');
        console.log(`
DROP POLICY IF EXISTS "Only admins can insert properties" ON property;
CREATE POLICY "Authenticated users can insert properties"
  ON property FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
ALTER TABLE property ENABLE ROW LEVEL SECURITY;
        `);
      }
    } else {
      console.log('✓ INSERT SUCCESSFUL');
      console.log('Created property ID:', insertResult.Id);
    }

  } catch (err) {
    console.error('Diagnostic error:', err);
  }
})();

console.log('\n=== END DIAGNOSTIC ===');
