// Phase 1: TypeScript Interfaces for Atomic Ajo Schema

export interface AjoGroup {
  id: number;
  name: string;
  description?: string;
  max_members: number;
  current_members: number;
  contribution_amount: number;
  frequency: 'weekly' | 'monthly';
  cycle_duration: number;
  status: 'forming' | 'active' | 'completed' | 'cancelled';
  created_by: number;
  created_at: string;
  started_at?: string;
  next_payout_date?: string;
  current_cycle: number;
  total_cycles?: number;
}

export interface AjoGroupMember {
  id: number;
  group_id: number;
  user_id: number;
  position: number;
  join_date: string;
  status: 'active' | 'inactive' | 'defaulted' | 'completed';
  payout_order?: number;
  last_contribution_date?: string;
  total_contributed: number;
  payout_received: boolean;
  reliability_score: number;
}

export interface AjoCycle {
  id: number;
  group_id: number;
  cycle_number: number;
  start_date: string;
  end_date: string;
  contribution_deadline: string;
  payout_recipient_id?: number;
  status: 'pending' | 'collecting' | 'locked' | 'completed' | 'failed' | 'cancelled';
  total_expected: number;
  total_collected: number;
  payout_amount: number;
  payout_date?: string;
  created_at: string;
}

export interface AjoTransaction {
  id: number;
  group_id: number;
  cycle_id?: number;
  user_id: number;
  amount: number;
  transaction_type: 'contribution' | 'payout' | 'refund' | 'penalty';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_reference?: string;
  payment_method?: string;
  created_at: string;
  processed_at?: string;
  metadata?: Record<string, any>;
}

export interface AjoWithdrawalLock {
  id: number;
  group_id: number;
  cycle_id?: number;
  user_id?: number;
  lock_type: 'cycle_incomplete' | 'contribution_pending' | 'payout_processing' | 'dispute';
  locked_until: string;
  reason: string;
  created_at: string;
  released_at?: string;
}

export interface AjoMemberHistory {
  id: number;
  user_id: number;
  group_id: number;
  cycle_id: number;
  contribution_due_date: string;
  contribution_date?: string;
  amount_due: number;
  amount_paid: number;
  days_late: number;
  status: 'pending' | 'paid' | 'late' | 'defaulted';
}

// Request/Response interfaces
export interface CreateGroupRequest {
  name: string;
  description?: string;
  max_members: number;
  contribution_amount: number;
  frequency: 'weekly' | 'monthly';
  cycle_duration: number;
}

export interface JoinGroupRequest {
  group_id: number;
  user_id: number;
}

export interface ContributionRequest {
  group_id: number;
  cycle_id: number;
  user_id: number;
  amount: number;
  payment_reference: string;
}

export interface GroupStats {
  total_groups: number;
  active_groups: number;
  total_contributed: number;
  total_payouts: number;
  reliability_score: number;
}

export interface CycleStatus {
  cycle_id: number;
  contributions_received: number;
  contributions_pending: number;
  can_process_payout: boolean;
  next_recipient: AjoGroupMember | null;
}