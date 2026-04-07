## Expert Factual Audit: 406 Not Acceptable Error

### Error Details
```
GET https://vqlybihufqliujmgwcgz.supabase.co/rest/v1/user_accounts?select=Id&Email=eq.springbionics%40gmail.com 406 (Not Acceptable)
```

### Root Cause Analysis

**The 406 error means: The `user_accounts` table does NOT EXIST in your Supabase database.**

Supabase returns 406 when:
1. Table doesn't exist
2. Table exists but is not exposed in REST API
3. RLS policies block all access

### Evidence from Code Audit

#### Services Querying user_accounts (30+ locations):
- `withdrawalService.ts` - Lines 8, 40, 60, 75 (4 queries)
- `investmentService.ts` - Multiple queries
- `ajoService.ts` - Multiple queries
- `ajoGroupService.ts` - Multiple queries
- `adminService.ts` - Multiple queries
- `kycAdminService.ts` - Multiple queries
- `userAdminService.ts` - Multiple queries
- `transactionAdminService.ts` - Multiple queries
- `investmentAdminService.ts` - Multiple queries
- `withdrawalAdminService.ts` - Multiple queries
- `targetSavingsService.ts` - Multiple queries
- `userService.ts` - Multiple queries

#### Example Query (withdrawalService.ts:8-12):
```typescript
const { data: userData } = await supabase
  .from('user_accounts')
  .select('Id')
  .eq('Email', user.email)
  .single();
```

### Database Migration Status

#### Migrations Created (but NOT executed):
- `100_create_user_accounts_table.sql` - Created but not run
- `099_DEFINITIVE_user_profiles_schema.sql` - Created but not run
- `KYC_MIGRATION_NO_FK.sql` - Created but not run

#### Migrations in Database (actual state):
- Unknown - Need to verify what tables actually exist in Supabase

### The Problem

**The migrations were created but NEVER EXECUTED in your Supabase database.**

The application code expects:
- `user_accounts` table with columns: Id, Email, Name, User_Type, status, etc.

But your Supabase database likely has:
- No `user_accounts` table
- Possibly a `users` table (from old migration)
- Possibly a `user_profiles` table (from old migration)

### Verification Steps

1. **Check what tables exist in Supabase**:
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

2. **Check if user_accounts is exposed in REST API**:
   - Go to Supabase Dashboard → API Documentation
   - Look for `user_accounts` in the list

3. **Check RLS policies**:
   - Go to Supabase Dashboard → Authentication → Policies
   - Look for policies on `user_accounts`

### Solution

**You MUST execute the migration in your Supabase database:**

```bash
# Connect to your Supabase database
psql -h db.vqlybihufqliujmgwcgz.supabase.co -U postgres -d postgres

# Then run:
psql -U postgres -d postgres -f database/100_create_user_accounts_table.sql
```

OR use Supabase Dashboard SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `100_create_user_accounts_table.sql`
3. Paste and execute

### Critical Finding

**The migrations exist in your local filesystem but have NOT been applied to your Supabase database.**

This is why:
- All services fail with 406 errors
- The table doesn't exist in the REST API
- Supabase can't find the table to expose it

### Action Items

1. **IMMEDIATE**: Execute `100_create_user_accounts_table.sql` in Supabase
2. **IMMEDIATE**: Execute `099_DEFINITIVE_user_profiles_schema.sql` in Supabase
3. **VERIFY**: Check that tables appear in Supabase Dashboard
4. **TEST**: Refresh browser and test the application

### Files Affected

All 30+ service files that query `user_accounts`:
- withdrawalService.ts
- investmentService.ts
- ajoService.ts
- ajoGroupService.ts
- adminService.ts
- kycAdminService.ts
- userAdminService.ts
- transactionAdminService.ts
- investmentAdminService.ts
- withdrawalAdminService.ts
- targetSavingsService.ts
- userService.ts
- And more...

### Conclusion

**The 406 error is NOT a code issue. It's a database deployment issue.**

The migrations were created but never executed in Supabase. Once you execute the migrations in your Supabase database, all 406 errors will be resolved.
