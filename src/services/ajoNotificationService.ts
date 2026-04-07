import { supabase } from '../lib/supabase';

interface PidginMessage {
  phone: string;
  message: string;
  type: 'grace_period' | 'contribution_due' | 'payout_ready' | 'default_notice';
}

const getGroupName = (groupData: any): string => {
  if (Array.isArray(groupData)) {
    return groupData[0]?.name || 'Group';
  }
  return groupData?.name || 'Group';
};

const getPhoneNumber = (userAccounts: any): string | null => {
  if (Array.isArray(userAccounts)) {
    return userAccounts[0]?.phone_number || null;
  }
  return userAccounts?.phone_number || null;
};

export const ajoNotificationService = {
  // Pidgin grace period notice - 2.7
  sendGracePeriodNotice: async (memberId: number, groupId: number, daysRemaining: number) => {
    try {
      // Get member details
      const { data: memberData, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('user_id, ajo_groups(name)')
        .eq('id', memberId)
        .single();

      if (memberError || !memberData) throw new Error('Member not found');

      const member = memberData as any;
      const groupName = getGroupName(member.ajo_groups);

      // Get user phone
      const { data: user, error: userError } = await supabase
        .from('user_accounts')
        .select('phone_number')
        .eq('Id', member.user_id)
        .single();

      if (userError || !user?.phone_number) throw new Error('User phone not found');

      // Pidgin message
      const pidginMessages = {
        3: `Bros/Sis, your Ajo contribution for ${groupName} don miss deadline. You get 3 days grace period to pay sharp sharp! No wahala, just settle am quick quick.`,
        2: `Oga/Madam! Last 2 days to settle your Ajo contribution for ${groupName}. E don reach final warning o! Pay now before e turn to default.`,
        1: `URGENT! Just 1 day left to pay your Ajo contribution for ${groupName}. After today, na default! Abeg pay now now!`
      };

      const message = pidginMessages[daysRemaining as keyof typeof pidginMessages] || 
        `Your Ajo grace period expires in ${daysRemaining} days. Please pay your contribution.`;

      // Send SMS (integrate with SMS provider)
      await ajoNotificationService.sendSMS({
        phone: user.phone_number,
        message,
        type: 'grace_period'
      });

      // Create in-app notification
      await supabase
        .from('ajo_grace_notices')
        .update({ notified: true, notification_sent_at: new Date().toISOString() })
        .eq('membership_id', memberId);

      return { success: true };
    } catch (error) {
      console.error('sendGracePeriodNotice error:', error);
      throw error;
    }
  },

  // Send contribution due reminder
  sendContributionDueReminder: async (groupId: number, cycleId: number) => {
    try {
      // Get all active members
      const { data: membersData, error: membersError } = await supabase
        .from('ajo_group_members')
        .select('user_id, user_accounts(phone_number)')
        .eq('group_id', groupId)
        .eq('status', 'active');

      if (membersError || !membersData) throw new Error('Failed to fetch members');

      // Get cycle details
      const { data: cycleData } = await supabase
        .from('ajo_cycles')
        .select('contribution_deadline, ajo_groups(name, contribution_amount)')
        .eq('id', cycleId)
        .single();

      if (!cycleData) throw new Error('Cycle not found');

      const cycle = cycleData as any;
      const groupName = getGroupName(cycle.ajo_groups);
      const contributionAmount = Array.isArray(cycle.ajo_groups) 
        ? cycle.ajo_groups[0]?.contribution_amount 
        : cycle.ajo_groups?.contribution_amount;

      // Send to each member
      for (const member of membersData) {
        const memberTyped = member as any;
        const phoneNumber = getPhoneNumber(memberTyped.user_accounts);
        
        if (!phoneNumber) continue;

        const message = `Reminder: Your Ajo contribution of ₦${contributionAmount} for ${groupName} is due by ${new Date(cycle.contribution_deadline).toLocaleDateString()}. Pay now to maintain your reliability score!`;

        await ajoNotificationService.sendSMS({
          phone: phoneNumber,
          message,
          type: 'contribution_due'
        });
      }

      return { success: true, memberCount: membersData.length };
    } catch (error) {
      console.error('sendContributionDueReminder error:', error);
      throw error;
    }
  },

  // Send payout ready notification
  sendPayoutReadyNotification: async (memberId: number, amount: number) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('user_id, ajo_groups(name)')
        .eq('id', memberId)
        .single();

      if (memberError || !memberData) throw new Error('Member not found');

      const member = memberData as any;
      const groupName = getGroupName(member.ajo_groups);

      const { data: user } = await supabase
        .from('user_accounts')
        .select('phone_number')
        .eq('Id', member.user_id)
        .single();

      if (!user?.phone_number) throw new Error('User phone not found');

      const message = `Congratulations! Your Ajo payout of ₦${amount} from ${groupName} is ready! Go to your dashboard to withdraw. E don pay o!`;

      await ajoNotificationService.sendSMS({
        phone: user.phone_number,
        message,
        type: 'payout_ready'
      });

      return { success: true };
    } catch (error) {
      console.error('sendPayoutReadyNotification error:', error);
      throw error;
    }
  },

  // Send default notice
  sendDefaultNotice: async (memberId: number, groupId: number) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('ajo_group_members')
        .select('user_id, ajo_groups(name)')
        .eq('id', memberId)
        .single();

      if (memberError || !memberData) throw new Error('Member not found');

      const member = memberData as any;
      const groupName = getGroupName(member.ajo_groups);

      const { data: user } = await supabase
        .from('user_accounts')
        .select('phone_number')
        .eq('Id', member.user_id)
        .single();

      if (!user?.phone_number) throw new Error('User phone not found');

      const message = `Your Ajo contribution for ${groupName} has been marked as DEFAULT. Your reliability score has been affected. Contact group admin to resolve.`;

      await ajoNotificationService.sendSMS({
        phone: user.phone_number,
        message,
        type: 'default_notice'
      });

      return { success: true };
    } catch (error) {
      console.error('sendDefaultNotice error:', error);
      throw error;
    }
  },

  // Generic SMS sender (integrate with Twilio, Termii, etc.)
  sendSMS: async (notification: PidginMessage) => {
    try {
      // TODO: Integrate with SMS provider (Twilio, Termii, etc.)
      console.log('SMS to send:', notification);

      // For now, just log it
      await supabase
        .from('notification_logs')
        .insert([{
          recipient: notification.phone,
          message: notification.message,
          type: notification.type,
          status: 'sent',
          created_at: new Date().toISOString()
        }]);

      return { success: true };
    } catch (error) {
      console.error('sendSMS error:', error);
      throw error;
    }
  },

  // Create in-app notification
  createInAppNotification: async (userId: number, title: string, message: string, type: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          title,
          message,
          type,
          read: false,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('createInAppNotification error:', error);
      throw error;
    }
  }
};
