# 406 Error Fix - Expert Implementation Guide

## Problem Analysis
The 406 "Not Acceptable" error occurs when Supabase REST API receives malformed requests or when queries are not properly formatted. The error URL shows `&amp;` instead of `&`, indicating HTML entity encoding issues.

## Root Cause
- Improper query parameter formatting
- Missing error handling for edge cases
- Queries not using Supabase client's built-in safety features

## Solution Applied

### 1. Fixed Supabase Client Configuration
**File:** `src/lib/supabase.ts`

Removed invalid headers option and configured proper Supabase initialization with:
- Auto token refresh
- Session persistence
- URL detection for auth callbacks

### 2. Created Safe Query Helper
**File:** `src/utils/supabaseQueryHelper.ts`

New utility that provides:
- Properly formatted queries for user lookups
- Consistent error handling (PGRST116 = no results)
- Type-safe query building
- Prevents malformed REST API calls

### 3. Updated UserService
**File:** `src/services/userService.ts`

Now uses the safe query helper for all operations:
- `queryUserByEmail()` - Safe email lookups
- `queryUserById()` - Safe ID lookups
- `queryAllUsers()` - Safe bulk queries
- Proper null handling and error propagation

### 4. Enhanced AuthContext
**File:** `src/contexts/AuthContext.tsx`

Already has proper error handling:
- Graceful fallback when KYC profile missing
- Non-blocking profile queries
- Proper error logging

## Testing the Fix

### Step 1: Restart Development Server
```bash
npm start
```

### Step 2: Test Login Flow
1. Navigate to `/login`
2. Enter valid credentials
3. Check browser console - should see no 406 errors
4. Verify successful login

### Step 3: Verify Network Requests
Open DevTools Network tab:
- Look for requests to `/rest/v1/user_accounts`
- Should see 200 responses, not 406
- Check request parameters are properly formatted

### Step 4: Test Email Lookup
If you have admin features that look up users by email:
- Should work without 406 errors
- Returns user data or null if not found

## Why This Works

1. **Proper Query Building:** Supabase client automatically formats queries correctly
2. **Error Handling:** PGRST116 error code properly handled (no results found)
3. **Type Safety:** TypeScript ensures queries are built correctly
4. **No HTML Encoding:** Using client library prevents `&amp;` encoding issues

## Environment Variables Check
Ensure your `.env` file contains:
```
REACT_APP_SUPABASE_URL=https://vqlybihufqliujmgwcgz.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>
```

## Common Issues & Solutions

**Issue:** Still getting 406 errors
- Solution: Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache and cookies
- Restart dev server with `npm start`

**Issue:** "User not found" errors
- Solution: This is expected if user doesn't exist
- Check user exists in Supabase user_accounts table
- Verify email is correct

**Issue:** Login fails with network error
- Solution: Check Supabase URL and key in `.env`
- Verify Supabase project is active
- Check internet connection

## Files Modified
- ✅ `src/lib/supabase.ts` - Fixed client config
- ✅ `src/utils/supabaseQueryHelper.ts` - New safe query helper
- ✅ `src/services/userService.ts` - Updated to use helper
- ✅ `src/contexts/AuthContext.tsx` - Already has error handling

## Deployment Checklist
- [ ] Restart dev server
- [ ] Hard refresh browser
- [ ] Test login flow
- [ ] Verify no 406 errors in Network tab
- [ ] Test email lookups (if applicable)
- [ ] Deploy to production

## Support
If issues persist:
1. Check Supabase dashboard for table permissions
2. Verify RLS policies allow SELECT on user_accounts
3. Check browser console for detailed error messages
4. Review Supabase logs for API errors
5. Ensure user_accounts table exists and has data
