-- Flutterwave Payment Transactions Table
-- Stores all payment transactions from Flutterwave

CREATE TABLE IF NOT EXISTS public.flutterwave_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id BIGINT NOT NULL UNIQUE,
  flw_ref VARCHAR(255) UNIQUE,
  tx_ref VARCHAR(255) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_type VARCHAR(50),
  payment_method VARCHAR(100),
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  processor_response TEXT,
  auth_model VARCHAR(50),
  ip_address INET,
  device_fingerprint VARCHAR(255),
  narration TEXT,
  metadata JSONB,
  investment_type VARCHAR(50),
  investment_id BIGINT,
  property_id BIGINT,
  package_id BIGINT,
  charged_amount DECIMAL(15,2),
  app_fee DECIMAL(15,2),
  merchant_fee DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_flutterwave_transactions_user_id ON public.flutterwave_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_flutterwave_transactions_status ON public.flutterwave_transactions(status);
CREATE INDEX IF NOT EXISTS idx_flutterwave_transactions_tx_ref ON public.flutterwave_transactions(tx_ref);
CREATE INDEX IF NOT EXISTS idx_flutterwave_transactions_created_at ON public.flutterwave_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_flutterwave_transactions_investment_type ON public.flutterwave_transactions(investment_type);

-- Enable Row Level Security
ALTER TABLE public.flutterwave_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.flutterwave_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.flutterwave_transactions;

CREATE POLICY "Users can view own transactions" ON public.flutterwave_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.flutterwave_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment Status Tracking Table
CREATE TABLE IF NOT EXISTS public.payment_status_log (
  id BIGSERIAL PRIMARY KEY,
  transaction_id BIGINT NOT NULL REFERENCES public.flutterwave_transactions(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_status_log_transaction_id ON public.payment_status_log(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_status_log_created_at ON public.payment_status_log(created_at);

-- Email Notification Log Table
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id BIGINT REFERENCES public.flutterwave_transactions(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON public.email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created_at ON public.email_notifications(created_at);

-- Function to update payment status and log changes
CREATE OR REPLACE FUNCTION update_payment_status(
  p_transaction_id BIGINT,
  p_new_status VARCHAR(50),
  p_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_old_status VARCHAR(50);
BEGIN
  -- Get current status
  SELECT status INTO v_old_status FROM public.flutterwave_transactions WHERE id = p_transaction_id;
  
  -- Update transaction status
  UPDATE public.flutterwave_transactions
  SET status = p_new_status, updated_at = NOW()
  WHERE id = p_transaction_id;
  
  -- Log status change
  INSERT INTO public.payment_status_log (transaction_id, old_status, new_status, reason)
  VALUES (p_transaction_id, v_old_status, p_new_status, p_reason);
END;
$$ LANGUAGE plpgsql;

-- Function to log email notifications
CREATE OR REPLACE FUNCTION log_email_notification(
  p_user_id UUID,
  p_transaction_id BIGINT,
  p_email_type VARCHAR(50),
  p_recipient_email VARCHAR(255),
  p_subject VARCHAR(255)
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.email_notifications (user_id, transaction_id, email_type, recipient_email, subject)
  VALUES (p_user_id, p_transaction_id, p_email_type, p_recipient_email, p_subject);
END;
$$ LANGUAGE plpgsql;
