-- Migration: Change Video column to TEXT type to support embed codes
-- This allows storing full iframe embed codes instead of just URLs

ALTER TABLE public.property 
ALTER COLUMN "Video" TYPE TEXT;
