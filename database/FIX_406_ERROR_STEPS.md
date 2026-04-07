## How to Fix the 406 Error - Step by Step

### The Problem
The migration files exist on your computer but have NOT been executed in your Supabase database. The `user_accounts` table doesn't exist, so Supabase returns 406 errors.

### Solution: Execute Migrations in Supabase

#### Option 1: Using Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com
   - Select your project: `vqlybihufqliujmgwcgz`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Execute First Migration**
   - Open file: `database/100_create_user_accounts_table.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run" button
   - Wait for success message

4. **Copy and Execute Second Migration**
   - Open file: `database/099_DEFINITIVE_user_profiles_schema.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run" button
   - Wait for success message

5. **Copy and Execute Third Migration**
   - Open file: `database/KYC_MIGRATION_NO_FK.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run" button
   - Wait for success message

6. **Verify Tables Were Created**
   - Click "Table Editor" in left sidebar
   - You should see:
     - `user_accounts` table
     - `user_profiles` table
     - `kyc_submissions` table

#### Option 2: Using psql Command Line

1. **Get your Supabase connection details**
   - Go to Supabase Dashboard
   - Click "Connect" button
   - Copy the connection string

2. **Connect to your database**
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.vqlybihufqliujmgwcgz.supabase.co:5432/postgres"
   ```

3. **Execute migrations**
   ```bash
   \i database/100_create_user_accounts_table.sql
   \i database/099_DEFINITIVE_user_profiles_schema.sql
   \i database/KYC_MIGRATION_NO_FK.sql
   ```

4. **Verify tables**
   ```sql
   \dt
   ```

### Verification Checklist

After executing migrations, verify:

1. **Check user_accounts table exists**
   ```sql
   SELECT * FROM user_accounts LIMIT 1;
   ```
   Should return: (no rows, but no error)

2. **Check user_profiles table exists**
   ```sql
   SELECT * FROM user_profiles LIMIT 1;
   ```
   Should return: (no rows, but no error)

3. **Check kyc_submissions table exists**
   ```sql
   SELECT * FROM kyc_submissions LIMIT 1;
   ```
   Should return: (no rows, but no error)

4. **Check RLS is enabled**
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('user_accounts', 'user_profiles', 'kyc_submissions');
   ```
   Should show: `rowsecurity = true` for all tables

5. **Check in Supabase Dashboard**
   - Go to "Table Editor"
   - Verify all three tables appear in the list
   - Click on each table to verify columns

### After Migrations Are Executed

1. **Refresh your browser**
   - Close all browser tabs with the app
   - Clear browser cache (Ctrl+Shift+Delete)
   - Open the app again

2. **Test the application**
   - Try to login
   - Check browser console for errors
   - The 406 errors should be gone

3. **Monitor console**
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for any remaining errors

### If You Still Get 406 Errors

1. **Verify table is exposed in REST API**
   - Go to Supabase Dashboard
   - Click "API Documentation"
   - Search for "user_accounts"
   - If not listed, the table wasn't created properly

2. **Check RLS policies**
   - Go to "Authentication" → "Policies"
   - Look for policies on `user_accounts`
   - Should see 4 policies: allow_insert, allow_select, allow_update, allow_delete

3. **Check table schema**
   - Go to "Table Editor"
   - Click on `user_accounts`
   - Verify columns: Id, Email, Name, User_Type, status, created_at

### Troubleshooting

**Error: "relation 'user_accounts' already exists"**
- The table already exists
- This is fine, the migration has `IF NOT EXISTS`
- Continue to next migration

**Error: "permission denied"**
- You don't have permission to create tables
- Use Supabase Dashboard SQL Editor instead
- Or contact Supabase support

**Error: "syntax error"**
- The SQL code has an error
- Check that you copied the entire file
- Try again with the complete SQL

### Success Indicators

✅ Tables appear in Supabase Dashboard Table Editor
✅ No 406 errors in browser console
✅ Application loads without errors
✅ Can login and access features

### Next Steps

Once migrations are executed:
1. Test login functionality
2. Test referral features
3. Test KYC submission
4. Test withdrawal requests
5. Monitor console for any remaining errors
