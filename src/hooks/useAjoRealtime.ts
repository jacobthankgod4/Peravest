import { useEffect, useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabase';

export const useAjoGroups = (userId: number) => {
  return useQuery(['ajo-groups', userId], async () => {
    const { data, error } = await supabase
      .from('ajo_group_members')
      .select('group_id, ajo_groups(*)')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;
    return data;
  }, { staleTime: 30000 });
};

export const useAjoGroupDetail = (groupId: number) => {
  return useQuery(['ajo-group', groupId], async () => {
    const { data, error } = await supabase
      .from('ajo_groups')
      .select('*, ajo_group_members(*), ajo_cycles(*)')
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data;
  }, { staleTime: 30000 });
};

export const useAjoMemberScore = (userId: number) => {
  return useQuery(['ajo-score', userId], async () => {
    const { data, error } = await supabase
      .from('ajo_member_scores')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }, { staleTime: 60000 });
};

export const useAjoCycles = (groupId: number) => {
  return useQuery(['ajo-cycles', groupId], async () => {
    const { data, error } = await supabase
      .from('ajo_cycles')
      .select('*')
      .eq('group_id', groupId)
      .order('cycle_number', { ascending: false });

    if (error) throw error;
    return data;
  }, { staleTime: 30000 });
};

export const useAjoTransactions = (userId: number) => {
  return useQuery(['ajo-transactions', userId], async () => {
    const { data, error } = await supabase
      .from('ajo_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  }, { staleTime: 30000 });
};

export const useAjoWithdrawalLocks = (userId: number) => {
  return useQuery(['ajo-locks', userId], async () => {
    const { data, error } = await supabase
      .from('ajo_withdrawal_locks')
      .select('*')
      .eq('user_id', userId)
      .is('released_at', null);

    if (error) throw error;
    return data;
  }, { staleTime: 30000 });
};

export const useAjoMemberHistory = (userId: number, groupId: number) => {
  return useQuery(['ajo-history', userId, groupId], async () => {
    const { data, error } = await supabase
      .from('ajo_member_history')
      .select('*')
      .eq('user_id', userId)
      .eq('group_id', groupId)
      .order('cycle_id', { ascending: false });

    if (error) throw error;
    return data;
  }, { staleTime: 30000 });
};

export const useAjoGraceNotices = (userId: number) => {
  return useQuery(['ajo-grace', userId], async () => {
    const { data, error } = await supabase
      .from('ajo_grace_notices')
      .select('*, ajo_group_members(*), ajo_cycles(*)')
      .eq('ajo_group_members.user_id', userId)
      .eq('notified', false);

    if (error) throw error;
    return data;
  }, { staleTime: 15000 });
};

export const useAjoRealtimeSubscription = (table: string, callback: (payload: any) => void) => {
  useEffect(() => {
    const subscription = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [table, callback]);
};

export const useAjoStats = (userId: number) => {
  return useQuery(['ajo-stats', userId], async () => {
    const [groups, transactions, locks, score] = await Promise.all([
      supabase.from('ajo_group_members').select('id').eq('user_id', userId).eq('status', 'active'),
      supabase.from('ajo_transactions').select('amount').eq('user_id', userId).eq('status', 'completed'),
      supabase.from('ajo_withdrawal_locks').select('id').eq('user_id', userId).is('released_at', null),
      supabase.from('ajo_member_scores').select('reliability_score').eq('user_id', userId).single()
    ]);

    const totalContributed = transactions.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    return {
      activeGroups: groups.data?.length || 0,
      totalContributed,
      withdrawalLocks: locks.data?.length || 0,
      reliabilityScore: score.data?.reliability_score || 1.0
    };
  }, { staleTime: 60000 });
};
