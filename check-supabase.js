const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking Supabase database tables...\n');
  
  const tables = [
    'property',
    'investment', 
    'users',
    'target_savings',
    'ajo_groups',
    'ajo_memberships',
    'ajo_contributions',
    'savings_transactions'
  ];
  
  const existing = [];
  const missing = [];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      
      if (!error) {
        existing.push(table);
        console.log(`✅ ${table}`);
      } else if (error.code === 'PGRST116') {
        missing.push(table);
        console.log(`❌ ${table} (missing)`);
      } else {
        console.log(`⚠️  ${table} (error: ${error.message})`);
      }
    } catch (err) {
      missing.push(table);
      console.log(`❌ ${table} (error checking)`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Existing tables: ${existing.length}`);
  console.log(`❌ Missing tables: ${missing.length}`);
  
  if (missing.length > 0) {
    console.log('\n🔧 Missing tables to create:');
    missing.forEach(table => console.log(`- ${table}`));
  }
  
  // Test property structure if exists
  if (existing.includes('property')) {
    console.log('\n🔍 Testing property table structure...');
    try {
      const { data, error } = await supabase
        .from('property')
        .select('Id, Title, Status, Price, Address')
        .limit(1);
      
      if (!error) {
        console.log('✅ Property table structure looks good');
        if (data && data.length > 0) {
          console.log('✅ Sample data found');
        } else {
          console.log('⚠️  No sample data in property table');
        }
      } else {
        console.log('❌ Property table structure issue:', error.message);
      }
    } catch (err) {
      console.log('❌ Error testing property:', err.message);
    }
  }
}

checkTables().catch(console.error);