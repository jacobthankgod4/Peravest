import { supabase } from '../lib/supabase';
import { supabaseRest } from '../utils/supabaseRest';

export const userService = {
  async getSubscribers() {
    try {
      return await supabaseRest.queryAllUsers();
    } catch (err) {
      console.error('getSubscribers failed:', err);
      throw err;
    }
  },

  async getUserById(id: string) {
    try {
      const user = await supabaseRest.queryUserById(id);
      if (!user) throw new Error('User not found');
      return {
        id: user.Id,
        name: user.Name,
        email: user.Email,
        userType: user.User_Type,
        createdAt: user.created_at
      };
    } catch (err) {
      console.error('getUserById failed:', err);
      throw err;
    }
  },

  async getUserByEmail(email: string) {
    try {
      const user = await supabaseRest.queryUserByEmail(email);
      if (!user) return null;
      return {
        id: user.Id,
        name: user.Name,
        email: user.Email,
        userType: user.User_Type,
        createdAt: user.created_at
      };
    } catch (err) {
      console.error('getUserByEmail failed:', err);
      throw err;
    }
  },

  async updateUser(id: string, updates: any) {
    try {
      const { error } = await supabase
        .from('user_accounts')
        .update(updates)
        .eq('Id', id);

      if (error) throw error;
    } catch (err) {
      console.error('updateUser failed:', err);
      throw err;
    }
  },

  async deleteUser(id: string) {
    try {
      const { error } = await supabase
        .from('user_accounts')
        .delete()
        .eq('Id', id);

      if (error) throw error;
    } catch (err) {
      console.error('deleteUser failed:', err);
      throw err;
    }
  }
};
