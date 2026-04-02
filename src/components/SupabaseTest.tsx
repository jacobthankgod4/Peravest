import React, { useEffect, useState } from 'react';
import { checkSupabaseConnection, checkExistingTables, testPropertyFetch, testUserTableStructure } from '../utils/supabaseChecker';

interface TestResult {
  connection: boolean;
  tables: string[];
  properties: any[] | null;
  userTest: any[] | null;
  error?: string;
}

const SupabaseTest: React.FC = () => {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    try {
      console.log('🚀 Starting Supabase tests...');
      
      const connection = await checkSupabaseConnection();
      const tables = await checkExistingTables();
      const properties = await testPropertyFetch();
      const userTest = await testUserTableStructure();
      
      setResult({
        connection,
        tables,
        properties,
        userTest
      });
      
      console.log('✅ Tests completed');
    } catch (error) {
      console.error('❌ Test error:', error);
      setResult({
        connection: false,
        tables: [],
        properties: null,
        userTest: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 Supabase Connection Test</h2>
      
      {loading && <p>⏳ Running tests...</p>}
      
      {result && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3>Connection Status</h3>
            <p style={{ color: result.connection ? 'green' : 'red' }}>
              {result.connection ? '✅ Connected' : '❌ Failed'}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Existing Tables</h3>
            {result.tables.length > 0 ? (
              <ul>
                {result.tables.map(table => (
                  <li key={table} style={{ color: 'green' }}>✅ {table}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'orange' }}>⚠️ No tables found</p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>User Table Test</h3>
            {result.userTest !== null ? (
              <p style={{ color: 'green' }}>✅ User table structure correct</p>
            ) : (
              <p style={{ color: 'orange' }}>⚠️ User table missing or incorrect structure</p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Property Data Test</h3>
            {result.properties ? (
              <div>
                <p style={{ color: 'green' }}>✅ Found {result.properties.length} properties</p>
                {result.properties.length > 0 && (
                  <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                    {JSON.stringify(result.properties[0], null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <p style={{ color: 'orange' }}>⚠️ No properties found or table missing</p>
            )}
          </div>

          {result.error && (
            <div style={{ marginBottom: '20px' }}>
              <h3>Error</h3>
              <p style={{ color: 'red' }}>❌ {result.error}</p>
            </div>
          )}

          <div style={{ marginTop: '30px', padding: '15px', background: '#f0f8ff', border: '1px solid #ccc' }}>
            <h3>Next Steps</h3>
            {result.tables.length === 0 ? (
              <div>
                <p>📋 <strong>Create Database Schema:</strong></p>
                <ol>
                  <li>Go to your Supabase dashboard</li>
                  <li>Open SQL Editor</li>
                  <li>Copy and run the SQL from: <code>database/schema.sql</code></li>
                  <li>Then run: <code>database/sample_data.sql</code></li>
                </ol>
              </div>
            ) : (
              <p>✅ Database is ready! Your React app should now connect properly.</p>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={runTests} 
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          marginTop: '20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '⏳ Testing...' : '🔄 Run Tests Again'}
      </button>
    </div>
  );
};

export default SupabaseTest;