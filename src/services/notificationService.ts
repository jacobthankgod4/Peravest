import { supabase } from './supabaseClient';

export type NotificationType = 'investment' | 'withdrawal' | 'kyc' | 'system' | 'ajo';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  userId?: number;
  adminId?: number;
  metadata?: Record<string, any>;
}

class NotificationService {
  async createNotification(payload: NotificationPayload) {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        admin_id: payload.adminId || 1,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        is_read: false
      })
      .select()
      .single();

    return { data, error };
  }

  async notifyNewInvestment(investmentId: number, amount: number, propertyTitle: string) {
    return this.createNotification({
      type: 'investment',
      title: 'New Investment',
      message: `New investment of ₦${amount.toLocaleString()} in ${propertyTitle}`,
      metadata: { investmentId }
    });
  }

  async notifyWithdrawalRequest(withdrawalId: number, amount: number, userEmail: string) {
    return this.createNotification({
      type: 'withdrawal',
      title: 'Withdrawal Request',
      message: `${userEmail} requested withdrawal of ₦${amount.toLocaleString()}`,
      metadata: { withdrawalId }
    });
  }

  async notifyKYCSubmission(userId: number, userEmail: string) {
    return this.createNotification({
      type: 'kyc',
      title: 'KYC Submission',
      message: `${userEmail} submitted KYC documents for review`,
      metadata: { userId }
    });
  }

  async markAsRead(notificationId: number) {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return { error };
  }

  async markAllAsRead(adminId: number) {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('admin_id', adminId)
      .eq('is_read', false);

    return { error };
  }

  subscribeToNotifications(adminId: number, callback: (notification: any) => void) {
    return supabase
      .channel('admin-notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_notifications', filter: `admin_id=eq.${adminId}` },
        payload => callback(payload.new)
      )
      .subscribe();
  }
}

export const notificationService = new NotificationService();
