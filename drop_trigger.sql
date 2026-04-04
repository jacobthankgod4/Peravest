-- Drop the trigger that's causing signup to fail
DROP TRIGGER IF EXISTS trigger_create_user_profile ON auth.users CASCADE;
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
