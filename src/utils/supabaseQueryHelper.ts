import { supabase } from '../lib/supabase';

/**
 * Safe wrapper for Supabase queries to prevent 406 errors
 * Ensures proper error handling and request formatting
 */
export const supabaseQueryHelper = {
  async queryUserByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('Id, Email, Name, User_Type, created_at')
        .eq('Email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No user found
        }
        throw error;
      }

      return data;
    } catch (err: any) {
      console.error('Query user by email failed:', err);
      throw err;
    }
  },

  async queryUserById(id: string | number) {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('Id, Email, Name, User_Type, created_at')
        .eq('Id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No user found
        }
        throw error;
      }

      return data;
    } catch (err: any) {
      console.error('Query user by id failed:', err);
      throw err;
    }
  },

  async queryAllUsers() {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('Id, Email, Name, User_Type, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      console.error('Query all users failed:', err);
      throw err;
    }
  }
};
