# AddProperty Form - Debug Steps

## Step 1: Check Console Logs
1. Open DevTools (F12)
2. Go to Console tab
3. Fill in the form with test data:
   - Title: "Test Property"
   - Address: "123 Test Street"
   - City: "Lagos"
   - State: "Lagos"
   - Price: "5000000"
   - Description: "Test description"
4. Click "Create Property"
5. Look for console logs starting with `[AddProperty]`

Expected logs:
```
[AddProperty] Field changed: Title = "Test Property"
[AddProperty] Updated Title to "Test Property"
[AddProperty] Form submitted with data: {...}
[AddProperty] Validation passed, calling propertyService.create()
```

## Step 2: Check Network Tab
1. Open DevTools → Network tab
2. Submit the form
3. Look for POST request to `/rest/v1/property`
4. Check response:
   - Status should be 201 (Created)
   - Body should contain the inserted property data

## Step 3: Verify in Supabase
1. Go to Supabase Dashboard
2. Navigate to: SQL Editor
3. Run this query:
```sql
SELECT * FROM property ORDER BY created_at DESC LIMIT 5;
```
4. Check if your test property appears

## Step 4: If Still Not Working
Run this in browser console:
```javascript
// Check authentication
const { data: { session } } = await supabase.auth.getSession();
console.log('Authenticated:', !!session);

// Test direct insert
const { data, error } = await supabase
  .from('property')
  .insert([{
    Title: 'Direct Test',
    Type: 'Residential',
    Address: '456 Direct St',
    City: 'Lagos',
    State: 'Lagos',
    Zip_Code: '54321',
    Images: '',
    Video: '',
    Description: 'Direct insert test',
    Price: 3000000,
    Area: '500',
    Bedroom: 2,
    Bathroom: 1,
    Built_Year: 2024,
    Ammenities: 'Pool',
    Status: 'active'
  }])
  .select();

console.log('Insert result:', { data, error });
```

If error shows `PGRST301`, RLS policy is blocking. Run this SQL in Supabase:
```sql
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON property;
CREATE POLICY "Authenticated users can insert properties"
  ON property FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
ALTER TABLE property ENABLE ROW LEVEL SECURITY;
```
