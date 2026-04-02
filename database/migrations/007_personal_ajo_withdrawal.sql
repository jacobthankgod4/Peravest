-- Phase 1: Personal Ajo Withdrawal Function
-- Separate withdrawal logic for personal Ajo savings

-- Step 1: Ensure ajo_savings table exists (if not already created)
CREATE TABLE IF NOT EXISTS ajo_savings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  ajo_type VARCHAR(20) NOT NULL CHECK (ajo_type IN ('group', 'personal')),
  contribution_amount DECIMAL(15, 2) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  duration INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_commitment DECIMAL(15, 2) NOT NULL,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  payment_reference VARCHAR(100) UNIQUE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Ensure ajo_transactions supports personal Ajo (modify if needed)
DO $$ 
BEGIN
  -- Add ajo_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ajo_transactions' AND column_name='ajo_id') THEN
    ALTER TABLE ajo_transactions ADD COLUMN ajo_id INTEGER;
  END IF;
  
  -- Add transaction_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ajo_transactions' AND column_name='transaction_date') THEN
    ALTER TABLE ajo_transactions ADD COLUMN transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Step 3: Function to process personal Ajo withdrawal
CREATE OR REPLACE FUNCTION process_personal_ajo_withdrawal(
  p_user_id INTEGER,
  p_ajo_id INTEGER,
  p_amount DECIMAL(15,2)
)
RETURNS JSON AS $$
DECLARE
  v_ajo ajo_savings%ROWTYPE;
  v_transaction_id INTEGER;
  v_lock_period_days INTEGER := 30; -- Minimum 30 days lock-in period
  v_penalty_rate DECIMAL(5,2) := 0.05; -- 5% early withdrawal penalty
  v_final_amount DECIMAL(15,2);
  v_penalty_amount DECIMAL(15,2) := 0;
BEGIN
  SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
  
  -- Get and lock Ajo record
  SELECT * INTO v_ajo
  FROM ajo_savings
  WHERE id = p_ajo_id AND user_id = p_user_id AND ajo_type = 'personal'
  FOR UPDATE;
  
  IF v_ajo.id IS NULL THEN
    RAISE EXCEPTION 'Personal Ajo not found or unauthorized';
  END IF;
  
  IF v_ajo.status != 'active' THEN
    RAISE EXCEPTION 'Ajo is not active. Status: %', v_ajo.status;
  END IF;
  
  -- Check available balance
  IF v_ajo.current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Requested: %', 
      v_ajo.current_balance, p_amount;
  END IF;
  
  -- Check minimum lock-in period (30 days from start)
  IF CURRENT_DATE < (v_ajo.start_date + v_lock_period_days) THEN
    RAISE EXCEPTION 'Minimum lock-in period not met. Can withdraw after %', 
      (v_ajo.start_date + v_lock_period_days);
  END IF;
  
  -- Calculate penalty for early withdrawal (before end_date)
  IF CURRENT_DATE < v_ajo.end_date THEN
    v_penalty_amount := p_amount * v_penalty_rate;
    v_final_amount := p_amount - v_penalty_amount;
    
    -- Record penalty transaction
    INSERT INTO ajo_transactions (
      ajo_id, user_id, amount, transaction_type, status, created_at
    ) VALUES (
      p_ajo_id, p_user_id, v_penalty_amount, 'penalty', 'completed', CURRENT_TIMESTAMP
    );
  ELSE
    v_final_amount := p_amount;
  END IF;
  
  -- Create withdrawal transaction
  INSERT INTO ajo_transactions (
    ajo_id, user_id, amount, transaction_type, status, 
    created_at, transaction_date
  ) VALUES (
    p_ajo_id, p_user_id, v_final_amount, 'withdrawal', 'completed',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  ) RETURNING id INTO v_transaction_id;
  
  -- Update Ajo balance
  UPDATE ajo_savings
  SET current_balance = current_balance - p_amount,
      status = CASE 
        WHEN (current_balance - p_amount) <= 0 THEN 'completed'
        ELSE status
      END
  WHERE id = p_ajo_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'amount_withdrawn', v_final_amount,
    'penalty_amount', v_penalty_amount,
    'remaining_balance', v_ajo.current_balance - p_amount
  );
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Personal Ajo withdrawal failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Function to check personal Ajo withdrawal eligibility
CREATE OR REPLACE FUNCTION check_personal_ajo_withdrawal_eligibility(
  p_user_id INTEGER,
  p_ajo_id INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_ajo ajo_savings%ROWTYPE;
  v_lock_period_days INTEGER := 30;
  v_can_withdraw BOOLEAN;
  v_reason TEXT;
  v_penalty_rate DECIMAL(5,2) := 0.05;
BEGIN
  SELECT * INTO v_ajo
  FROM ajo_savings
  WHERE id = p_ajo_id AND user_id = p_user_id AND ajo_type = 'personal';
  
  IF v_ajo.id IS NULL THEN
    RETURN json_build_object(
      'can_withdraw', false,
      'reason', 'Personal Ajo not found'
    );
  END IF;
  
  IF v_ajo.status != 'active' THEN
    RETURN json_build_object(
      'can_withdraw', false,
      'reason', 'Ajo is not active'
    );
  END IF;
  
  IF v_ajo.current_balance <= 0 THEN
    RETURN json_build_object(
      'can_withdraw', false,
      'reason', 'No balance available'
    );
  END IF;
  
  -- Check lock-in period
  IF CURRENT_DATE < (v_ajo.start_date + v_lock_period_days) THEN
    RETURN json_build_object(
      'can_withdraw', false,
      'reason', 'Minimum lock-in period not met',
      'available_from', (v_ajo.start_date + v_lock_period_days)
    );
  END IF;
  
  -- Calculate penalty if withdrawing early
  IF CURRENT_DATE < v_ajo.end_date THEN
    RETURN json_build_object(
      'can_withdraw', true,
      'available_balance', v_ajo.current_balance,
      'has_penalty', true,
      'penalty_rate', v_penalty_rate,
      'reason', 'Early withdrawal will incur 5% penalty'
    );
  END IF;
  
  -- No penalty after maturity
  RETURN json_build_object(
    'can_withdraw', true,
    'available_balance', v_ajo.current_balance,
    'has_penalty', false,
    'penalty_rate', 0,
    'reason', 'Withdrawal available without penalty'
  );
END;
$$ LANGUAGE plpgsql;

-- Create index for personal Ajo queries
CREATE INDEX IF NOT EXISTS idx_ajo_savings_type_user ON ajo_savings(ajo_type, user_id, status);
