const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();
  
  console.log('Running migrations...');
  
  for (const file of files) {
    if (file.endsWith('.sql')) {
      console.log(`Running ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        await pool.query(sql);
        console.log(`✓ ${file} completed`);
      } catch (error) {
        console.error(`✗ ${file} failed:`, error.message);
        throw error;
      }
    }
  }
  
  console.log('All migrations completed successfully!');
  process.exit(0);
}

runMigrations().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
