import { supabase } from '../lib/supabase';

export interface MemberProfile {
  id: number;
  user_id: number;
  photo_url?: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_verified_date?: string;
  bio?: string;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberStats {
  total_groups: number;
  total_contributed: number;
  total_received: number;
  on_time_rate: number;
  reliability_score: number;
  guarantor_count: number;
  collateral_amount: number;
}

export const ajoMemberProfileService = {
  /**
   * Get member profile
   */
  async getMemberProfile(userId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_member_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // If no profile exists, create default
      if (!data) {
        return await this.createDefaultProfile(userId);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error getting member profile:', error);
      return { data: null, error };
    }
  },

  /**
   * Create default profile for new user
   */
  async createDefaultProfile(userId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_member_profiles')
        .insert({
          user_id: userId,
          kyc_status: 'pending',
          phone_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating default profile:', error);
      return { data: null, error };
    }
  },

  /**
   * Update member profile
   */
  async updateMemberProfile(userId: number, updates: Partial<MemberProfile>) {
    try {
      const { data, error } = await supabase
        .from('ajo_member_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log event
      void supabase.rpc('log_ajo_event', {
        event: 'member_profile_updated',
        data: { user_id: userId, updates },
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error updating member profile:', error);
      return { data: null, error };
    }
  },

  /**
   * Upload member photo
   */
  async uploadMemberPhoto(userId: number, file: File) {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Upload to storage
      const fileName = `member-${userId}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ajo-member-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('ajo-member-photos')
        .getPublicUrl(fileName);

      // Update profile with photo URL
      const { data: profile, error: updateError } = await supabase
        .from('ajo_member_profiles')
        .update({
          photo_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Log event
      void supabase.rpc('log_ajo_event', {
        event: 'member_photo_uploaded',
        data: { user_id: userId, file_name: fileName },
      });

      return { data: profile, error: null };
    } catch (error) {
      console.error('Error uploading member photo:', error);
      return { data: null, error };
    }
  },

  /**
   * Get KYC status
   */
  async getKYCStatus(userId: number) {
    try {
      const { data, error } = await supabase
        .from('ajo_member_profiles')
        .select('kyc_status, kyc_verified_date')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        data: {
          status: data?.kyc_status || 'pending',
          verified_date: data?.kyc_verified_date,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error getting KYC status:', error);
      return { data: null, error };
    }
  },

  /**
   * Verify KYC (admin only)
   */
  async verifyKYC(userId: number, adminId: number, status: 'verified' | 'rejected') {
    try {
      const { data, error } = await supabase
        .from('ajo_member_profiles')
        .update({
          kyc_status: status,
          kyc_verified_date: status === 'verified' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Send notification
      const message = status === 'verified'
        ? 'Your KYC verification has been approved!'
        : 'Your KYC verification was rejected. Please try again.';

      // Send notification
      void supabase.rpc('notify_user', {
        p_user_id: userId,
        p_title: 'KYC Verification',
        p_message: message,
        p_type: `kyc_${status}`,
      });

      // Log event
      void supabase.rpc('log_ajo_event', {
        event: 'kyc_verified',
        data: { user_id: userId, status, admin_id: adminId },
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error verifying KYC:', error);
      return { data: null, error };
    }
  },

  /**
   * Get member statistics
   */
  async getMemberStats(userId: number): Promise<{ data: MemberStats | null; error: any }> {
    try {
      // Get groups
      const { data: memberships } = await supabase
        .from('ajo_memberships')
        .select('group_id')
        .eq('user_id', userId);

      const groupCount = memberships?.length || 0;

      // Get contributions
      const { data: contributions } = await supabase
        .from('ajo_contributions')
        .select('amount, status, due_date, paid_date')
        .eq('user_id', userId);

      const totalContributed = contributions?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
      const onTimeCount = contributions?.filter(c => {
        if (!c.due_date || !c.paid_date) return false;
        return new Date(c.paid_date) <= new Date(c.due_date);
      }).length || 0;
      const onTimeRate = contributions?.length ? (onTimeCount / contributions.length) * 100 : 0;

      // Get payouts
      const { data: payouts } = await supabase
        .from('ajo_payouts')
        .select('amount')
        .eq('user_id', userId);

      const totalReceived = payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      // Get reliability score
      const { data: scoreData } = await supabase
        .from('ajo_member_scores')
        .select('score')
        .eq('user_id', userId)
        .single();

      const reliabilityScore = scoreData?.score || 0.5;

      // Get guarantor count
      const { data: guarantors } = await supabase
        .from('ajo_guarantors')
        .select('id')
        .eq('member_id', userId);

      const guarantorCount = guarantors?.length || 0;

      // Get collateral
      const { data: collateral } = await supabase
        .from('ajo_collateral')
        .select('amount')
        .eq('member_id', userId)
        .eq('status', 'active')
        .single();

      const collateralAmount = collateral?.amount || 0;

      return {
        data: {
          total_groups: groupCount,
          total_contributed: totalContributed,
          total_received: totalReceived,
          on_time_rate: onTimeRate,
          reliability_score: reliabilityScore,
          guarantor_count: guarantorCount,
          collateral_amount: collateralAmount,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error getting member stats:', error);
      return { data: null, error };
    }
  },

  /**
   * Get member contribution history
   */
  async getMemberHistory(userId: number, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('ajo_contributions')
        .select(`
          id, amount, status, due_date, paid_date,
          ajo_cycles(cycle_number),
          ajo_groups(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting member history:', error);
      return { data: [], error };
    }
  },

  /**
   * Get member by ID (for display)
   */
  async getMemberById(userId: number) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('ajo_member_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      const { data: user, error: userError } = await supabase
        .from('user_accounts')
        .select('Id, FirstName, LastName, Email, phone_number')
        .eq('Id', userId)
        .single();

      if (userError) throw userError;

      return {
        data: {
          ...profile,
          user: user,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error getting member by ID:', error);
      return { data: null, error };
    }
  },

  /**
   * Get multiple members (for group display)
   */
  async getMembers(userIds: number[]) {
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('ajo_member_profiles')
        .select('*')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      const { data: users, error: userError } = await supabase
        .from('user_accounts')
        .select('Id, FirstName, LastName, Email, phone_number')
        .in('Id', userIds);

      if (userError) throw userError;

      // Merge data
      const members = userIds.map(id => ({
        profile: profiles?.find(p => p.user_id === id),
        user: users?.find(u => u.Id === id),
      }));

      return { data: members, error: null };
    } catch (error) {
      console.error('Error getting members:', error);
      return { data: [], error };
    }
  },

  /**
   * Subscribe to member profile updates
   */
  subscribeToMemberUpdates(userId: number, callback: (profile: any) => void) {
    const subscription = supabase
      .channel(`member-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ajo_member_profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Subscribe to member stats updates
   */
  subscribeToMemberStats(userId: number, callback: (stats: any) => void) {
    const subscription = supabase
      .channel(`member-stats-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ajo_contributions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Recalculate stats
          this.getMemberStats(userId).then(result => {
            if (result.data) callback(result.data);
          });
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Delete member photo
   */
  async deleteMemberPhoto(userId: number) {
    try {
      // Get current photo URL
      const { data: profile } = await supabase
        .from('ajo_member_profiles')
        .select('photo_url')
        .eq('user_id', userId)
        .single();

      if (profile?.photo_url) {
        // Extract file name from URL
        const fileName = profile.photo_url.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('ajo-member-photos')
            .remove([fileName]);
        }
      }

      // Update profile
      const { data, error } = await supabase
        .from('ajo_member_profiles')
        .update({
          photo_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting member photo:', error);
      return { data: null, error };
    }
  },
};
