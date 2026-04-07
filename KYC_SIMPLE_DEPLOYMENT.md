# KYC Button Fix - SIMPLE Deployment Guide

## 🚀 Quick Start

All code changes are complete. Just run the SQL migration below.

---

## Step 1: Run SQL Migration

### Copy and paste this SQL into Supabase SQL Editor:

```sql
-- Create KYC Submissions Table
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

-- Update user_profiles constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS chk_kyc_status;

ALTER TABLE user_profiles ADD CONSTRAINT chk_kyc_status 
  CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'));
```

**Expected Result:** ✅ All statements execute successfully

---

## Step 2: Verify Database

### Check table created:
```sql
SELECT * FROM kyc_submissions LIMIT 1;
```

### Check constraint updated:
```sql
SELECT constraint_definition FROM information_schema.check_constraints 
WHERE constraint_name = 'chk_kyc_status';
```

---

## Step 3: Deploy Code

All code is already updated. Just deploy:

```bash
npm install
npm run build
npm start
```

---

## Step 4: Test

1. Open DevTools (F12)
2. Go to Dashboard
3. Look for console logs: `🔍 KYC Status Debug`
4. Verify KYC button appears

---

## ✅ What's Fixed

1. ✅ Dashboard handles 'submitted' status
2. ✅ KYC service updates user_profiles
3. ✅ Database has kyc_submissions table
4. ✅ Database constraint allows 'submitted'
5. ✅ CSS displays all 4 buttons

---

## 🎉 Done!

KYC button will now display correctly on the Dashboard!
