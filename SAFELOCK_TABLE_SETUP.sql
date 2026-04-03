
content.js:1 Loading the script 'blob:https://checkout.paystack.com/bf5a11cd-279e-4196-a4e3-a5c1788e9091' violates the following Content Security Policy directive: "script-src-elem 'self' https://checkout.gointerpay.net/ https://checkout.rch.io/v2.22/fingerprint https://www.googletagmanager.com/gtag/ https://s3-eu-west-1.amazonaws.com/pstk-public-files/js/pusher.min.js https://applepay.cdn-apple.com/jsapi/v1.1.0/apple-pay-sdk.js https://www.googletagmanager.com/debug/ 'sha384-QQMs28J0n8Mw4Q1CHlPa/iPNoI8cHTH141eSbWme69K7V+4TvvHzfFm+PuE4JpxF' 'nonce-RLWfNEcfGj59MGgU' 'sha384-kYN1NbScnNOnyvDqahb4am4uYrSJh/+eDDN9ipiMT/Xx6ivmTHrN4Eh1JD6JZ2Ek'". The action has been blocked.
(anonymous)	@	content.js:1
await in (anonymous)		
(anonymous)	@	content.js:1
(anonymous)	@	content.js:1
(anonymous)	@	content.js:1

4
register?return=%2Flistings:1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
fetch.ts:7 
 HEAD https://vqlybihufqliujmgwcgz.supabase.co/rest/v1/users?select=* 404 (Not Found)
(anonymous)	@	fetch.ts:7
(anonymous)	@	fetch.ts:34
await in (anonymous)		
then	@	PostgrestBuilder.ts:144
fetch.ts:7 
 HEAD https://vqlybihufqliujmgwcgz.supabase.co/rest/v1/users?select=* 404 (Not Found)
(anonymous)	@	fetch.ts:7
(anonymous)	@	fetch.ts:34
await in (anonymous)		
then	@	PostgrestBuilder.ts:144
fetch.ts:7 
 GET https://vqlybihufqliujmgwcgz.supabase.co/rest/v1/target_savings?select=target_amount%2Csaved_amount 400 (Bad Request)
(anonymous)	@	fetch.ts:7
(anonymous)	@	fetch.ts:34
await in (anonymous)		
then	@	PostgrestBuilder.ts:144
fetch.ts:7 
 GET https://vqlybihufqliujmgwcgz.supabase.co/rest/v1/target_savings?select=target_amount%2Csaved_amount 400 (Bad Request)
(anonymous)	@	fetch.ts:7
(anonymous)	@	fetch.ts:34
await in (anonymous)		
then	@	PostgrestBuilder.ts:144
Register.tsx:79 
 POST https://vqlybihufqliujmgwcgz.supabase.co/auth/v1/signup 500 (Internal Server Error)
handleSubmit	@	Register.tsx:79
-- ============================================
-- SAFELOCK TABLE SETUP - CORRECT ORDER
-- ============================================
-- Run these commands in order in Supabase SQL Editor

-- ============================================
-- STEP 1: CREATE SEQUENCE FIRST
-- ============================================
CREATE SEQUENCE IF NOT EXISTS public.safelock_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;

-- ============================================
-- STEP 2: CREATE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.safelock (
  id integer NOT NULL DEFAULT nextval('public.safelock_id_seq'::regclass),
  user_id integer NOT NULL,
  amount numeric NOT NULL,
  lock_period integer NOT NULL CHECK (lock_period IN (3, 6, 12)),
  interest_rate numeric NOT NULL,
  start_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  maturity_date timestamp without time zone,
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'matured'::character varying, 'withdrawn'::character varying, 'cancelled'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT safelock_pkey PRIMARY KEY (id),
  CONSTRAINT fk_safelock_user FOREIGN KEY (user_id) REFERENCES public.user_accounts(Id) ON DELETE CASCADE
);

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_safelock_user_id ON public.safelock(user_id);
CREATE INDEX IF NOT EXISTS idx_safelock_status ON public.safelock(status);
CREATE INDEX IF NOT EXISTS idx_safelock_created_at ON public.safelock(created_at);

-- ============================================
-- STEP 4: VERIFY TABLE CREATED
-- ============================================
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'safelock'
) as table_exists;

-- ============================================
-- STEP 5: TEST INSERT
-- ============================================
-- This will fail if user_id doesn't exist, which is expected
-- INSERT INTO public.safelock (user_id, amount, lock_period, interest_rate)
-- VALUES (1, 100000, 6, 15);

-- ============================================
-- STEP 6: VERIFY DATA
-- ============================================
SELECT * FROM public.safelock LIMIT 5;

-- ============================================
-- STEP 7: CHECK TABLE STRUCTURE
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'safelock'
ORDER BY ordinal_position;

-- ============================================
-- STEP 8: CHECK CONSTRAINTS
-- ============================================
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'safelock';

-- ============================================
-- STEP 9: CHECK INDEXES
-- ============================================
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'safelock';

-- ============================================
-- STEP 10: VERIFY FOREIGN KEY
-- ============================================
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public'
AND table_name = 'safelock';
