# AddProperty Form Data Persistence - Audit & Debug Guide

## Critical Issues Identified & Fixed

### 1. **Missing RLS (Row Level Security) Policies** ⚠️ CRITICAL
**Problem**: The `property` table likely has RLS enabled but no policies allowing inserts.

**Symptom**: Form submits but data doesn't appear in database. No error message shown.

**Fix - Execute in Supabase SQL Editor**:
```sql
-- Enable RLS on property table
ALTER TABLE public.property ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert properties"
ON public.property
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read properties"
ON public.property
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update properties"
ON public.property
FOR UPDATE
USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete properties"
ON public.property
FOR DELETE
USING (auth.role() = 'authenticated');
```

### 2. **No Authentication Verification** ⚠️ HIGH
**Problem**: propertyService.create() didn't verify user session before insert.

**Fix Applied**: Added session check at start of create method:
```typescript
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
if (sessionError || !session) {
  throw new Error('User not authenticated. Please login first.');
}
```

### 3. **Inadequate Error Logging** ⚠️ HIGH
**Problem**: Supabase errors weren't logged with full details (code, message, hint).

**Fix Applied**: Enhanced error logging in propertyService:
```typescript
if (error) {
  console.error('Supabase insert error:', {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  });
  throw new Error(`Database insert failed: ${error.message}`);
}
```

### 4. **Type Conversion Issues** ⚠️ MEDIUM
**Problem**: Price field sent as integer instead of decimal (NUMERIC(20,2)).

**Fix Applied**: Ensure proper type parsing:
```typescript
Price: parseFloat(String(property.Price || property.price || 0)),
Bedroom: parseInt(String(property.Bedroom || property.bedroom || 0)),
Bathroom: parseInt(String(property.Bathroom || property.bathroom || 0)),
Built_Year: parseInt(String(property.Built_Year || property.builtYear || new Date().getFullYear())),
```

### 5. **Missing Field Validation** ⚠️ MEDIUM
**Problem**: Required fields could be empty strings, causing silent failures.

**Fix Applied**: Added validation before insert:
```typescript
if (!insertData.Title?.trim()) throw new Error('Title is required');
if (!insertData.Address?.trim()) throw new Error('Address is required');
if (!insertData.City?.trim()) throw new Error('City is required');
if (!insertData.State?.trim()) throw new Error('State is required');
if (!insertData.Description?.trim()) throw new Error('Description is required');
```

---

## Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Submit the form
4. Look for error messages with:
   - `code:` (Supabase error code)
   - `message:` (Error description)
   - `hint:` (Helpful suggestion)

### Step 2: Verify Authentication
```javascript
// In browser console:
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);
```

If `session` is null, user is not logged in.

### Step 3: Check RLS Policies
1. Go to Supabase Dashboard
2. Navigate to: Authentication → Policies
3. Select `property` table
4. Verify policies exist for INSERT, SELECT, UPDATE, DELETE
5. If missing, run the SQL from Issue #1 above

### Step 4: Test Direct Insert
```javascript
// In browser console:
const { data, error } = await supabase
  .from('property')
  .insert([{
    Title: 'Test Property',
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
  }])
  .select();

console.log('Insert result:', { data, error });
```

### Step 5: Check Network Tab
1. Open DevTools → Network tab
2. Submit form
3. Look for POST request to `/rest/v1/property`
4. Check response status and body for error details

---

## Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "User not authenticated" | Session expired or user not logged in | Login again |
| "new row violates row-level security policy" | RLS policy missing or incorrect | Add RLS policies (see Issue #1) |
| "column does not exist" | Field name mismatch | Check database schema matches Property interface |
| "value too long for type character varying" | Text field exceeds max length | Reduce input length |
| "invalid input syntax for type integer" | Non-numeric value in number field | Ensure numeric fields contain numbers |

---

## Verification Checklist

- [ ] User is logged in (check AuthContext)
- [ ] RLS policies exist on `property` table
- [ ] All required fields are filled (Title, Address, City, State, Description)
- [ ] Numeric fields contain valid numbers (Price, Bedroom, Bathroom, Built_Year)
- [ ] Browser console shows no errors
- [ ] Network tab shows 201 status for POST request
- [ ] Data appears in Supabase Dashboard → property table

---

## Files Modified

1. **propertyService.ts**
   - Added authentication check
   - Enhanced error logging with full Supabase error details
   - Added field validation before insert
   - Improved type conversions

2. **AddProperty.tsx**
   - Enhanced error logging with form data snapshot
   - Better error messages for debugging

---

## Next Steps

1. Execute RLS policy SQL in Supabase
2. Test form submission
3. Check browser console for detailed error messages
4. If still failing, share console error output for further diagnosis
