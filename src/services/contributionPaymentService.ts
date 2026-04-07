import { supabase } from '../lib/supabase';
import { ajoPaymentService } from './ajoPaymentService';

export interface ContributionPaymentRequest {
  userId: number;
  groupId: number;
  cycleId: number;
  amount: number;
  email: string;
  fullName: string;
  phoneNumber: string;
}

export interface ContributionPaymentResponse {
  transactionId: string;
  reference: string;
  link: string;
}

export interface ContributionStatus {
  cycleId: number;
  userId: number;
  status: 'pending' | 'paid' | 'late' | 'defaulted';
  amountDue: number;
  amountPaid: number;
  daysLate: number;
  dueDate: string;
  paidDate?: string;
}

class ContributionPaymentService {
  /**
   * Get pending contributions for a user
   */
  async getPendingContributions(userId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_member_history')
        .select(`
          *,
          ajo_cycles(id, cycle_number, contribution_deadline, status),
          ajo_groups(id, name, contribution_amount)
        `)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('ajo_cycles(contribution_deadline)', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending contributions:', error);
      throw error;
    }
  }

  /**
   * Get contribution status for a specific cycle
   */
  async getContributionStatus(userId: number, cycleId: number): Promise<ContributionStatus | null> {
    try {
      const { data, error } = await supabase
        .from('ajo_member_history')
        .select('*')
        .eq('user_id', userId)
        .eq('cycle_id', cycleId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;

      return {
        cycleId: data.cycle_id,
        userId: data.user_id,
        status: data.status,
        amountDue: data.amount_due,
        amountPaid: data.amount_paid,
        daysLate: data.days_late,
        dueDate: data.contribution_due_date,
        paidDate: data.contribution_date,
      };
    } catch (error) {
      console.error('Error fetching contribution status:', error);
      throw error;
    }
  }

  /**
   * Initialize contribution payment
   */
  async initializeContributionPayment(
    request: ContributionPaymentRequest
  ): Promise<ContributionPaymentResponse> {
    try {
      // Get cycle details
      const { data: cycleData, error: cycleError } = await supabase
        .from('ajo_cycles')
        .select('*, ajo_groups(name, contribution_amount)')
        .eq('id', request.cycleId)
        .single();

      if (cycleError) throw cycleError;

      // Get group details
      const { data: groupData, error: groupError } = await supabase
        .from('ajo_groups')
        .select('name')
        .eq('id', request.groupId)
        .single();

      if (groupError) throw groupError;

      // Initialize payment with Flutterwave
      const paymentInit = await ajoPaymentService.initializePayment({
        email: request.email,
        amount: request.amount,
        ajoType: 'group',
        ajoData: {
          type: 'group',
          contributionAmount: request.amount,
          frequency: 'monthly',
          duration: 1,
          startDate: new Date().toISOString().split('T')[0],
          groupName: groupData.name,
        },
        userId: request.userId,
        fullName: request.fullName,
        phoneNumber: request.phoneNumber,
      });

      if (paymentInit.status !== 'success') {
        throw new Error('Failed to initialize payment');
      }

      // Store pending transaction
      const { error: txError } = await supabase
        .from('ajo_transactions')
        .insert({
          group_id: request.groupId,
          cycle_id: request.cycleId,
          user_id: request.userId,
          amount: request.amount,
          transaction_type: 'contribution',
          status: 'processing',
          payment_reference: paymentInit.data.reference,
          payment_method: 'flutterwave',
          created_at: new Date().toISOString(),
        });

      if (txError) throw txError;

      return {
        transactionId: paymentInit.data.reference,
        reference: paymentInit.data.reference,
        link: paymentInit.data.link,
      };
    } catch (error) {
      console.error('Error initializing contribution payment:', error);
      throw error;
    }
  }

  /**
   * Verify and complete contribution payment
   */
  async verifyContributionPayment(
    userId: number,
    cycleId: number,
    transactionReference: string
  ) {
    try {
      // Verify payment with Flutterwave
      const verification = await ajoPaymentService.verifyPayment(transactionReference);

      if (verification.data.status !== 'successful') {
        throw new Error('Payment verification failed');
      }

      // Get transaction details
      const { data: txData, error: txError } = await supabase
        .from('ajo_transactions')
        .select('*')
        .eq('payment_reference', transactionReference)
        .single();

      if (txError) throw txError;

      // Update transaction status
      const { error: updateTxError } = await supabase
        .from('ajo_transactions')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', txData.id);

      if (updateTxError) throw updateTxError;

      // Update member history
      const { error: updateHistoryError } = await supabase
        .from('ajo_member_history')
        .update({
          status: 'paid',
          contribution_date: new Date().toISOString(),
          amount_paid: txData.amount,
        })
        .eq('user_id', userId)
        .eq('cycle_id', cycleId);

      if (updateHistoryError) throw updateHistoryError;

      // Update cycle total collected
      const { error: updateCycleError } = await supabase.rpc(
        'update_cycle_collected',
        {
          p_cycle_id: cycleId,
          p_amount: txData.amount,
        }
      );

      if (updateCycleError) throw updateCycleError;

      return {
        success: true,
        transactionId: txData.id,
        amount: txData.amount,
        paidAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error verifying contribution payment:', error);
      throw error;
    }
  }

  /**
   * Get contribution history for a user in a group
   */
  async getContributionHistory(userId: number, groupId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_member_history')
        .select(`
          *,
          ajo_cycles(cycle_number, start_date, end_date, status)
        `)
        .eq('user_id', userId)
        .eq('group_id', groupId)
        .order('ajo_cycles(cycle_number)', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching contribution history:', error);
      throw error;
    }
  }

  /**
   * Check if user has overdue contributions
   */
  async hasOverdueContributions(userId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ajo_member_history')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'late')
        .limit(1);

      if (error) throw error;
      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error checking overdue contributions:', error);
      throw error;
    }
  }

  /**
   * Get contribution statistics for a user
   */
  async getContributionStats(userId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_member_history')
        .select('status, amount_paid');

      if (error) throw error;

      const stats = {
        totalContributions: data?.length || 0,
        paidContributions: data?.filter(d => d.status === 'paid').length || 0,
        lateContributions: data?.filter(d => d.status === 'late').length || 0,
        defaultedContributions: data?.filter(d => d.status === 'defaulted').length || 0,
        totalAmountPaid: data?.reduce((sum, d) => sum + (d.amount_paid || 0), 0) || 0,
        onTimePercentage: data && data.length > 0 
          ? Math.round((data.filter(d => d.status === 'paid').length / data.length) * 100)
          : 0,
      };

      return stats;
    } catch (error) {
      console.error('Error fetching contribution stats:', error);
      throw error;
    }
  }
}

export const contributionPaymentService = new ContributionPaymentService();
