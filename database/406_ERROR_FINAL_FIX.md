# 406 Error - FINAL EXPERT FIX

## Root Cause Identified
The Supabase query builder was HTML-encoding the URL (`&amp;` instead of `&`), causing 406 errors. The custom fetch interceptor couldn't fix this because the URL was already encoded before reaching fetch.

## Solution: Direct REST API Calls
Instead of using Supabase's query builder, we now make direct REST API calls using native `fetch()` with proper URL encoding.

## Files Modified

### 1. `src/lib/supabase.ts` - Cleaned Up
Removed custom fetch interceptor. Supabase client now only handles auth.

### 2. `src/utils/supabaseRest.ts` - NEW
Direct REST API utility that:
- Uses native `fetch()` with proper headers
- Builds URLs correctly using `URL` and `searchParams`
- Includes proper authentication headers
- Handles errors gracefully

### 3. `src/services/userService.ts` - Updated
Now uses `supabaseRest` for all user queries:
- `queryUserByEmail()` - Email lookups
- `queryUserById()` - ID lookups
- `queryAllUsers()` - Bulk queries

## How It Works

**Before (Broken):**
```
Supabase Query Builder → HTML-encoded URL → 406 Error
```

**After (Fixed):**
```
Direct REST API → Native fetch() → Proper URL → 200 OK
```

## Implementation Steps

### Step 1: Verify Files
Check these files exist and are updated:
- ✅ `src/lib/supabase.ts` - Clean Supabase client
- ✅ `src/utils/supabaseRest.ts` - Direct REST API utility
- ✅ `src/services/userService.ts` - Updated to use REST API

### Step 2: Restart Dev Server
```bash
# Stop current server
Ctrl+C

# Clear cache
rm -rf node_modules/.cache

# Restart
npm start
```

### Step 3: Hard Refresh Browser
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### Step 4: Test Login
1. Go to `/login`
2. Enter credentials
3. Open DevTools Console (F12)
4. Should see NO 406 errors
5. Login should succeed

### Step 5: Verify Network Requests
1. Open DevTools Network tab
2. Look for requests to `supabase.co/rest/v1/user_accounts`
3. All should show `200` status
4. URL should have proper `&` not `&amp;`

## Expected Results

✅ No 406 errors in console
✅ All REST API requests return 200
✅ Login works successfully
✅ User data loads correctly
✅ Email lookups work without errors

## Technical Details

### Why Direct REST API Works
1. **Native URL Encoding**: `URL` and `searchParams` handle encoding correctly
2. **No Query Builder**: Bypasses Supabase's query builder that was causing issues
3. **Explicit Headers**: We control all headers sent to API
4. **Simple & Direct**: Fewer layers = fewer encoding issues

### Headers Used
```
Accept: application/json
Content-Type: application/json
apikey: <your-supabase-key>
Authorization: Bearer <your-supabase-key>
```

### URL Building Example
```typescript
const url = new URL(`${SUPABASE_URL}/rest/v1/user_accounts`);
url.searchParams.append('select', 'Id,Email,Name,User_Type,created_at');
url.searchParams.append('Email', `eq.${email}`);
// Result: /rest/v1/user_accounts?select=Id,Email,Name,User_Type,created_at&Email=eq.springbionics%40gmail.com
// (Proper encoding, no &amp;)
```

## Troubleshooting

### Still Getting 406?
1. Verify `src/utils/supabaseRest.ts` exists
2. Verify `src/services/userService.ts` imports from `supabaseRest`
3. Check browser console for import errors
4. Hard refresh browser (Ctrl+Shift+R)

### Getting 401 Unauthorized?
1. Check `.env` file has correct `REACT_APP_SUPABASE_ANON_KEY`
2. Verify Supabase project is active
3. Check API key hasn't been revoked

### Getting 404 Not Found?
1. Verify `user_accounts` table exists in Supabase
2. Check table name spelling (case-sensitive)
3. Verify table is in `public` schema

## Files Structure

```
src/
├── lib/
│   └── supabase.ts (Supabase client - auth only)
├── utils/
│   ├── supabaseRest.ts (NEW - Direct REST API)
│   └── supabaseQueryHelper.ts (Can be removed)
└── services/
    └── userService.ts (Updated - uses supabaseRest)
```

## Deployment Checklist

- [ ] All three files updated/created
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] No 406 errors in console
- [ ] Login works successfully
- [ ] Network requests show 200 status
- [ ] Ready for production deployment

## Support

If issues persist:
1. Check Supabase project status
2. Verify API key permissions
3. Check user_accounts table exists
4. Review browser console for errors
5. Check Supabase dashboard logs
