import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SimpleSupabaseTest: React.FC = () => {
  const [status, setStatus] = useState('Testing...');
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test basic connection
      const { error: connectionError } = await supabase.from('_test').select('*').limit(1);
      
      if (connectionError && connectionError.code !== 'PGRST116') {
        setStatus('❌ Connection failed');
        return;
      }
      
      setStatus('✅ Connected to Supabase');
      
      // Check tables
      const tablesToCheck = ['properties', 'users', 'investments', 'target_savings', 'ajo_groups'];
      const existing: string[] = [];
      
      for (const table of tablesToCheck) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
          existing.push(table);
        }
      }
      
      setTables(existing);
    } catch (error) {
      setStatus('❌ Error: ' + (error as Error).message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Supabase Connection Test</h2>
      <p><strong>Status:</strong> {status}</p>
      
      <h3>Existing Tables:</h3>
      {tables.length > 0 ? (
        <ul>
          {tables.map(table => (
            <li key={table} style={{ color: 'green' }}>✅ {table}</li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'orange' }}>No tables found</p>
      )}
      
      <button onClick={testConnection} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Test Again
      </button>
    </div>
  );
};

export default SimpleSupabaseTest;