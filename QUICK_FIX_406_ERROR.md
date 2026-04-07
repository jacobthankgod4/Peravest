# 406 Error - Quick Fix Guide

## What's Fixed
✅ Custom fetch interceptor added to Supabase client
✅ Proper Accept headers enforced
✅ HTML entity encoding issue resolved

## Immediate Actions Required

### 1. Stop Dev Server
```bash
Ctrl+C (or Cmd+C on Mac)
```

### 2. Clear Cache
```bash
# Windows
rmdir /s /q node_modules\.cache

# Mac/Linux
rm -rf node_modules/.cache
```

### 3. Restart Dev Server
```bash
npm start
```

### 4. Hard Refresh Browser
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 5. Test Login
1. Navigate to `http://localhost:3000/login`
2. Enter valid credentials
3. Open DevTools (F12)
4. Go to Console tab
5. Look for any 406 errors - should be NONE

### 6. Verify Network Requests
1. Open DevTools Network tab
2. Go to `/login`
3. Look for requests to `supabase.co`
4. All should show `200` status, NOT `406`

## Expected Results

✅ No 406 errors in console
✅ Login works successfully
✅ User data loads without errors
✅ All Supabase queries return 200 status

## If Still Seeing 406 Errors

### Check 1: Verify File Was Updated
Open `src/lib/supabase.ts` and confirm it has:
```typescript
const customFetch = (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  ...
}
```

### Check 2: Verify Environment Variables
Open `.env` file and confirm:
```
REACT_APP_SUPABASE_URL=https://vqlybihufqliujmgwcgz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-key-here>
```

### Check 3: Full Clean Restart
```bash
# Kill dev server
Ctrl+C

# Remove all caches
rm -rf node_modules/.cache
rm -rf build

# Clear browser cache
# In Chrome: DevTools > Application > Clear site data

# Restart
npm start
```

### Check 4: Verify Supabase Table
In Supabase Dashboard:
1. Go to SQL Editor
2. Run: `SELECT * FROM user_accounts LIMIT 1;`
3. Should return data

## Files Modified
- ✅ `src/lib/supabase.ts` - Custom fetch handler added

## Support
If issues persist:
1. Check Supabase project is active (not suspended)
2. Verify API key is correct
3. Check user_accounts table exists
4. Review Supabase logs for API errors
