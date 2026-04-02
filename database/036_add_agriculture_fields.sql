-- Migration: Add Agriculture-specific fields
-- Date: 2024
-- Purpose: Support agricultural investment packages
-- Rollback: 036_rollback_agriculture_fields.sql

BEGIN;

-- Add Agriculture-specific fields (all nullable for backward compatibility)
ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS "Farm_Size_Hectares" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "Crop_Type" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "Harvest_Cycle_Months" INTEGER,
ADD COLUMN IF NOT EXISTS "Expected_Yield" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "Farming_Method" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "Soil_Type" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "Water_Source" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "Farm_Equipment" TEXT,
ADD COLUMN IF NOT EXISTS "Insurance_Status" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "Farm_Manager" VARCHAR(200);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_property_crop_type 
ON public.property("Crop_Type");

CREATE INDEX IF NOT EXISTS idx_property_farming_method 
ON public.property("Farming_Method");

COMMIT;

-- Verification query
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'property' 
-- AND column_name LIKE '%Farm%' OR column_name LIKE '%Crop%';
