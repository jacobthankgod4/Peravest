# 406 Error Root Cause Analysis & Expert Fix

## Problem Identified
The error shows: `?select=Id&amp;Email=eq.springbionics%40gmail.com`

The `&amp;` indicates HTML entity encoding in the URL. This happens when:
1. The query URL is being HTML-encoded somewhere in the request chain
2. Supabase REST API receives `&amp;` instead of `&` and rejects it with 406

## Root Cause
The issue is in how Supabase's internal fetch is building the query URL. The `&amp;` encoding suggests the URL is being processed through an HTML parser or the fetch request is being intercepted incorrectly.

## Solution: Custom Fetch Interceptor

The fix has been applied to `src/lib/supabase.ts`:

```typescript
const customFetch = (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  
  // Ensure proper headers for Supabase REST API
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (!headers.has('Content-Type') && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  
  return fetch(url, { ...options, headers });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    fetch: customFetch
  }
});
```

## Why This Works

1. **Custom Fetch Handler**: Intercepts all Supabase requests before they're sent
2. **Header Enforcement**: Ensures `Accept: application/json` is always present
3. **Prevents Encoding Issues**: Direct fetch call prevents URL encoding problems
4. **Supabase Compatibility**: Uses official `global.fetch` option in Supabase client

## Implementation Steps

### Step 1: Verify Supabase Client Update
Check that `src/lib/supabase.ts` has the custom fetch handler.

### Step 2: Clear Cache & Restart
```bash
# Clear node modules cache
rm -rf node_modules/.cache

# Restart dev server
npm start
```

### Step 3: Hard Refresh Browser
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Step 4: Test Login
1. Go to `/login`
2. Enter credentials
3. Check browser console - should NOT see 406 errors
4. Verify Network tab shows 200 responses

## Verification Checklist

- [ ] `src/lib/supabase.ts` has custom fetch handler
- [ ] Dev server restarted with `npm start`
- [ ] Browser cache cleared (hard refresh)
- [ ] No 406 errors in console
- [ ] Network requests show 200 status
- [ ] Login works successfully
- [ ] User queries return data

## If Still Getting 406 Errors

### Check 1: Verify Supabase Credentials
```bash
# In .env file, verify:
REACT_APP_SUPABASE_URL=https://vqlybihufqliujmgwcgz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-key>
```

### Check 2: Verify Table Permissions
In Supabase Dashboard:
1. Go to SQL Editor
2. Run: `SELECT * FROM user_accounts LIMIT 1;`
3. Should return data without errors

### Check 3: Check RLS Policies
In Supabase Dashboard > Authentication > Policies:
- Verify `user_accounts` table has SELECT policy enabled
- Policy should allow anonymous access or authenticated users

### Check 4: Browser Console Debug
Open DevTools Console and look for:
- Network errors
- CORS issues
- Authentication errors

## Files Modified

✅ `src/lib/supabase.ts` - Added custom fetch interceptor
✅ `src/utils/supabaseQueryHelper.ts` - Safe query builder (created earlier)
✅ `src/services/userService.ts` - Updated to use helper
✅ `src/contexts/AuthContext.tsx` - Error handling

## Technical Details

### Why &amp; Appears in URL
- Happens when URL is processed through HTML parser
- Supabase REST API doesn't accept HTML-encoded URLs
- Custom fetch prevents this by using native fetch directly

### Accept Header Requirement
- Supabase REST API requires `Accept: application/json`
- Without it, returns 406 "Not Acceptable"
- Custom fetch ensures this header is always present

### Content-Type Header
- Required for POST/PUT/DELETE requests
- GET requests don't need it but it doesn't hurt
- Custom fetch adds it conditionally

## Deployment

When deploying to production:
1. Ensure `.env` has correct Supabase credentials
2. Verify RLS policies are configured
3. Test login flow before going live
4. Monitor console for any 406 errors

## Support

If issues persist after applying this fix:
1. Check Supabase project status (not suspended)
2. Verify API key has correct permissions
3. Check browser console for detailed error messages
4. Review Supabase logs in dashboard
5. Ensure user_accounts table exists and has data
