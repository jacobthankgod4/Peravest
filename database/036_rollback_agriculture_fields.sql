-- Rollback: Remove Agriculture-specific fields
-- Reverts: 036_add_agriculture_fields.sql

BEGIN;

-- Drop indexes
DROP INDEX IF EXISTS idx_property_crop_type;
DROP INDEX IF EXISTS idx_property_farming_method;

-- Drop agriculture columns
ALTER TABLE public.property 
DROP COLUMN IF EXISTS "Farm_Size_Hectares",
DROP COLUMN IF EXISTS "Crop_Type",
DROP COLUMN IF EXISTS "Harvest_Cycle_Months",
DROP COLUMN IF EXISTS "Expected_Yield",
DROP COLUMN IF EXISTS "Farming_Method",
DROP COLUMN IF EXISTS "Soil_Type",
DROP COLUMN IF EXISTS "Water_Source",
DROP COLUMN IF EXISTS "Farm_Equipment",
DROP COLUMN IF EXISTS "Insurance_Status",
DROP COLUMN IF EXISTS "Farm_Manager";

COMMIT;

-- Verification query
-- \d property
