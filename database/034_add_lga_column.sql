-- Migration: Add LGA column to property table

ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS "LGA" VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_property_lga ON public.property("LGA");
