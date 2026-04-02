-- Phase 1: Minimal Atomic Ajo Schema (No Foreign Keys)
-- Works with any existing user table structure

-- Drop existing tables safely
DROP TABLE IF EXISTS ajo_member_history CASCADE;
DROP TABLE IF EXISTS ajo_withdrawal_locks CASCADE;
DROP TABLE IF EXISTS ajo_transactions CASCADE;
DROP TABLE IF EXISTS ajo_cycles CASCADE;
DROP TABLE IF EXISTS ajo_group_members CASCADE;
DROP TABLE IF EXISTS ajo_groups CASCADE;
DROP TABLE IF EXISTS ajo_savings CASCADE;

-- Create atomic Ajo Groups
CREATE TABLE ajo_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    max_members INTEGER NOT NULL CHECK (max_members BETWEEN 2 AND 50),
    current_members INTEGER DEFAULT 0 CHECK (current_members <= max_members),
    contribution_amount DECIMAL(15,2) NOT NULL CHECK (contribution_amount > 0),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
    cycle_duration INTEGER NOT NULL CHECK (cycle_duration > 0),
    status VARCHAR(20) DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'completed', 'cancelled')),
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    next_payout_date TIMESTAMP,
    current_cycle INTEGER DEFAULT 0,
    total_cycles INTEGER
);

-- Create group members
CREATE TABLE ajo_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'defaulted', 'completed')),
    payout_order INTEGER,
    last_contribution_date TIMESTAMP,
    total_contributed DECIMAL(15,2) DEFAULT 0,
    payout_received BOOLEAN DEFAULT FALSE,
    reliability_score DECIMAL(3,2) DEFAULT 1.00 CHECK (reliability_score BETWEEN 0 AND 1),
    
    CONSTRAINT uk_group_user UNIQUE (group_id, user_id),
    CONSTRAINT uk_group_position UNIQUE (group_id, position),
    CONSTRAINT uk_group_payout_order UNIQUE (group_id, payout_order)
);

-- Create cycles
CREATE TABLE ajo_cycles (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    cycle_number INTEGER NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    contribution_deadline TIMESTAMP NOT NULL,
    payout_recipient_id INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'collecting', 'locked', 'completed', 'failed', 'cancelled')),
    total_expected DECIMAL(15,2) NOT NULL,
    total_collected DECIMAL(15,2) DEFAULT 0,
    payout_amount DECIMAL(15,2) DEFAULT 0,
    payout_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_group_cycle UNIQUE (group_id, cycle_number),
    CONSTRAINT chk_cycle_dates CHECK (end_date > start_date AND contribution_deadline <= end_date),
    CONSTRAINT chk_amounts CHECK (total_collected <= total_expected)
);

-- Create transactions
CREATE TABLE ajo_transactions (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    cycle_id INTEGER,
    user_id INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('contribution', 'payout', 'refund', 'penalty')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_reference VARCHAR(255),
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    metadata JSONB
);

-- Create withdrawal locks
CREATE TABLE ajo_withdrawal_locks (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    cycle_id INTEGER,
    user_id INTEGER,
    lock_type VARCHAR(20) NOT NULL CHECK (lock_type IN ('cycle_incomplete', 'contribution_pending', 'payout_processing', 'dispute')),
    locked_until TIMESTAMP NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP
);

-- Create member history
CREATE TABLE ajo_member_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    cycle_id INTEGER NOT NULL,
    contribution_due_date TIMESTAMP NOT NULL,
    contribution_date TIMESTAMP,
    amount_due DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    days_late INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late', 'defaulted'))
);

-- Create indexes
CREATE INDEX idx_ajo_groups_status ON ajo_groups(status);
CREATE INDEX idx_ajo_groups_creator ON ajo_groups(created_by);
CREATE INDEX idx_ajo_members_user ON ajo_group_members(user_id);
CREATE INDEX idx_ajo_members_group_status ON ajo_group_members(group_id, status);
CREATE INDEX idx_ajo_cycles_group_status ON ajo_cycles(group_id, status);
CREATE INDEX idx_ajo_transactions_user_type ON ajo_transactions(user_id, transaction_type);
CREATE INDEX idx_ajo_transactions_cycle ON ajo_transactions(cycle_id);
CREATE INDEX idx_ajo_locks_active ON ajo_withdrawal_locks(group_id, user_id) WHERE released_at IS NULL;

-- Create member count trigger
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE ajo_groups 
        SET current_members = current_members + 1 
        WHERE id = NEW.group_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE ajo_groups 
        SET current_members = current_members - 1 
        WHERE id = OLD.group_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_member_count
    AFTER INSERT OR DELETE ON ajo_group_members
    FOR EACH ROW EXECUTE FUNCTION update_group_member_count();