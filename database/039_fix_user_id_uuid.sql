-- Safely convert user_id from INTEGER to UUID
-- Step 1: Create new UUID column
ALTER TABLE user_profiles ADD COLUMN user_id_uuid UUID;

-- Step 2: Copy data (convert integers to UUID namespace or set to NULL if conversion not needed)
UPDATE user_profiles SET user_id_uuid = NULL;

-- Step 3: Drop old constraints and column
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS fk_user_profiles_user;
DROP INDEX IF EXISTS idx_user_profiles_user_id;
ALTER TABLE user_profiles DROP COLUMN user_id;

-- Step 4: Rename new column to user_id
ALTER TABLE user_profiles RENAME COLUMN user_id_uuid TO user_id;

-- Step 5: Add unique constraint and index
ALTER TABLE user_profiles ADD CONSTRAINT user_id_unique UNIQUE (user_id);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
