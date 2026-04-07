-- Postgres migration: create `users` table (production-grade)
-- DEPRECATED: Use 100_create_user_accounts_table.sql instead
-- This migration is kept for reference only and should not be run

-- The correct table name is 'user_accounts' (not 'users')
-- All services expect 'user_accounts' table
-- See 100_create_user_accounts_table.sql for the definitive schema
