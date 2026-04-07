/**
 * Direct Supabase REST API utility to bypass query builder HTML encoding
 * This makes raw REST calls with proper headers to avoid 406 errors
 */

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase credentials');
}

export const supabaseRest = {
  async queryUserByEmail(email: string) {
    try {
      // Build URL without using Supabase query builder
      const url = new URL(`${SUPABASE_URL}/rest/v1/user_accounts`);
      url.searchParams.append('select', 'Id,Email,Name,User_Type,created_at');
      url.searchParams.append('Email', `eq.${email}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('REST API query failed:', error);
      throw error;
    }
  },

  async queryUserById(id: string | number) {
    try {
      const url = new URL(`${SUPABASE_URL}/rest/v1/user_accounts`);
      url.searchParams.append('select', 'Id,Email,Name,User_Type,created_at');
      url.searchParams.append('Id', `eq.${id}`);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('REST API query failed:', error);
      throw error;
    }
  },

  async queryAllUsers() {
    try {
      const url = new URL(`${SUPABASE_URL}/rest/v1/user_accounts`);
      url.searchParams.append('select', 'Id,Email,Name,User_Type,created_at');
      url.searchParams.append('order', 'created_at.desc');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('REST API query failed:', error);
      throw error;
    }
  }
};
