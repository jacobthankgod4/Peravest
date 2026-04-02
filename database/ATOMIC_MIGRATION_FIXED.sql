-- PERAVEST ATOMIC DATABASE MIGRATION - FIXED
-- Industry Standard Complete Schema Creation
-- Execute as single transaction for atomicity

BEGIN;

-- =============================================
-- CORE MISSING TABLES
-- =============================================

-- User Investments (Many-to-Many: Users <-> Properties)
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
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  "joined_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajo Contributions
CREATE TABLE IF NOT EXISTS public.ajo_contributions (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "membership_id" INT NOT NULL,
  "amount" NUMERIC(20,2) NOT NULL,
  "contribution_date" DATE NOT NULL,
  "status" VARCHAR(32) DEFAULT 'pending',
  "payment_reference" VARCHAR(255),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Property Images
CREATE TABLE IF NOT EXISTS public.property_images (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "property_id" INT NOT NULL,
  "image_url" VARCHAR(500) NOT NULL,
  "image_type" VARCHAR(50) DEFAULT 'gallery',
  "alt_text" VARCHAR(255),
  "sort_order" INT DEFAULT 0,
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Property Videos
CREATE TABLE IF NOT EXISTS public.property_videos (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "property_id" INT NOT NULL,
  "video_url" VARCHAR(500) NOT NULL,
  "video_type" VARCHAR(50) DEFAULT 'tour',
  "title" VARCHAR(255),
  "description" TEXT,
  "duration" INT,
  "thumbnail_url" VARCHAR(500),
  "is_active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" INT NOT NULL,
  "session_token" VARCHAR(255) NOT NULL UNIQUE,
  "ip_address" INET,
  "user_agent" TEXT,
  "is_active" BOOLEAN DEFAULT TRUE,
  "last_activity" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Email Verifications
CREATE TABLE IF NOT EXISTS public.email_verifications (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "user_id" INT NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "verification_token" VARCHAR(255) NOT NULL,
  "is_verified" BOOLEAN DEFAULT FALSE,
  "verified_at" TIMESTAMP,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FOREIGN KEY CONSTRAINTS (with IF NOT EXISTS check)
-- =============================================

DO $$
BEGIN
    -- User Investments constraints
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

    -- Target Savings constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_target_savings_user') THEN
        ALTER TABLE public.target_savings ADD CONSTRAINT fk_target_savings_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;

    -- Ajo Groups constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ajo_groups_created_by') THEN
        ALTER TABLE public.ajo_groups ADD CONSTRAINT fk_ajo_groups_created_by 
        FOREIGN KEY ("created_by") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;

    -- Ajo Memberships constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ajo_memberships_group') THEN
        ALTER TABLE public.ajo_memberships ADD CONSTRAINT fk_ajo_memberships_group 
        FOREIGN KEY ("group_id") REFERENCES public.ajo_groups("Id") ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ajo_memberships_user') THEN
        ALTER TABLE public.ajo_memberships ADD CONSTRAINT fk_ajo_memberships_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;

    -- Ajo Contributions constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ajo_contributions_membership') THEN
        ALTER TABLE public.ajo_contributions ADD CONSTRAINT fk_ajo_contributions_membership 
        FOREIGN KEY ("membership_id") REFERENCES public.ajo_memberships("Id") ON DELETE CASCADE;
    END IF;

    -- Savings Transactions constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_savings_transactions_savings') THEN
        ALTER TABLE public.savings_transactions ADD CONSTRAINT fk_savings_transactions_savings 
        FOREIGN KEY ("savings_id") REFERENCES public.target_savings("Id") ON DELETE CASCADE;
    END IF;

    -- Notifications constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_user') THEN
        ALTER TABLE public.notifications ADD CONSTRAINT fk_notifications_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;

    -- User Profiles constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_profiles_user') THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT fk_user_profiles_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;

    -- Property Images constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_property_images_property') THEN
        ALTER TABLE public.property_images ADD CONSTRAINT fk_property_images_property 
        FOREIGN KEY ("property_id") REFERENCES public.property("Id") ON DELETE CASCADE;
    END IF;

    -- Property Videos constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_property_videos_property') THEN
        ALTER TABLE public.property_videos ADD CONSTRAINT fk_property_videos_property 
        FOREIGN KEY ("property_id") REFERENCES public.property("Id") ON DELETE CASCADE;
    END IF;

    -- User Sessions constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_sessions_user') THEN
        ALTER TABLE public.user_sessions ADD CONSTRAINT fk_user_sessions_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;

    -- Email Verifications constraints
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_email_verifications_user') THEN
        ALTER TABLE public.email_verifications ADD CONSTRAINT fk_email_verifications_user 
        FOREIGN KEY ("user_id") REFERENCES public.users("Id") ON DELETE CASCADE;
    END IF;
END $$;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_investments_user ON public.user_investments("user_id");
CREATE INDEX IF NOT EXISTS idx_user_investments_property ON public.user_investments("property_id");
CREATE INDEX IF NOT EXISTS idx_user_investments_status ON public.user_investments("status");

CREATE INDEX IF NOT EXISTS idx_target_savings_user ON public.target_savings("user_id");
CREATE INDEX IF NOT EXISTS idx_target_savings_status ON public.target_savings("status");

CREATE INDEX IF NOT EXISTS idx_ajo_groups_status ON public.ajo_groups("status");
CREATE INDEX IF NOT EXISTS idx_ajo_groups_created_by ON public.ajo_groups("created_by");

CREATE INDEX IF NOT EXISTS idx_ajo_memberships_group ON public.ajo_memberships("group_id");
CREATE INDEX IF NOT EXISTS idx_ajo_memberships_user ON public.ajo_memberships("user_id");

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications("user_id");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications("is_read");

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON public.user_sessions("user_id");
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions("session_token");
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions("is_active");

CREATE INDEX IF NOT EXISTS idx_property_images_property ON public.property_images("property_id");
CREATE INDEX IF NOT EXISTS idx_property_images_active ON public.property_images("is_active");

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ajo_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ajo_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ajo_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
DROP POLICY IF EXISTS "Users can view own investments" ON public.user_investments;
CREATE POLICY "Users can view own investments" ON public.user_investments FOR SELECT 
  USING (auth.uid()::text = "user_id"::text);

DROP POLICY IF EXISTS "Users can view own target savings" ON public.target_savings;
CREATE POLICY "Users can view own target savings" ON public.target_savings FOR SELECT 
  USING (auth.uid()::text = "user_id"::text);

DROP POLICY IF EXISTS "Anyone can view ajo groups" ON public.ajo_groups;
CREATE POLICY "Anyone can view ajo groups" ON public.ajo_groups FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can view own ajo memberships" ON public.ajo_memberships;
CREATE POLICY "Users can view own ajo memberships" ON public.ajo_memberships FOR SELECT 
  USING (auth.uid()::text = "user_id"::text);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT 
  USING (auth.uid()::text = "user_id"::text);

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT 
  USING (auth.uid()::text = "user_id"::text);

DROP POLICY IF EXISTS "Anyone can view property images" ON public.property_images;
CREATE POLICY "Anyone can view property images" ON public.property_images FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Anyone can view property videos" ON public.property_videos;
CREATE POLICY "Anyone can view property videos" ON public.property_videos FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT 
  USING (auth.uid()::text = "user_id"::text);

COMMIT;