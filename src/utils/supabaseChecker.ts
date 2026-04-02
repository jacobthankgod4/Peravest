import { supabase } from '../lib/supabase';

export const checkSupabaseConnection = async () => {
  try {
    console.log('🔍 Checking Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found (expected)
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

export const checkExistingTables = async () => {
  console.log('🔍 Checking existing tables...');
  
  const tables = ['property', 'investment', 'user_accounts', 'target_savings', 'ajo_groups', 'ajo_memberships', 'ajo_contributions', 'savings_transactions'];
  const existingTables: string[] = [];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        existingTables.push(table);
        console.log(`✅ Table '${table}' exists`);
      } else if (error.code === 'PGRST116') {
        console.log(`❌ Table '${table}' does not exist`);
      } else {
        console.log(`⚠️ Table '${table}' - Error: ${error.message}`);
      }
    } catch (err) {
      console.log(`⚠️ Table '${table}' - Error checking`);
    }
  }
  
  return existingTables;
};

export const testPropertyFetch = async () => {
  console.log('🔍 Testing property fetch...');
  
  try {
    const { data, error } = await supabase
      .from('property')
      .select('*')
      .eq('Status', 'active')
      .limit(3);
    
    if (error) {
      console.error('❌ Property fetch failed:', error);
      return null;
    }
    
    console.log('✅ Property fetch successful:', data?.length || 0, 'properties found');
    return data;
  } catch (error) {
    console.error('❌ Property fetch error:', error);
    return null;
  }
};

export const testUserTableStructure = async () => {
  console.log('🔍 Testing user table structure...');
  
  try {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('Id, Email, Name')
      .limit(1);
    
    if (error) {
      console.error('❌ User table test failed:', error);
      return null;
    }
    
    console.log('✅ User table structure correct');
    return data;
  } catch (error) {
    console.error('❌ User table error:', error);
    return null;
  }
};