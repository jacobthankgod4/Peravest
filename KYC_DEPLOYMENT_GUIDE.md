# KYC Button Fix - Deployment Guide

## Overview
All code changes have been made to fix the KYC button visibility issue. This guide walks you through deploying these changes.

---

## Pre-Deployment Checklist

- [ ] You have access to Supabase database
- [ ] You have git access to the repository
- [ ] You have npm/yarn installed
- [ ] You have a backup of the database (recommended)

---

## Step 1: Apply Database Migrations

### 1.1 Create KYC Submissions Table

**File:** `database/017_create_kyc_submissions_pg.sql`

**Action:** Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS kyc_submissions (
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
  CONSTRAINT fk_kyc_submissions_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE,
  CONSTRAINT chk_kyc_submission_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);
```

**Expected Result:** ✅ Table created successfully

---

### 1.2 Update User Profiles Constraint

**File:** `database/018_update_kyc_status_constraint.sql`

**Action:** Run this SQL in your Supabase SQL editor:

```sql
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS chk_kyc_status;

ALTER TABLE user_profiles ADD CONSTRAINT chk_kyc_status 
  CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'));

ALTER TABLE user_profiles ALTER COLUMN kyc_status SET DEFAULT 'pending';
```

**Expected Result:** ✅ Constraint updated successfully

---

## Step 2: Deploy Code Changes

### 2.1 Update Dashboard Component

**File:** `src/components_main/Dashboard.tsx`

**Status:** ✅ Already updated with:
- New KYC status mapping object
- Support for 'submitted' status
- Improved console logging

**Verification:**
```bash
# Check if file has the new status map
grep -n "const statusMap" src/components_main/Dashboard.tsx
# Should show the status mapping around line 65
```

---

### 2.2 Update KYC Verification Service

**File:** `src/services/kycVerificationService.ts`

**Status:** ✅ Already updated with:
- User authentication check
- User ID retrieval
- User profiles update after submission
- Improved error handling

**Verification:**
```bash
# Check if file has the user_profiles update
grep -n "user_profiles" src/services/kycVerificationService.ts
# Should show the update statement around line 80
```

---

### 2.3 CSS Already Fixed

**File:** `src/components_main/Dashboard.module.css`

**Status:** ✅ Already fixed with:
- Flex layout changed to `flex: 1 1 auto`
- KYC button styling added
- Responsive breakpoints added

---

## Step 3: Build and Test

### 3.1 Install Dependencies
```bash
npm install
```

### 3.2 Build the Project
```bash
npm run build
```

**Expected Result:** ✅ Build completes without errors

### 3.3 Start Development Server
```bash
npm start
```

**Expected Result:** ✅ Server starts on http://localhost:3000

---

## Step 4: Verify Fixes

### 4.1 Check Console Logs

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to Dashboard
4. Look for these logs:

```
🔍 KYC Status Debug
  Current KYC Status: [status]
  Should Show KYC Button: [true/false]
  Button Condition: [true/false]

🔍 Loading KYC Status
  User ID: [id]

✅ Profile Data: { kyc_status: '[status]' }
Raw KYC Status from DB: [status]

📄 Setting KYC to: [mapped_status]
```

### 4.2 Test KYC Button Display

**Test Case 1: User with 'pending' status**
- Expected: KYC button shows with text "Complete KYC"
- Expected: KYC alert shows with yellow background

**Test Case 2: User with 'submitted' status**
- Expected: KYC button shows with text "KYC Pending"
- Expected: KYC alert shows with yellow background

**Test Case 3: User with 'approved' status**
- Expected: KYC button hidden
- Expected: No KYC alert
- Expected: Badge shows "KYC Verified"

**Test Case 4: User with 'rejected' status**
- Expected: KYC button shows with text "Complete KYC"
- Expected: KYC alert shows with red background

### 4.3 Test KYC Submission

1. Navigate to `/kyc` page
2. Fill out the form completely
3. Submit the form
4. Check database:
   ```sql
   SELECT kyc_status FROM user_profiles WHERE user_id = [YOUR_USER_ID];
   ```
   Expected: `'submitted'`

5. Refresh dashboard
6. Verify KYC button still shows with "KYC Pending" text

---

## Step 5: Deploy to Production

### 5.1 Commit Changes
```bash
git add .
git commit -m "Fix: KYC button visibility - handle submitted status"
```

### 5.2 Push to Repository
```bash
git push origin main
```

### 5.3 Deploy to Vercel/Hosting
```bash
# If using Vercel
vercel deploy --prod

# Or your hosting provider's deployment command
```

---

## Troubleshooting

### Issue: KYC button still not showing

**Check 1: Database migration applied?**
```sql
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'user_profiles' AND constraint_name LIKE '%kyc%';
```
Should show: `chk_kyc_status`

**Check 2: Code deployed?**
```bash
grep -n "const statusMap" src/components_main/Dashboard.tsx
```
Should find the status mapping

**Check 3: Console logs?**
- Open DevTools
- Check for "🔍 KYC Status Debug" logs
- Verify status is being mapped correctly

### Issue: Build fails

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Database migration fails

**Solution:**
1. Check if table already exists:
   ```sql
   SELECT * FROM kyc_submissions LIMIT 1;
   ```

2. If table exists, skip migration 017

3. Check constraint:
   ```sql
   SELECT constraint_name FROM information_schema.table_constraints 
   WHERE table_name = 'user_profiles';
   ```

---

## Rollback Plan

If something goes wrong, here's how to rollback:

### Rollback Database
```sql
-- Drop kyc_submissions table
DROP TABLE IF EXISTS kyc_submissions CASCADE;

-- Restore old constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS chk_kyc_status;
ALTER TABLE user_profiles ADD CONSTRAINT chk_kyc_status 
  CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'));
```

### Rollback Code
```bash
git revert HEAD
git push origin main
```

---

## Verification Checklist

After deployment, verify:

- [ ] Database migrations applied successfully
- [ ] No compilation errors
- [ ] KYC button appears on dashboard
- [ ] KYC button shows for non-verified users
- [ ] KYC button hides for verified users
- [ ] KYC alert displays correctly
- [ ] All 4 buttons visible (Invest, Withdraw, Refer, KYC)
- [ ] Console logs show correct status mapping
- [ ] KYC submission updates database
- [ ] Dashboard refreshes after KYC submission

---

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Review the troubleshooting section above
3. Check database migrations were applied
4. Verify code changes are deployed
5. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## Summary

All fixes have been applied:

✅ Dashboard KYC status logic updated
✅ KYC verification service updated
✅ Database migrations created
✅ CSS flex layout fixed
✅ Console logging added

**Result:** KYC button will now display correctly for all non-verified users!
