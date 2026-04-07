# KYC Button Fix - CORRECTED Deployment Guide

## ⚠️ IMPORTANT: Use Corrected SQL

The original migrations had schema reference issues. Use the corrected SQL below.

---

## Step 1: Apply Corrected Database Migrations

### Option A: Run Combined Migration (RECOMMENDED)

**File:** `database/017_018_CORRECTED_KYC_MIGRATIONS.sql`

Copy and paste this entire SQL into your Supabase SQL editor:

```sql
-- CORRECTED: Migration 017 - Create KYC Submissions Table
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  phone_number VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  bvn VARCHAR(11),
  nin VARCHAR(11),
  id_type VARCHAR(50),
  id_number VARCHAR(100),
  id_document_url TEXT,
  proof_of_address_url TEXT,
  selfie_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_kyc_submissions_user FOREIGN KEY (user_id) REFERENCES public.users("Id") ON DELETE CASCADE,
  CONSTRAINT chk_kyc_submission_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON public.kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON public.kyc_submissions(status);

-- CORRECTED: Migration 018 - Update user_profiles KYC status constraint
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS chk_kyc_status;

ALTER TABLE public.user_profiles ADD CONSTRAINT chk_kyc_status 
  CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'));

ALTER TABLE public.user_profiles ALTER COLUMN kyc_status SET DEFAULT 'pending';
```

**Expected Result:** ✅ All statements execute successfully

---

### Option B: Run Separately

If you prefer to run migrations separately:

**Migration 1: Create kyc_submissions table**
```sql
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  phone_number VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  bvn VARCHAR(11),
  nin VARCHAR(11),
  id_type VARCHAR(50),
  id_number VARCHAR(100),
  id_document_url TEXT,
  proof_of_address_url TEXT,
  selfie_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_kyc_submissions_user FOREIGN KEY (user_id) REFERENCES public.users("Id") ON DELETE CASCADE,
  CONSTRAINT chk_kyc_submission_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON public.kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON public.kyc_submissions(status);
```

**Migration 2: Update user_profiles constraint**
```sql
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS chk_kyc_status;

ALTER TABLE public.user_profiles ADD CONSTRAINT chk_kyc_status 
  CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'));

ALTER TABLE public.user_profiles ALTER COLUMN kyc_status SET DEFAULT 'pending';
```

---

## Step 2: Verify Database Changes

### Verify kyc_submissions table created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'kyc_submissions';
```
Expected: `kyc_submissions`

### Verify table structure:
```sql
\d public.kyc_submissions
```
Expected: Shows all columns and constraints

### Verify constraint updated:
```sql
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_schema = 'public' AND table_name = 'user_profiles' 
AND constraint_name LIKE '%kyc%';
```
Expected: `chk_kyc_status`

### Verify constraint allows 'submitted':
```sql
SELECT constraint_name, constraint_definition FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' AND constraint_name = 'chk_kyc_status';
```
Expected: Shows constraint includes 'submitted'

---

## Step 3: Deploy Code Changes

### Code files already updated:
- ✅ `src/components_main/Dashboard.tsx` - Status mapping
- ✅ `src/services/kycVerificationService.ts` - Corrected schema references
- ✅ `src/components_main/Dashboard.module.css` - Flex layout

### Deploy:
```bash
npm install
npm run build
npm start
```

---

## Step 4: Test

### Test 1: Check Console Logs
1. Open DevTools (F12)
2. Navigate to Dashboard
3. Look for "🔍 KYC Status Debug" logs
4. Verify status mapping is correct

### Test 2: Check Database
```sql
-- Check if kyc_submissions table exists
SELECT COUNT(*) FROM public.kyc_submissions;

-- Check user_profiles constraint
SELECT constraint_definition FROM information_schema.check_constraints 
WHERE constraint_name = 'chk_kyc_status';
```

### Test 3: Test KYC Submission
1. Go to /kyc page
2. Fill form and submit
3. Check database:
   ```sql
   SELECT kyc_status FROM public.user_profiles WHERE user_id = [YOUR_ID];
   ```
   Expected: `'submitted'`

---

## Key Corrections Made

### ✅ Schema References
- Changed `users` to `public.users`
- Changed `user_profiles` to `public.user_profiles`
- Changed `kyc_submissions` to `public.kyc_submissions`

### ✅ Column Names
- Changed `email` to `Email` (capital E)
- Changed `id` to `Id` (capital I) in users table
- Used correct column names from actual schema

### ✅ Foreign Key
- Corrected: `FOREIGN KEY (user_id) REFERENCES public.users("Id")`
- Note: `"Id"` is quoted because it's capitalized

---

## Troubleshooting

### Error: "relation 'users' does not exist"
**Solution:** Use `public.users` with schema prefix

### Error: "column 'email' does not exist"
**Solution:** Use `Email` with capital E

### Error: "column 'id' does not exist"
**Solution:** Use `Id` with capital I

### Error: "constraint already exists"
**Solution:** Use `DROP CONSTRAINT IF EXISTS` first

---

## Verification Checklist

- [ ] kyc_submissions table created
- [ ] Indexes created on kyc_submissions
- [ ] user_profiles constraint updated
- [ ] Constraint includes 'submitted' status
- [ ] No SQL errors
- [ ] Code deployed
- [ ] Console logs show correct status
- [ ] KYC button appears on dashboard

---

## Summary

All corrections have been made:
- ✅ SQL migrations corrected with proper schema references
- ✅ KYC service updated with correct column names
- ✅ Dashboard component ready
- ✅ CSS layout fixed

**Ready for deployment!** 🚀
