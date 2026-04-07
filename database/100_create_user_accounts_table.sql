-- Create user_accounts table (the actual table used by all services)
-- Drop old users table if it exists and is empty
DROP TABLE IF EXISTS users CASCADE;

-- Create user_accounts table with all required columns
CREATE TABLE IF NOT EXISTS user_accounts (
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
  CONSTRAINT user_accounts_email_unique UNIQUE ("Email")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_accounts_email_idx ON user_accounts ("Email");
CREATE INDEX IF NOT EXISTS user_accounts_status_idx ON user_accounts ("status");

-- Enable RLS
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "allow_insert" ON user_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select" ON user_accounts FOR SELECT USING (true);
CREATE POLICY "allow_update" ON user_accounts FOR UPDATE USING (true);
CREATE POLICY "allow_delete" ON user_accounts FOR DELETE USING (true);
