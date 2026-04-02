import { supabase } from '../lib/supabase';

// Personal Ajo Withdrawal Rules
export const PERSONAL_AJO_RULES = {
  LOCK_IN_PERIOD_DAYS: 30, // Minimum 30 days before first withdrawal
  EARLY_WITHDRAWAL_PENALTY: 0.05, // 5% penalty before maturity
  MINIMUM_BALANCE: 0, // No minimum balance requirement
} as const;

export interface PersonalAjoWithdrawalEligibility {
  can_withdraw: boolean;
  available_balance: number;
  has_penalty: boolean;
  penalty_rate: number;
  reason: string;
  available_from?: string;
}

export interface PersonalAjoWithdrawalResult {
  success: boolean;
  transaction_id?: number;
  amount_withdrawn?: number;
  penalty_amount?: number;
  remaining_balance?: number;
  error?: string;
}

export class PersonalAjoWithdrawalService {
  
  // Check withdrawal eligibility for personal Ajo
  static async checkEligibility(
    userId: number,
    ajoId: number
  ): Promise<PersonalAjoWithdrawalEligibility> {
    
    const { data, error } = await supabase.rpc('check_personal_ajo_withdrawal_eligibility', {
      p_user_id: userId,
      p_ajo_id: ajoId
    });

    if (error) {
      return {
        can_withdraw: false,
        available_balance: 0,
        has_penalty: false,
        penalty_rate: 0,
        reason: error.message
      };
    }

    return data;
  }

  // Process personal Ajo withdrawal
  static async processWithdrawal(
    userId: number,
    ajoId: number,
    amount: number
  ): Promise<PersonalAjoWithdrawalResult> {
    
    // Check eligibility first
    const eligibility = await this.checkEligibility(userId, ajoId);
    
    if (!eligibility.can_withdraw) {
      return {
        success: false,
        error: eligibility.reason
      };
    }

    // Validate amount
    if (amount <= 0) {
      return {
        success: false,
        error: 'Withdrawal amount must be greater than zero'
      };
    }

    if (amount > eligibility.available_balance) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${eligibility.available_balance}`
      };
    }

    try {
      // Process withdrawal atomically
      const { data, error } = await supabase.rpc('process_personal_ajo_withdrawal', {
        p_user_id: userId,
        p_ajo_id: ajoId,
        p_amount: amount
      });

      if (error) throw error;

      return {
        success: true,
        transaction_id: data.transaction_id,
        amount_withdrawn: data.amount_withdrawn,
        penalty_amount: data.penalty_amount,
        remaining_balance: data.remaining_balance
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get withdrawal history for personal Ajo
  static async getWithdrawalHistory(ajoId: number): Promise<{
    withdrawals: Array<{
      id: number;
      amount: number;
      transaction_type: string;
      status: string;
      transaction_date: string;
    }>;
    total_withdrawn: number;
  }> {
    
    const { data: transactions, error } = await supabase
      .from('ajo_transactions')
      .select('id, amount, transaction_type, status, transaction_date')
      .eq('ajo_id', ajoId)
      .in('transaction_type', ['withdrawal', 'penalty'])
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    const withdrawals = transactions || [];
    const totalWithdrawn = withdrawals
      .filter(t => t.transaction_type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      withdrawals,
      total_withdrawn: totalWithdrawn
    };
  }

  // Calculate potential penalty for early withdrawal
  static calculatePenalty(amount: number, endDate: string): {
    has_penalty: boolean;
    penalty_amount: number;
    net_amount: number;
  } {
    const now = new Date();
    const maturityDate = new Date(endDate);
    
    if (now >= maturityDate) {
      return {
        has_penalty: false,
        penalty_amount: 0,
        net_amount: amount
      };
    }

    const penaltyAmount = amount * PERSONAL_AJO_RULES.EARLY_WITHDRAWAL_PENALTY;
    
    return {
      has_penalty: true,
      penalty_amount: penaltyAmount,
      net_amount: amount - penaltyAmount
    };
  }

  // Get personal Ajo summary
  static async getPersonalAjoSummary(userId: number): Promise<{
    total_personal_ajos: number;
    total_balance: number;
    total_withdrawn: number;
    active_ajos: number;
  }> {
    
    // Get all personal Ajos
    const { data: ajos } = await supabase
      .from('ajo_savings')
      .select('id, current_balance, status')
      .eq('user_id', userId)
      .eq('ajo_type', 'personal');

    if (!ajos) {
      return {
        total_personal_ajos: 0,
        total_balance: 0,
        total_withdrawn: 0,
        active_ajos: 0
      };
    }

    const totalBalance = ajos.reduce((sum, ajo) => sum + Number(ajo.current_balance), 0);
    const activeAjos = ajos.filter(ajo => ajo.status === 'active').length;

    // Get total withdrawals
    const ajoIds = ajos.map(ajo => ajo.id);
    const { data: withdrawals } = await supabase
      .from('ajo_transactions')
      .select('amount')
      .in('ajo_id', ajoIds)
      .eq('transaction_type', 'withdrawal')
      .eq('status', 'completed');

    const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;

    return {
      total_personal_ajos: ajos.length,
      total_balance: totalBalance,
      total_withdrawn: totalWithdrawn,
      active_ajos: activeAjos
    };
  }

  // Emergency full withdrawal (with penalty)
  static async emergencyWithdrawal(
    userId: number,
    ajoId: number,
    reason: string
  ): Promise<PersonalAjoWithdrawalResult> {
    
    // Get current balance
    const { data: ajo } = await supabase
      .from('ajo_savings')
      .select('current_balance')
      .eq('id', ajoId)
      .eq('user_id', userId)
      .eq('ajo_type', 'personal')
      .single();

    if (!ajo) {
      return {
        success: false,
        error: 'Personal Ajo not found'
      };
    }

    // Withdraw full balance
    return await this.processWithdrawal(userId, ajoId, Number(ajo.current_balance));
  }
}
