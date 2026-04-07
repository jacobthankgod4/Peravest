-- Add user_id column to user_profiles if it doesn't exist
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE;

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
