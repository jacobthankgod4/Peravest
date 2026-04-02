-- PERAVEST SUPABASE MIGRATION
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vqlybihufqliujmgwcgz/editor

-- 1. CREATE INVESTMENTS TABLE (using TEXT for user_id to be flexible)
CREATE TABLE IF NOT EXISTS public.investments (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  property_id BIGINT,
  amount DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  maturity_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  investment_id BIGINT REFERENCES public.investments(id),
  amount DECIMAL(15,2) NOT NULL,
  transfer_code VARCHAR(100),
  otp_code VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE SAVINGS PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS public.savings_programs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  program_type VARCHAR(50) NOT NULL,
  target_amount DECIMAL(15,2),
  current_amount DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_user_id ON public.savings_programs(user_id);

-- 5. ENABLE RLS
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_programs ENABLE ROW LEVEL SECURITY;

-- 6. DROP EXISTING POLICIES IF THEY EXIST
DROP POLICY IF EXISTS "Users view own investments" ON public.investments;
DROP POLICY IF EXISTS "Users create own investments" ON public.investments;
DROP POLICY IF EXISTS "Users view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users create own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users view own savings" ON public.savings_programs;

-- 7. CREATE POLICIES (using TEXT comparison)
CREATE POLICY "Users view own investments" ON public.investments 
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users create own investments" ON public.investments 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users view own withdrawals" ON public.withdrawals 
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users create own withdrawals" ON public.withdrawals 
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users view own savings" ON public.savings_programs 
  FOR SELECT USING (auth.uid()::text = user_id);
