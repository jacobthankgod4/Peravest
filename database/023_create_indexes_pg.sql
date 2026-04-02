-- Migration: Create performance indexes (PostgreSQL)

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users("Email");
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Investment table indexes
CREATE INDEX IF NOT EXISTS idx_investment_property_id ON investment("property_id");
CREATE INDEX IF NOT EXISTS idx_investment_created_at ON investment("created_at");

-- Property table indexes
CREATE INDEX IF NOT EXISTS idx_property_status ON property("Status");
CREATE INDEX IF NOT EXISTS idx_property_created_at ON property("created_at");

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);