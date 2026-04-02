-- Add referral_code column to existing users_profile table
ALTER TABLE public.users_profile ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
    id BIGSERIAL PRIMARY KEY,
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'paid')),
    bonus_amount NUMERIC DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL DEFAULT 'referral_bonus',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_profile_referral_code ON public.users_profile(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON public.referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for referrals table
CREATE POLICY "Users can view their own referrals as referrer" ON public.referrals
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals where they are referred" ON public.referrals
    FOR SELECT USING (auth.uid() = referred_user_id);

CREATE POLICY "Users can insert referrals" ON public.referrals
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for withdrawal_requests table
CREATE POLICY "Users can view their own withdrawal requests" ON public.withdrawal_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawal requests" ON public.withdrawal_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        code := 'PV' || upper(substring(md5(random()::text) from 1 for 6));
        SELECT EXISTS(SELECT 1 FROM public.users_profile WHERE referral_code = code) INTO exists;
        IF NOT exists THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile with referral code
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users_profile (auth_id, referral_code)
    VALUES (NEW.id, generate_referral_code())
    ON CONFLICT (auth_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create profile for new users
CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();