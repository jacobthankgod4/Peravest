-- Postgres migration: create `users_profile` table for Supabase Auth integration
-- This table stores profile data linked to auth.users (managed by Supabase Auth)
-- auth_id is a UUID reference to auth.users(id)

CREATE TABLE IF NOT EXISTS public.users_profile (
  "auth_id" UUID PRIMARY KEY NOT NULL,
  "User_Type" VARCHAR(50) NOT NULL DEFAULT 'user',
  "Name" VARCHAR(255),
  "age" INT,
  "gender" VARCHAR(16),
  "bank" VARCHAR(128),
  "Account" VARCHAR(128),
  "status" VARCHAR(32) NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS users_profile_status_idx ON public.users_profile ("status");
CREATE INDEX IF NOT EXISTS users_profile_user_type_idx ON public.users_profile ("User_Type");

-- Note: Foreign key to auth.users will be added in a later migration when Supabase is configured
-- For now, we keep this table decoupled to allow testing without live Supabase Auth instance
