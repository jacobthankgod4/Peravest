-- Peravest Database Schema Fixes - Minimal Working Version

-- 1. Fix typo: Ammenities → Amenities
ALTER TABLE public.property RENAME COLUMN "Ammenities" TO "Amenities";

-- 2. Add new columns to property table
ALTER TABLE public.property ADD COLUMN "User_Id" INT;
ALTER TABLE public.property ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.property ADD COLUMN "deleted_at" TIMESTAMP;
ALTER TABLE public.property ADD COLUMN "is_deleted" BOOLEAN DEFAULT FALSE;

-- 3. Fix Area data type
ALTER TABLE public.property ALTER COLUMN "Area" TYPE NUMERIC(10,2) USING CAST(COALESCE(NULLIF(regexp_replace("Area", '[^0-9.]', '', 'g'), ''), '0') AS NUMERIC);

-- 4. Add constraints to property table
ALTER TABLE public.property ADD CONSTRAINT property_price_check CHECK ("Price" >= 0);
ALTER TABLE public.property ADD CONSTRAINT property_bedroom_check CHECK ("Bedroom" >= 0);
ALTER TABLE public.property ADD CONSTRAINT property_bathroom_check CHECK ("Bathroom" >= 0);
ALTER TABLE public.property ADD CONSTRAINT property_year_check CHECK ("Built_Year" >= 1800 AND "Built_Year" <= EXTRACT(YEAR FROM CURRENT_DATE) + 10);

-- 5. Add indexes to property table
CREATE INDEX IF NOT EXISTS property_user_idx ON public.property ("User_Id");
CREATE INDEX IF NOT EXISTS property_deleted_idx ON public.property ("is_deleted");
CREATE INDEX IF NOT EXISTS property_type_idx ON public.property ("Type");
CREATE INDEX IF NOT EXISTS property_city_idx ON public.property ("City");
CREATE INDEX IF NOT EXISTS property_state_idx ON public.property ("State");
CREATE INDEX IF NOT EXISTS property_status_idx ON public.property ("Status");
CREATE INDEX IF NOT EXISTS property_created_idx ON public.property ("created_at");

-- 6. Create investment_package table
CREATE TABLE IF NOT EXISTS public.investment_package (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL UNIQUE REFERENCES public.property("Id") ON DELETE CASCADE,
  "Share_Cost" NUMERIC(20,2) NOT NULL DEFAULT 5000,
  "Interest_Rate" NUMERIC(5,2) NOT NULL DEFAULT 25,
  "Period_Months" INT NOT NULL DEFAULT 6,
  "Max_Investors" INT NOT NULL DEFAULT 100,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS investment_package_property_idx ON public.investment_package ("Property_Id");

-- 7. Create investment table
CREATE TABLE IF NOT EXISTS public.investment (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "User_Id" INT NOT NULL,
  "Amount" NUMERIC(20,2) NOT NULL,
  "Shares" INT NOT NULL,
  "Status" VARCHAR(32) NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS investment_property_idx ON public.investment ("Property_Id");
CREATE INDEX IF NOT EXISTS investment_user_idx ON public.investment ("User_Id");
CREATE INDEX IF NOT EXISTS investment_status_idx ON public.investment ("Status");

-- 8. Create property_image table
CREATE TABLE IF NOT EXISTS public.property_image (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "Image_Url" TEXT NOT NULL,
  "Display_Order" INT DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS property_image_property_idx ON public.property_image ("Property_Id");

-- 9. Enable RLS
ALTER TABLE public.property ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_package ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_image ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
DROP POLICY IF EXISTS "Users can view all properties" ON public.property;
DROP POLICY IF EXISTS "Users can create properties" ON public.property;
DROP POLICY IF EXISTS "Users can update own properties" ON public.property;
DROP POLICY IF EXISTS "Users can delete own properties" ON public.property;

CREATE POLICY "Users can view all properties" ON public.property FOR SELECT USING (true);
CREATE POLICY "Users can create properties" ON public.property FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own properties" ON public.property FOR UPDATE USING (true);
CREATE POLICY "Users can delete own properties" ON public.property FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can view investment packages" ON public.investment_package;
DROP POLICY IF EXISTS "Property owners can manage investment packages" ON public.investment_package;

CREATE POLICY "Users can view investment packages" ON public.investment_package FOR SELECT USING (true);
CREATE POLICY "Property owners can manage investment packages" ON public.investment_package FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view investments" ON public.investment;
DROP POLICY IF EXISTS "Users can create investments" ON public.investment;
DROP POLICY IF EXISTS "Users can view own investments" ON public.investment;

CREATE POLICY "Users can view investments" ON public.investment FOR SELECT USING (true);
CREATE POLICY "Users can create investments" ON public.investment FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own investments" ON public.investment FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view property images" ON public.property_image;
DROP POLICY IF EXISTS "Property owners can manage images" ON public.property_image;

CREATE POLICY "Users can view property images" ON public.property_image FOR SELECT USING (true);
CREATE POLICY "Property owners can manage images" ON public.property_image FOR ALL USING (true);
