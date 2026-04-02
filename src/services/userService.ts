import { supabase } from '../lib/supabase';

export const userService = {
  async getSubscribers() {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(user => ({
      id: user.Id,
      name: user.Name,
      email: user.Email,
      userType: user.User_Type,
      createdAt: user.created_at
    }));
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('Id', id)
      .single();

    if (error) throw error;

    return {
      id: data.Id,
      name: data.Name,
      email: data.Email,
      userType: data.User_Type,
      createdAt: data.created_at
    };
  },

  async updateUser(id: string, updates: any) {
    const { error } = await supabase
      .from('user_accounts')
      .update(updates)
      .eq('Id', id);

    if (error) throw error;
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('user_accounts')
      .delete()
      .eq('Id', id);

    if (error) throw error;
  }
};
