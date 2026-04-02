// QUICK TEST - Run in Browser Console (F12)
// Copy and paste this to see what's happening with form submission

(async () => {
  console.log('=== TESTING PROPERTY INSERT ===\n');

  // 1. Check auth
  const { data: { session } } = await supabase.auth.getSession();
  console.log('1. Authenticated:', !!session, session?.user?.email);

  // 2. Test direct insert
  const testData = {
    Title: 'Test ' + Date.now(),
    Type: 'Residential',
    Address: '123 Test St',
    City: 'Lagos',
    State: 'Lagos',
    Zip_Code: '12345',
    Images: '',
    Video: '',
    Description: 'Test description',
    Price: 5000000,
    Area: '1000',
    Bedroom: 3,
    Bathroom: 2,
    Built_Year: 2024,
    Ammenities: 'Pool',
    Status: 'active'
  };

  console.log('2. Inserting:', testData);
  
  const { data, error } = await supabase
    .from('property')
    .insert([testData])
    .select()
    .single();

  if (error) {
    console.error('ERROR:', error.code, error.message);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);
  } else {
    console.log('SUCCESS! Created property ID:', data.Id);
  }
})();
