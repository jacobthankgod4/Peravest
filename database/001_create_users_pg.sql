-- Postgres migration: create `users` table (production-grade)
CREATE TABLE IF NOT EXISTS public.users (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "User_Type" VARCHAR(50) NOT NULL DEFAULT 'user',
  "Email" VARCHAR(255) NOT NULL,
  "Name" VARCHAR(255),
  "age" INT,
  "gender" VARCHAR(16),
  "bank" VARCHAR(128),
  "Account" VARCHAR(128),
  "Password" VARCHAR(255) NOT NULL,
  "account_activation_hash" VARCHAR(255),
  "reset_token_hash" VARCHAR(255),
  "reset_token_expires_at" TIMESTAMP,
  "status" VARCHAR(32) NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_email_unique UNIQUE ("Email")
);

CREATE INDEX IF NOT EXISTS users_email_idx ON public.users ("Email");
