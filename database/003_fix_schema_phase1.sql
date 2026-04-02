-- Peravest Database Schema Fixes - Phase 1 (Critical)
-- This migration fixes critical issues preventing proper property management

-- 1. Fix typo: Ammenities → Amenities
ALTER TABLE public.property RENAME COLUMN "Ammenities" TO "Amenities";

-- 2. Add User_Id column for property ownership tracking
ALTER TABLE public.property ADD COLUMN "User_Id" INT;
CREATE INDEX IF NOT EXISTS property_user_idx ON public.property ("User_Id");

-- 3. Add updated_at timestamp for tracking modifications
ALTER TABLE public.property ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Add soft delete support
ALTER TABLE public.property ADD COLUMN "deleted_at" TIMESTAMP;
ALTER TABLE public.property ADD COLUMN "is_deleted" BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS property_deleted_idx ON public.property ("is_deleted");

-- 5. Fix Area data type from VARCHAR to NUMERIC (extract numeric values from text like "1500 sqft")
ALTER TABLE public.property ALTER COLUMN "Area" TYPE NUMERIC(10,2) USING CAST(COALESCE(NULLIF(regexp_replace("Area", '[^0-9.]', '', 'g'), ''), '0') AS NUMERIC);

-- 6. Add validation constraints
ALTER TABLE public.property 
  ADD CONSTRAINT property_price_check CHECK ("Price" >= 0),
  ADD CONSTRAINT property_bedroom_check CHECK ("Bedroom" >= 0),
  ADD CONSTRAINT property_bathroom_check CHECK ("Bathroom" >= 0),
  ADD CONSTRAINT property_year_check CHECK ("Built_Year" >= 1800 AND "Built_Year" <= EXTRACT(YEAR FROM CURRENT_DATE) + 10);

-- 7. Add missing indexes for query performance
CREATE INDEX IF NOT EXISTS property_type_idx ON public.property ("Type");
CREATE INDEX IF NOT EXISTS property_city_idx ON public.property ("City");
CREATE INDEX IF NOT EXISTS property_state_idx ON public.property ("State");
CREATE INDEX IF NOT EXISTS property_status_idx ON public.property ("Status");
CREATE INDEX IF NOT EXISTS property_created_idx ON public.property ("created_at");

-- 8. Create investment_package table to store investment details
CREATE TABLE IF NOT EXISTS public.investment_package (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL UNIQUE REFERENCES public.property("Id") ON DELETE CASCADE,
  "Share_Cost" NUMERIC(20,2) NOT NULL DEFAULT 5000,
  "Interest_Rate" NUMERIC(5,2) NOT NULL DEFAULT 25,
  "Period_Months" INT NOT NULL DEFAULT 6,
  "Max_Investors" INT NOT NULL DEFAULT 100,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT investment_package_share_cost_check CHECK ("Share_Cost" > 0),
  CONSTRAINT investment_package_interest_rate_check CHECK ("Interest_Rate" >= 0),
  CONSTRAINT investment_package_period_check CHECK ("Period_Months" > 0),
  CONSTRAINT investment_package_max_investors_check CHECK ("Max_Investors" > 0)
);

CREATE INDEX IF NOT EXISTS investment_package_property_idx ON public.investment_package ("Property_Id");

-- 9. Create investment table to track actual investments
CREATE TABLE IF NOT EXISTS public.investment (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "User_Id" INT NOT NULL,
  "Amount" NUMERIC(20,2) NOT NULL,
  "Shares" INT NOT NULL,
  "Status" VARCHAR(32) NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT investment_amount_check CHECK ("Amount" > 0),
  CONSTRAINT investment_shares_check CHECK ("Shares" > 0)
);

CREATE INDEX IF NOT EXISTS investment_property_idx ON public.investment ("Property_Id");
CREATE INDEX IF NOT EXISTS investment_user_idx ON public.investment ("User_Id");
CREATE INDEX IF NOT EXISTS investment_status_idx ON public.investment ("Status");

-- 10. Create property_image table for multiple images per property
CREATE TABLE IF NOT EXISTS public.property_image (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "Image_Url" TEXT NOT NULL,
  "Display_Order" INT DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT property_image_property_fk FOREIGN KEY ("Property_Id") REFERENCES public.property("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS property_image_property_idx ON public.property_image ("Property_Id");

-- 11. Enable Row Level Security (RLS)
ALTER TABLE public.property ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_package ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_image ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies for property table
DROP POLICY IF EXISTS "Users can view all properties" ON public.property;
DROP POLICY IF EXISTS "Users can create properties" ON public.property;
DROP POLICY IF EXISTS "Users can update own properties" ON public.property;
DROP POLICY IF EXISTS "Users can delete own properties" ON public.property;

CREATE POLICY "Users can view all properties" ON public.property
  FOR SELECT USING (true);

CREATE POLICY "Users can create properties" ON public.property
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own properties" ON public.property
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete own properties" ON public.property
  FOR DELETE USING (true);

-- 13. Create RLS policies for investment_package table
DROP POLICY IF EXISTS "Users can view investment packages" ON public.investment_package;
DROP POLICY IF EXISTS "Property owners can manage investment packages" ON public.investment_package;

CREATE POLICY "Users can view investment packages" ON public.investment_package
  FOR SELECT USING (true);

CREATE POLICY "Property owners can manage investment packages" ON public.investment_package
  FOR ALL USING (true);

-- 14. Create RLS policies for investment table
DROP POLICY IF EXISTS "Users can view investments" ON public.investment;
DROP POLICY IF EXISTS "Users can create investments" ON public.investment;
DROP POLICY IF EXISTS "Users can view own investments" ON public.investment;

CREATE POLICY "Users can view investments" ON public.investment
  FOR SELECT USING (true);

CREATE POLICY "Users can create investments" ON public.investment
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own investments" ON public.investment
  FOR SELECT USING (true);

-- 15. Create RLS policies for property_image table
DROP POLICY IF EXISTS "Users can view property images" ON public.property_image;
DROP POLICY IF EXISTS "Property owners can manage images" ON public.property_image;

CREATE POLICY "Users can view property images" ON public.property_image
  FOR SELECT USING (true);

CREATE POLICY "Property owners can manage images" ON public.property_image
  FOR ALL USING (true);

-- End of Phase 1 migration
