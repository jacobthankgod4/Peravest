import { supabase } from '../lib/supabase';

interface ReferralData {
  id: number;
  referrer_id: number;
  referred_user_id: number;
  referral_code: string;
  status: 'pending' | 'completed' | 'paid';
  bonus_amount: number;
  created_at: string;
  referred_user?: {
    name: string;
    email: string;
    joined_at: string;
  };
}

interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_earnings: number;
  available_bonus: number;
}

class ReferralService {
  async getUserReferralCode(): Promise<{ data: { referral_code: string } }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let { data, error } = await supabase
      .from('users_profile')
      .select('referral_code')
      .eq('auth_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const newCode = this.generateCode();
      const { data: newProfile, error: insertError } = await supabase
        .from('users_profile')
        .insert({ auth_id: user.id, referral_code: newCode })
        .select('referral_code')
        .single();
      
      if (insertError) throw insertError;
      data = newProfile;
    } else if (error) {
      throw error;
    }
    
    return { data: { referral_code: data.referral_code } };
  }

  async updateReferralCode(newCode: string): Promise<{ data: { referral_code: string } }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate code format
    if (!/^[A-Za-z0-9]{3,20}$/.test(newCode)) {
      throw new Error('Referral code must be 3-20 alphanumeric characters');
    }

    const { data, error } = await supabase
      .from('users_profile')
      .update({ referral_code: newCode })
      .eq('auth_id', user.id)
      .select('referral_code')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('This referral code is already taken');
      }
      throw error;
    }
    
    return { data: { referral_code: data.referral_code } };
  }

  async getReferralStats(): Promise<{ data: ReferralStats }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id);

    if (error) throw error;

    const stats = {
      total_referrals: data?.length || 0,
      successful_referrals: data?.filter(r => r.status === 'completed').length || 0,
      pending_referrals: data?.filter(r => r.status === 'pending').length || 0,
      total_earnings: data?.reduce((sum, r) => sum + (r.bonus_amount || 0), 0) || 0,
      available_bonus: data?.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.bonus_amount || 0), 0) || 0
    };

    return { data: stats };
  }

  async getUserReferrals(): Promise<{ data: ReferralData[] }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred_user:users_profile!referred_user_id(
          referral_code
        )
      `)
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { data: data || [] };
  }

  async withdrawReferralBonus(amount: number): Promise<{ success: boolean; message: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Insert withdrawal request
    const { error } = await supabase
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount,
        type: 'referral_bonus',
        status: 'pending'
      });

    if (error) throw error;
    
    return { success: true, message: 'Withdrawal request submitted' };
  }

  generateReferralLink(referralCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  private generateCode(): string {
    return 'PV' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
}

export const referralService = new ReferralService();
export type { ReferralData, ReferralStats };