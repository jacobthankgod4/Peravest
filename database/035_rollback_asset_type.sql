-- Rollback: Remove Asset Type support
-- Reverts: 035_add_asset_type.sql

BEGIN;

-- Drop index
DROP INDEX IF EXISTS idx_property_asset_type;

-- Drop column
ALTER TABLE public.property 
DROP COLUMN IF EXISTS "Asset_Type";

COMMIT;

-- Verification query
-- \d property
