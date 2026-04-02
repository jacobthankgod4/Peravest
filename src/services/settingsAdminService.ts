import { supabase } from '../lib/supabase';

export const settingsAdminService = {
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Settings table error:', error);
        // Return default settings if table doesn't exist
        return {
          maintenance_mode: false,
          site_name: 'PeraVest',
          contact_email: 'support@peravest.com',
          minimum_investment: 5000,
          withdrawal_fee: 0,
          max_withdrawal_per_day: 1000000
        };
      }
      
      // Convert array to object format
      const settings = {};
      (data || []).forEach(setting => {
        settings[setting.key] = setting.value;
      });
      
      return settings;
    } catch (error) {
      console.error('Settings service error:', error);
      return {
        maintenance_mode: false,
        site_name: 'PeraVest',
        contact_email: 'support@peravest.com',
        minimum_investment: 5000,
        withdrawal_fee: 0,
        max_withdrawal_per_day: 1000000
      };
    }
  },

  async updateSettings(settings: any) {
    try {
      const updates = [];
      
      for (const [key, value] of Object.entries(settings)) {
        updates.push({
          key,
          value,
          updated_at: new Date().toISOString()
        });
      }
      
      // Upsert each setting
      for (const update of updates) {
        await supabase
          .from('system_settings')
          .upsert(update, { onConflict: 'key' });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  },

  async toggleMaintenanceMode(enabled: boolean) {
    try {
      await supabase
        .from('system_settings')
        .upsert({
          key: 'maintenance_mode',
          value: enabled,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      
      return { success: true, maintenance_mode: enabled };
    } catch (error) {
      console.error('Toggle maintenance error:', error);
      throw error;
    }
  },

  async clearCache() {
    // Since we're using Supabase, this is just a placeholder
    // In a real implementation, this might clear Redis cache or similar
    console.log('Cache cleared (placeholder)');
    return { success: true, message: 'Cache cleared successfully' };
  }
};
