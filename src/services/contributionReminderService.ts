import { supabase } from '../lib/supabase';

export interface ReminderConfig {
  daysBeforeDue: number;
  reminderType: 'sms' | 'email' | 'in_app' | 'all';
  message?: string;
}

export interface ContributionReminder {
  id: string;
  userId: number;
  cycleId: number;
  groupId: number;
  reminderType: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  dueDate: string;
  amount: number;
}

class ContributionReminderService {
  /**
   * Send SMS reminder for pending contribution
   */
  async sendSMSReminder(
    phoneNumber: string,
    groupName: string,
    amount: number,
    dueDate: string
  ): Promise<boolean> {
    try {
      // Call Flutterwave SMS API or third-party SMS service
      // For now, we'll log it and store in database
      const message = `Hi! Your contribution of ₦${amount} to ${groupName} is due on ${new Date(dueDate).toLocaleDateString()}. Pay now to stay on track!`;
      
      console.log(`SMS Reminder: ${phoneNumber} - ${message}`);

      // In production, integrate with SMS service like Twilio, Termii, or Flutterwave SMS
      // const response = await fetch('https://api.sms-service.com/send', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${process.env.SMS_API_KEY}` },
      //   body: JSON.stringify({ phone: phoneNumber, message })
      // });

      return true;
    } catch (error) {
      console.error('Error sending SMS reminder:', error);
      return false;
    }
  }

  /**
   * Send email reminder for pending contribution
   */
  async sendEmailReminder(
    email: string,
    groupName: string,
    amount: number,
    dueDate: string,
    userName: string
  ): Promise<boolean> {
    try {
      // Call email service API
      const emailData = {
        to: email,
        subject: `Reminder: Your ${groupName} Ajo contribution is due`,
        template: 'contribution_reminder',
        data: {
          userName,
          groupName,
          amount,
          dueDate: new Date(dueDate).toLocaleDateString(),
          paymentLink: `${window.location.origin}/ajo/contribute`,
        },
      };

      console.log('Email Reminder:', emailData);

      // In production, integrate with email service like SendGrid, Mailgun, or AWS SES
      // const response = await fetch('https://api.email-service.com/send', {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${process.env.EMAIL_API_KEY}` },
      //   body: JSON.stringify(emailData)
      // });

      return true;
    } catch (error) {
      console.error('Error sending email reminder:', error);
      return false;
    }
  }

  /**
   * Create in-app notification for pending contribution
   */
  async createInAppReminder(
    userId: number,
    cycleId: number,
    groupId: number,
    groupName: string,
    amount: number,
    dueDate: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'contribution_reminder',
          title: `${groupName} contribution due`,
          message: `Your contribution of ₦${amount} is due on ${new Date(dueDate).toLocaleDateString()}`,
          data: {
            cycleId,
            groupId,
            amount,
            dueDate,
          },
          read: false,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating in-app reminder:', error);
      return false;
    }
  }

  /**
   * Send reminders for all pending contributions
   */
  async sendPendingReminders(config: ReminderConfig = { daysBeforeDue: 3, reminderType: 'all' }) {
    try {
      // Get all pending contributions due within X days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + config.daysBeforeDue);

      const { data: pendingContributions, error } = await supabase
        .from('ajo_member_history')
        .select(`
          *,
          ajo_cycles(contribution_deadline),
          ajo_groups(name, contribution_amount),
          user_accounts(email, phone_number, full_name)
        `)
        .eq('status', 'pending')
        .lte('ajo_cycles(contribution_deadline)', dueDate.toISOString())
        .gte('ajo_cycles(contribution_deadline)', new Date().toISOString());

      if (error) throw error;

      const results = {
        total: pendingContributions?.length || 0,
        sent: 0,
        failed: 0,
      };

      for (const contribution of pendingContributions || []) {
        try {
          const groupName = contribution.ajo_groups?.name || 'Your Ajo';
          const amount = contribution.amount_due;
          const dueDate = contribution.ajo_cycles?.contribution_deadline;
          const email = contribution.user_accounts?.email;
          const phone = contribution.user_accounts?.phone_number;
          const userName = contribution.user_accounts?.full_name;

          let sent = false;

          if (config.reminderType === 'sms' || config.reminderType === 'all') {
            if (phone) {
              sent = await this.sendSMSReminder(phone, groupName, amount, dueDate);
            }
          }

          if (config.reminderType === 'email' || config.reminderType === 'all') {
            if (email) {
              sent = await this.sendEmailReminder(email, groupName, amount, dueDate, userName);
            }
          }

          if (config.reminderType === 'in_app' || config.reminderType === 'all') {
            sent = await this.createInAppReminder(
              contribution.user_id,
              contribution.cycle_id,
              contribution.group_id,
              groupName,
              amount,
              dueDate
            );
          }

          if (sent) {
            results.sent++;
          } else {
            results.failed++;
          }
        } catch (err) {
          console.error('Error sending reminder for contribution:', err);
          results.failed++;
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending pending reminders:', error);
      throw error;
    }
  }

  /**
   * Send grace period reminder
   */
  async sendGracePeriodReminder(
    userId: number,
    cycleId: number,
    groupName: string,
    amount: number,
    graceDaysRemaining: number
  ): Promise<boolean> {
    try {
      const { data: user, error: userError } = await supabase
        .from('user_accounts')
        .select('email, phone_number, full_name')
        .eq('Id', userId)
        .single();

      if (userError) throw userError;

      const message = `⚠️ Grace period reminder: You have ${graceDaysRemaining} days to pay your ₦${amount} contribution to ${groupName}. Pay now to avoid penalties!`;

      // Send SMS
      if (user.phone_number) {
        await this.sendSMSReminder(user.phone_number, groupName, amount, new Date().toISOString());
      }

      // Create in-app notification
      await this.createInAppReminder(
        userId,
        cycleId,
        0,
        groupName,
        amount,
        new Date().toISOString()
      );

      return true;
    } catch (error) {
      console.error('Error sending grace period reminder:', error);
      return false;
    }
  }

  /**
   * Get reminder history for a user
   */
  async getReminderHistory(userId: number) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'contribution_reminder')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reminder history:', error);
      throw error;
    }
  }

  /**
   * Mark reminder as read
   */
  async markReminderAsRead(reminderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', reminderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking reminder as read:', error);
      return false;
    }
  }
}

export const contributionReminderService = new ContributionReminderService();
