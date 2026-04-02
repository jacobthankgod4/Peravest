-- Phase 1: Admin Dashboard Database Schema

-- Admin audit logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX idx_admin_audit_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_admin_audit_created ON admin_audit_logs(created_at DESC);

-- Admin notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_notif_admin ON admin_notifications(admin_id);
CREATE INDEX idx_admin_notif_read ON admin_notifications(is_read);
CREATE INDEX idx_admin_notif_created ON admin_notifications(created_at DESC);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'PeraVest', 'string', 'Application name'),
('maintenance_mode', 'false', 'boolean', 'Enable/disable maintenance mode'),
('max_investment_amount', '10000000', 'number', 'Maximum investment amount in Naira'),
('min_investment_amount', '50000', 'number', 'Minimum investment amount in Naira'),
('withdrawal_processing_days', '3', 'number', 'Number of days to process withdrawals'),
('interest_calculation_enabled', 'true', 'boolean', 'Enable automatic interest calculation')
ON CONFLICT (setting_key) DO NOTHING;

-- Admin dashboard cache table (for performance)
CREATE TABLE IF NOT EXISTS admin_dashboard_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(100) UNIQUE NOT NULL,
    cache_value JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_cache_key ON admin_dashboard_cache(cache_key);
CREATE INDEX idx_admin_cache_expires ON admin_dashboard_cache(expires_at);

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id INTEGER,
    p_action VARCHAR(100),
    p_entity_type VARCHAR(50),
    p_entity_id INTEGER,
    p_old_value JSONB DEFAULT NULL,
    p_new_value JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_log_id INTEGER;
BEGIN
    INSERT INTO admin_audit_logs (
        admin_id, action, entity_type, entity_id, 
        old_value, new_value, created_at
    ) VALUES (
        p_admin_id, p_action, p_entity_type, p_entity_id,
        p_old_value, p_new_value, CURRENT_TIMESTAMP
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create admin notification
CREATE OR REPLACE FUNCTION create_admin_notification(
    p_admin_id INTEGER,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_link VARCHAR(255) DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_notif_id INTEGER;
BEGIN
    INSERT INTO admin_notifications (
        admin_id, type, title, message, link, created_at
    ) VALUES (
        p_admin_id, p_type, p_title, p_message, p_link, CURRENT_TIMESTAMP
    ) RETURNING id INTO v_notif_id;
    
    RETURN v_notif_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create cache
CREATE OR REPLACE FUNCTION get_admin_cache(p_cache_key VARCHAR(100))
RETURNS JSONB AS $$
DECLARE
    v_cache_value JSONB;
BEGIN
    SELECT cache_value INTO v_cache_value
    FROM admin_dashboard_cache
    WHERE cache_key = p_cache_key
      AND expires_at > CURRENT_TIMESTAMP;
    
    RETURN v_cache_value;
END;
$$ LANGUAGE plpgsql;

-- Function to set cache
CREATE OR REPLACE FUNCTION set_admin_cache(
    p_cache_key VARCHAR(100),
    p_cache_value JSONB,
    p_ttl_seconds INTEGER DEFAULT 300
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_dashboard_cache (cache_key, cache_value, expires_at)
    VALUES (
        p_cache_key, 
        p_cache_value, 
        CURRENT_TIMESTAMP + (p_ttl_seconds || ' seconds')::INTERVAL
    )
    ON CONFLICT (cache_key) 
    DO UPDATE SET 
        cache_value = p_cache_value,
        expires_at = CURRENT_TIMESTAMP + (p_ttl_seconds || ' seconds')::INTERVAL,
        created_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM admin_dashboard_cache
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;