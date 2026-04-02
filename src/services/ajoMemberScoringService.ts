import { supabase } from '../lib/supabase';

// Member Reliability Scoring System
export class AjoMemberScoringService {
  
  // Calculate member reliability score
  static async calculateReliabilityScore(userId: number): Promise<number> {
    const { data: history } = await supabase
      .from('ajo_member_history')
      .select('status, days_late')
      .eq('user_id', userId);

    if (!history || history.length === 0) return 1.0; // New member

    const totalContributions = history.length;
    const onTimeContributions = history.filter(h => h.status === 'paid' && h.days_late === 0).length;
    const lateContributions = history.filter(h => h.status === 'late').length;
    const defaultedContributions = history.filter(h => h.status === 'defaulted').length;

    // Score calculation: on-time = 1.0, late = 0.5, defaulted = 0.0
    const score = (onTimeContributions + (lateContributions * 0.5)) / totalContributions;
    
    return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
  }

  // Update member reliability score
  static async updateMemberScore(userId: number, groupId: number): Promise<void> {
    const score = await this.calculateReliabilityScore(userId);
    
    await supabase
      .from('ajo_group_members')
      .update({ reliability_score: score })
      .eq('user_id', userId)
      .eq('group_id', groupId);
  }

  // Check if member can join new groups
  static async canJoinGroup(userId: number): Promise<{ allowed: boolean; reason?: string }> {
    const score = await this.calculateReliabilityScore(userId);
    const MIN_SCORE = 0.7; // Minimum 70% reliability

    if (score < MIN_SCORE) {
      return {
        allowed: false,
        reason: `Reliability score too low (${(score * 100).toFixed(0)}%). Minimum required: ${MIN_SCORE * 100}%`
      };
    }

    // Check for active defaults
    const { data: activeDefaults } = await supabase
      .from('ajo_member_history')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'defaulted')
      .gte('contribution_due_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (activeDefaults && activeDefaults.length > 0) {
      return {
        allowed: false,
        reason: 'Active defaults in the last 30 days'
      };
    }

    return { allowed: true };
  }

  // Get member statistics
  static async getMemberStats(userId: number): Promise<{
    reliability_score: number;
    total_contributions: number;
    on_time_contributions: number;
    late_contributions: number;
    defaulted_contributions: number;
    active_groups: number;
  }> {
    const { data: history } = await supabase
      .from('ajo_member_history')
      .select('status, days_late')
      .eq('user_id', userId);

    const { data: memberships } = await supabase
      .from('ajo_group_members')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active');

    const score = await this.calculateReliabilityScore(userId);

    return {
      reliability_score: score,
      total_contributions: history?.length || 0,
      on_time_contributions: history?.filter(h => h.status === 'paid' && h.days_late === 0).length || 0,
      late_contributions: history?.filter(h => h.status === 'late').length || 0,
      defaulted_contributions: history?.filter(h => h.status === 'defaulted').length || 0,
      active_groups: memberships?.length || 0
    };
  }
}
