import { supabase } from '../lib/supabase';

// Transaction States for atomic operations
export enum TransactionState {
  PENDING = 'pending',
  LOCKED = 'locked',
  CONFIRMED = 'confirmed',
  DISTRIBUTED = 'distributed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

// Atomic Transaction Manager
export class AjoAtomicTransactionManager {
  
  // Process atomic contribution cycle
  static async processAtomicCycle(cycleId: number): Promise<{
    success: boolean;
    state: TransactionState;
    transaction_id?: number;
    error?: string;
  }> {
    const client = supabase;
    
    try {
      // Start atomic transaction
      const { data, error } = await client.rpc('process_atomic_ajo_cycle', {
        p_cycle_id: cycleId
      });

      if (error) throw error;
      
      return {
        success: true,
        state: TransactionState.DISTRIBUTED,
        transaction_id: data.transaction_id
      };
      
    } catch (error: any) {
      // Auto-rollback on failure
      await this.rollbackCycle(cycleId);
      
      return {
        success: false,
        state: TransactionState.FAILED,
        error: error.message
      };
    }
  }

  // Validate all contributions before processing
  static async validateAllContributions(cycleId: number): Promise<{
    valid: boolean;
    missing_contributions: number[];
    total_expected: number;
    total_received: number;
  }> {
    // Get cycle info
    const { data: cycle } = await supabase
      .from('ajo_cycles')
      .select(`
        total_expected,
        group_id,
        ajo_groups!inner(max_members, contribution_amount)
      `)
      .eq('id', cycleId)
      .single();

    if (!cycle) throw new Error('Cycle not found');

    const ajoGroup = Array.isArray(cycle.ajo_groups) ? cycle.ajo_groups[0] : cycle.ajo_groups;

    // Get all group members
    const { data: members } = await supabase
      .from('ajo_group_members')
      .select('user_id')
      .eq('group_id', cycle.group_id)
      .eq('status', 'active');

    // Get completed contributions
    const { data: contributions } = await supabase
      .from('ajo_transactions')
      .select('user_id, amount')
      .eq('cycle_id', cycleId)
      .eq('transaction_type', 'contribution')
      .eq('status', 'completed');

    const contributedUserIds = new Set(contributions?.map(c => c.user_id) || []);
    const missingContributions = members?.filter(m => !contributedUserIds.has(m.user_id)).map(m => m.user_id) || [];
    
    const totalReceived = contributions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    const expectedAmount = ajoGroup.max_members * ajoGroup.contribution_amount;

    return {
      valid: missingContributions.length === 0 && totalReceived >= expectedAmount,
      missing_contributions: missingContributions,
      total_expected: expectedAmount,
      total_received: totalReceived
    };
  }

  // Lock all funds atomically
  static async lockAllFunds(cycleId: number): Promise<{ success: boolean }> {
    const { error } = await supabase
      .from('ajo_cycles')
      .update({ status: 'locked' })
      .eq('id', cycleId)
      .eq('status', 'collecting'); // Only lock if currently collecting

    if (error) throw error;

    // Create withdrawal locks for all members
    const { data: cycle } = await supabase
      .from('ajo_cycles')
      .select('group_id')
      .eq('id', cycleId)
      .single();

    if (cycle) {
      const lockUntil = new Date();
      lockUntil.setHours(lockUntil.getHours() + 1); // 1 hour lock during processing

      await supabase
        .from('ajo_withdrawal_locks')
        .insert([{
          group_id: cycle.group_id,
          cycle_id: cycleId,
          lock_type: 'payout_processing',
          locked_until: lockUntil.toISOString(),
          reason: 'Processing cycle payout - funds temporarily locked'
        }]);
    }

    return { success: true };
  }

  // Distribute payout atomically
  static async distributePayout(cycleId: number): Promise<{ 
    success: boolean; 
    payout_amount: number;
    recipient_id: number;
  }> {
    const { data, error } = await supabase.rpc('process_ajo_payout', {
      p_cycle_id: cycleId
    });

    if (error) throw error;
    return data;
  }

  // Rotate member positions for next cycle
  static async rotateMemberPositions(groupId: number): Promise<{ success: boolean }> {
    // Get current cycle number
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('current_cycle, max_members')
      .eq('id', groupId)
      .single();

    if (!group) throw new Error('Group not found');

    const nextCycle = group.current_cycle + 1;
    
    // Check if all cycles completed
    if (nextCycle > group.max_members) {
      await supabase
        .from('ajo_groups')
        .update({ status: 'completed' })
        .eq('id', groupId);
      
      return { success: true };
    }

    // Update group to next cycle
    await supabase
      .from('ajo_groups')
      .update({ current_cycle: nextCycle })
      .eq('id', groupId);

    return { success: true };
  }

  // Rollback failed cycle
  static async rollbackCycle(cycleId: number): Promise<{ success: boolean }> {
    try {
      // Mark cycle as failed
      await supabase
        .from('ajo_cycles')
        .update({ status: 'failed' })
        .eq('id', cycleId);

      // Mark all pending transactions as cancelled
      await supabase
        .from('ajo_transactions')
        .update({ status: 'cancelled' })
        .eq('cycle_id', cycleId)
        .eq('status', 'pending');

      // Release withdrawal locks
      await supabase
        .from('ajo_withdrawal_locks')
        .update({ released_at: new Date().toISOString() })
        .eq('cycle_id', cycleId)
        .is('released_at', null);

      return { success: true };
    } catch (error) {
      console.error('Rollback failed:', error);
      return { success: false };
    }
  }

  // Check transaction isolation level
  static async ensureTransactionIsolation(): Promise<{ isolation_level: string }> {
    const { data } = await supabase.rpc('get_transaction_isolation');
    return { isolation_level: data || 'READ_COMMITTED' };
  }

  // Get transaction status
  static async getTransactionStatus(transactionId: number): Promise<{
    status: TransactionState;
    created_at: string;
    processed_at?: string;
    metadata?: any;
  }> {
    const { data: transaction } = await supabase
      .from('ajo_transactions')
      .select('status, created_at, processed_at, metadata')
      .eq('id', transactionId)
      .single();

    if (!transaction) throw new Error('Transaction not found');

    return {
      status: transaction.status as TransactionState,
      created_at: transaction.created_at,
      processed_at: transaction.processed_at,
      metadata: transaction.metadata
    };
  }
}