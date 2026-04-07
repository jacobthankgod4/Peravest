## EXPERT FIX - IMMEDIATE ACTION REQUIRED

### The Issue
Your Supabase database is missing the `user_accounts` table and other required tables. The application code expects these tables but they don't exist, causing 406 errors.

### The Fix (Copy-Paste Ready)

**STEP 1: Go to Supabase Dashboard**
- URL: https://app.supabase.com
- Select project: vqlybihufqliujmgwcgz

**STEP 2: Open SQL Editor**
- Click "SQL Editor" in left sidebar
- Click "New Query"

**STEP 3: Copy the SQL from below and paste into Supabase**

---

### SQL TO EXECUTE (Copy Everything Below)

```sql
-- Create user_accounts table
DROP TABLE IF EXISTS user_accounts CASCADE;

CREATE TABLE user_accounts (
  "Id" BIGSERIAL PRIMARY KEY,
  "User_Type" VARCHAR(50) NOT NULL DEFAULT 'user',
  "Email" VARCHAR(255) NOT NULL UNIQUE,
  "Name" VARCHAR(255),
  "age" INT,
  "gender" VARCHAR(16),
  "bank" VARCHAR(128),
  "Account" VARCHAR(128),
  "Password" VARCHAR(255),
  "account_activation_hash" VARCHAR(255),
  "reset_token_hash" VARCHAR(255),
  "reset_token_expires_at" TIMESTAMP,
  "status" VARCHAR(32) NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_accounts_email ON user_accounts("Email");
CREATE INDEX idx_user_accounts_status ON user_accounts("status");

ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_user_accounts" ON user_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_user_accounts" ON user_accounts FOR SELECT USING (true);
CREATE POLICY "allow_update_user_accounts" ON user_accounts FOR UPDATE USING (true);
CREATE POLICY "allow_delete_user_accounts" ON user_accounts FOR DELETE USING (true);

-- Create user_profiles table
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  occupation VARCHAR(100),
  annual_income DECIMAL(15,2),
  investment_experience VARCHAR(50),
  risk_tolerance VARCHAR(20),
  kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  kyc_documents JSON,
  referral_code VARCHAR(20) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_investment_experience CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
  CONSTRAINT chk_risk_tolerance CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  CONSTRAINT chk_kyc_status CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'))
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_kyc_status ON user_profiles(kyc_status);
CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_user_profiles" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_user_profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "allow_update_user_profiles" ON user_profiles FOR UPDATE USING (true);
CREATE POLICY "allow_delete_user_profiles" ON user_profiles FOR DELETE USING (true);

-- Create kyc_submissions table
DROP TABLE IF EXISTS kyc_submissions CASCADE;

CREATE TABLE kyc_submissions (
  id BIGSERIAL PRIMARY KEY,
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
  CONSTRAINT chk_kyc_submission_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX idx_kyc_submissions_status ON kyc_submissions(status);

ALTER TABLE kyc_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_kyc_submissions" ON kyc_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_kyc_submissions" ON kyc_submissions FOR SELECT USING (true);
CREATE POLICY "allow_update_kyc_submissions" ON kyc_submissions FOR UPDATE USING (true);
CREATE POLICY "allow_delete_kyc_submissions" ON kyc_submissions FOR DELETE USING (true);

-- Create referrals table
DROP TABLE IF EXISTS referrals CASCADE;

CREATE TABLE referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  referral_code VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending',
  bonus_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_referral_status CHECK (status IN ('pending', 'completed', 'paid'))
);

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON referrals(status);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_referrals" ON referrals FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_referrals" ON referrals FOR SELECT USING (true);
CREATE POLICY "allow_update_referrals" ON referrals FOR UPDATE USING (true);
CREATE POLICY "allow_delete_referrals" ON referrals FOR DELETE USING (true);

-- Create withdrawals table
DROP TABLE IF EXISTS withdrawals CASCADE;

CREATE TABLE withdrawals (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  bank_name VARCHAR(255),
  account_number VARCHAR(50),
  account_name VARCHAR(255),
  reference VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_withdrawal_status CHECK (status IN ('pending', 'approved', 'rejected', 'completed'))
);

CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_withdrawals" ON withdrawals FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_withdrawals" ON withdrawals FOR SELECT USING (true);
CREATE POLICY "allow_update_withdrawals" ON withdrawals FOR UPDATE USING (true);
CREATE POLICY "allow_delete_withdrawals" ON withdrawals FOR DELETE USING (true);

-- Create invest_now table
DROP TABLE IF EXISTS invest_now CASCADE;

CREATE TABLE invest_now (
  id BIGSERIAL PRIMARY KEY,
  Usa_Id BIGINT NOT NULL,
  share_cost DECIMAL(15,2),
  interest DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invest_now_usa_id ON invest_now(Usa_Id);
CREATE INDEX idx_invest_now_status ON invest_now(status);

ALTER TABLE invest_now ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_insert_invest_now" ON invest_now FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_invest_now" ON invest_now FOR SELECT USING (true);
CREATE POLICY "allow_update_invest_now" ON invest_now FOR UPDATE USING (true);
CREATE POLICY "allow_delete_invest_now" ON invest_now FOR DELETE USING (true);
```

---

### STEP 4: Execute in Supabase

1. Select ALL the SQL above (Ctrl+A)
2. Paste into Supabase SQL Editor
3. Click "Run" button
4. Wait for "Success" message

### STEP 5: Verify Tables Created

In Supabase SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- invest_now
- kyc_submissions
- referrals
- user_accounts ✅
- user_profiles
- withdrawals

### STEP 6: Test Application

1. Refresh browser (Ctrl+F5)
2. Clear cache (Ctrl+Shift+Delete)
3. Open application
4. Try to login
5. Check browser console (F12) - should have NO 406 errors

### Expected Result

✅ No more 406 errors
✅ Application loads successfully
✅ Can login and access features
✅ Referral system works
✅ KYC submission works
✅ Withdrawal requests work

### If Still Getting Errors

1. **Verify tables in Supabase Dashboard**
   - Go to "Table Editor"
   - Should see all 6 tables listed

2. **Check RLS policies**
   - Go to "Authentication" → "Policies"
   - Should see policies for each table

3. **Check API Documentation**
   - Go to "API Documentation"
   - Search for "user_accounts"
   - Should be listed

4. **Clear browser cache completely**
   - Ctrl+Shift+Delete
   - Select "All time"
   - Clear all

5. **Restart development server**
   - Stop: Ctrl+C
   - Start: npm start

### Support

If you encounter any issues:
1. Check the SQL syntax is correct
2. Verify you're in the correct Supabase project
3. Check that you have admin permissions
4. Review error messages in Supabase SQL Editor
