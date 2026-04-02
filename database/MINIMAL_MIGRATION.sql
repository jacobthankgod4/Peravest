-- PERAVEST MINIMAL WORKING MIGRATION
-- Creates only essential missing tables

BEGIN;

-- Target Savings
CREATE TABLE IF NOT EXISTS public.target_savings (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" INT NOT NULL,
  "goal_name" VARCHAR(255) NOT NULL,
  "target_amount" NUMERIC(20,2) NOT NULL,
  "current_amount" NUMERIC(20,2) DEFAULT 0.00,
  "monthly_contribution" NUMERIC(20,2),
  "target_date" DATE,
  "interest_rate" NUMERIC(5,2) DEFAULT 12.00,
  "status" VARCHAR(32) DEFAULT 'active',
  "auto_debit" BOOLEAN DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajo Groups
CREATE TABLE IF NOT EXISTS public.ajo_groups (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "contribution_amount" NUMERIC(20,2) NOT NULL,
  "frequency" VARCHAR(32) NOT NULL,
  "max_members" INT NOT NULL,
  "current_members" INT DEFAULT 0,
  "start_date" DATE,
  "end_date" DATE,
  "status" VARCHAR(32) DEFAULT 'open',
  "created_by" INT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajo Memberships
CREATE TABLE IF NOT EXISTS public.ajo_memberships (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "group_id" INT NOT NULL,
  "user_id" INT NOT NULL,
  "position" INT,
  "status" VARCHAR(32) DEFAULT 'active',
  "total_contributed" NUMERIC(20,2) DEFAULT 0.00,
  "payout_received" BOOLEAN DEFAULT FALSE,
  "payout_date" DATE,
  "joined_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajo Contributions
CREATE TABLE IF NOT EXISTS public.ajo_contributions (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "membership_id" INT NOT NULL,
  "amount" NUMERIC(20,2) NOT NULL,
  "contribution_date" DATE NOT NULL,
  "status" VARCHAR(32) DEFAULT 'pending',
  "payment_reference" VARCHAR(255),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Savings Transactions
CREATE TABLE IF NOT EXISTS public.savings_transactions (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "savings_id" INT NOT NULL,
  "transaction_type" VARCHAR(32) NOT NULL,
  "amount" NUMERIC(20,2) NOT NULL,
  "balance_before" NUMERIC(20,2),
  "balance_after" NUMERIC(20,2),
  "reference" VARCHAR(255),
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Investments
CREATE TABLE IF NOT EXISTS public.user_investments (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" INT NOT NULL,
  "property_id" INT NOT NULL,
  "investment_id" INT NOT NULL,
  "amount_invested" NUMERIC(20,2) NOT NULL,
  "shares_owned" INT NOT NULL DEFAULT 1,
  "investment_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" VARCHAR(32) NOT NULL DEFAULT 'active',
  "expected_return" NUMERIC(20,2),
  "actual_return" NUMERIC(20,2) DEFAULT 0.00,
  "maturity_date" DATE,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" INT NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "type" VARCHAR(50) NOT NULL,
  "is_read" BOOLEAN DEFAULT FALSE,
  "action_url" VARCHAR(500),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "read_at" TIMESTAMP
);

-- User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" INT NOT NULL UNIQUE,
  "phone" VARCHAR(20),
  "date_of_birth" DATE,
  "address" TEXT,
  "city" VARCHAR(100),
  "state" VARCHAR(100),
  "country" VARCHAR(100) DEFAULT 'Nigeria',
  "occupation" VARCHAR(255),
  "income_range" VARCHAR(50),
  "investment_experience" VARCHAR(50),
  "risk_tolerance" VARCHAR(50),
  "kyc_status" VARCHAR(32) DEFAULT 'pending',
  "kyc_documents" JSONB,
  "profile_picture" VARCHAR(500),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add basic foreign keys only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_target_savings_user') THEN
        ALTER TABLE public.target_savings ADD CONSTRAINT fk_target_savings_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ajo_groups_created_by') THEN
        ALTER TABLE public.ajo_groups ADD CONSTRAINT fk_ajo_groups_created_by 
        FOREIGN KEY ("created_by") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ajo_memberships_group') THEN
        ALTER TABLE public.ajo_memberships ADD CONSTRAINT fk_ajo_memberships_group 
        FOREIGN KEY ("group_id") REFERENCES public.ajo_groups("Id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ajo_memberships_user') THEN
        ALTER TABLE public.ajo_memberships ADD CONSTRAINT fk_ajo_memberships_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ajo_contributions_membership') THEN
        ALTER TABLE public.ajo_contributions ADD CONSTRAINT fk_ajo_contributions_membership 
        FOREIGN KEY ("membership_id") REFERENCES public.ajo_memberships("Id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_savings_transactions_savings') THEN
        ALTER TABLE public.savings_transactions ADD CONSTRAINT fk_savings_transactions_savings 
        FOREIGN KEY ("savings_id") REFERENCES public.target_savings("Id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_investments_user') THEN
        ALTER TABLE public.user_investments ADD CONSTRAINT fk_user_investments_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_investments_property') THEN
        ALTER TABLE public.user_investments ADD CONSTRAINT fk_user_investments_property 
        FOREIGN KEY ("property_id") REFERENCES public.property("Id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_investments_investment') THEN
        ALTER TABLE public.user_investments ADD CONSTRAINT fk_user_investments_investment 
        FOREIGN KEY ("investment_id") REFERENCES public.investment("Id_in") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_user') THEN
        ALTER TABLE public.notifications ADD CONSTRAINT fk_notifications_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_profiles_user') THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT fk_user_profiles_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;
END $$;

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_target_savings_user ON public.target_savings("user_id");
CREATE INDEX IF NOT EXISTS idx_ajo_groups_status ON public.ajo_groups("status");
CREATE INDEX IF NOT EXISTS idx_ajo_memberships_group ON public.ajo_memberships("group_id");
CREATE INDEX IF NOT EXISTS idx_ajo_memberships_user ON public.ajo_memberships("user_id");
CREATE INDEX IF NOT EXISTS idx_user_investments_user ON public.user_investments("user_id");
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications("user_id");

COMMIT;