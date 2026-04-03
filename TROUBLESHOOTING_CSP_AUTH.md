# Troubleshooting Guide: CSP & Supabase Auth Issues

## Issue 1: CSP Blob Script Violation

### Error Message
```
Loading the script 'blob:https://...' violates the following Content Security Policy directive: 
"script-src * 'unsafe-inline' 'unsafe-eval'"
```

### Root Cause
The CSP header doesn't allow `blob:` scheme for scripts.

### Solution
✅ **FIXED** - Updated `vercel.json` with:
```json
"Content-Security-Policy": "script-src * 'unsafe-inline' 'unsafe-eval' blob:; ..."
```

### Verification
1. Deploy to Vercel
2. Check browser DevTools → Network → Response Headers
3. Verify `Content-Security-Policy` includes `blob:`

---

## Issue 2: Supabase Auth 500 Error

### Error Message
```
POST https://vqlybihufqliujmgwcgz.supabase.co/auth/v1/signup 500 (Internal Server Error)
TypeError: Failed to fetch
```

### Root Causes
1. Missing/invalid Supabase credentials
2. Supabase project not configured
3. Auth settings disabled in Supabase
4. Network/CORS issues

### Solutions

#### Step 1: Verify Environment Variables
```bash
# Check .env file has:
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

#### Step 2: Check Supabase Project
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy Project URL and Anon Key
5. Update `.env` file

#### Step 3: Enable Auth in Supabase
1. Go to Authentication → Providers
2. Enable Email provider
3. Go to Authentication → Settings
4. Verify email confirmation is configured

#### Step 4: Check CORS Settings
1. Go to Settings → API
2. Verify CORS settings allow your domain
3. Add Vercel domain to allowed origins

#### Step 5: Restart Development Server
```bash
npm start
```

---

## Issue 3: Network Disconnection Errors

### Error Message
```
Failed to load resource: net::ERR_INTERNET_DISCONNECTED
```

### Root Causes
1. Offline/no internet connection
2. Firewall blocking requests
3. DNS resolution issues
4. CORS headers missing

### Solutions
1. Check internet connection
2. Check firewall settings
3. Clear browser cache
4. Try incognito/private mode
5. Check CORS headers in vercel.json

---

## Issue 4: Paystack Integration Error

### Error Message
```
Unsafe attempt to load URL https://checkout.paystack.com/popup from frame
```

### Root Cause
Paystack domain not allowed in CSP frame-src directive.

### Solution
✅ **FIXED** - Updated CSP with:
```json
"frame-src https://checkout.paystack.com"
```

---

## Verification Checklist

### Before Deployment
- [ ] `.env` file has all required variables
- [ ] Supabase project is created and configured
- [ ] Supabase auth is enabled
- [ ] Paystack account is configured
- [ ] `vercel.json` has CSP headers

### After Deployment
- [ ] CSP headers are present in response
- [ ] Blob scripts load without errors
- [ ] Supabase auth works (signup/login)
- [ ] Paystack checkout loads
- [ ] All assets load (CSS, fonts, images)

### Testing Auth Flow
1. Go to signup page
2. Enter email and password
3. Click signup
4. Check browser console for errors
5. Verify Supabase auth email is sent
6. Check Supabase dashboard for new user

---

## Environment Variables Setup

### Local Development
Create `.env` file in project root:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=http://localhost:3000
REACT_APP_PAYSTACK_PUBLIC_KEY=your-paystack-key
```

### Vercel Deployment
1. Go to Vercel project settings
2. Go to Environment Variables
3. Add all variables from `.env`
4. Redeploy project

---

## Common Errors & Fixes

### Error: "Supabase credentials not configured"
**Fix:** Add environment variables to `.env` and restart dev server

### Error: "Failed to fetch from Supabase"
**Fix:** Check Supabase URL and key are correct

### Error: "Auth signup returns 500"
**Fix:** Check Supabase auth is enabled and email provider is configured

### Error: "Paystack popup blocked"
**Fix:** Verify CSP includes `frame-src https://checkout.paystack.com`

### Error: "CSS/fonts not loading"
**Fix:** Check CSP includes `style-src * 'unsafe-inline'` and `font-src * data:`

---

## Debug Mode

Enable debug logging:
```typescript
// In supabase.ts
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    debug: true  // Enable debug logging
  }
});
```

---

## Support Resources

- Supabase Docs: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Paystack Docs: https://paystack.com/docs
- CSP Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- Vercel Docs: https://vercel.com/docs

---

**Last Updated:** 2024  
**Status:** Active
