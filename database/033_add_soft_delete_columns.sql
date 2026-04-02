-- Migration: Add soft delete columns to property table

ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT FALSE;

ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_property_is_deleted ON public.property("is_deleted");
