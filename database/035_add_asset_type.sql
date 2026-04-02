-- Migration: Add Asset Type support
-- Date: 2024
-- Purpose: Enable multi-asset investment platform (Real Estate + Agriculture)
-- Rollback: 035_rollback_asset_type.sql

BEGIN;

-- Add Asset_Type column with default value
ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS "Asset_Type" VARCHAR(50) DEFAULT 'Real Estate';

-- Update all existing records to Real Estate
UPDATE public.property 
SET "Asset_Type" = 'Real Estate' 
WHERE "Asset_Type" IS NULL;

-- Add NOT NULL constraint after data migration
ALTER TABLE public.property 
ALTER COLUMN "Asset_Type" SET NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_property_asset_type 
ON public.property("Asset_Type");

COMMIT;

-- Verification query
-- SELECT "Asset_Type", COUNT(*) FROM property GROUP BY "Asset_Type";
