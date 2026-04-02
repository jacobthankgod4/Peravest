-- Migration 008: Create uploads table for tracking file uploads to Supabase Storage
-- Tracks all file uploads with metadata for audit and recovery purposes

CREATE TABLE IF NOT EXISTS public.uploads (
    "id" BIGSERIAL PRIMARY KEY,
    "user_id" BIGINT REFERENCES public.users("Id") ON DELETE SET NULL,
    "object_path" VARCHAR(500) NOT NULL UNIQUE,
    "original_filename" VARCHAR(255) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "mime_type" VARCHAR(100),
    "entity_type" VARCHAR(50) NOT NULL,  -- 'property', 'profile', 'document', etc.
    "entity_id" BIGINT,                  -- Reference to the entity (e.g., property ID)
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- Indexes for faster lookups
CREATE INDEX idx_uploads_user_id ON public.uploads("user_id");
CREATE INDEX idx_uploads_entity_type_id ON public.uploads("entity_type", "entity_id");
CREATE INDEX idx_uploads_created_at ON public.uploads("created_at");
CREATE INDEX idx_uploads_object_path ON public.uploads("object_path");
