## User Accounts Table Fix - Complete Guide

### Problem Summary
The application had a mismatch between:
- Migration file: Creates `users` table (001_create_users_pg.sql)
- All services: Query `user_accounts` table
- Result: 406 Not Acceptable error when trying to access user_accounts

### Root Cause
The migration was named `001_create_users_pg.sql` but created a `users` table, while all 30+ service files expect a `user_accounts` table. This naming inconsistency caused the REST API to return 406 errors.

### Solution
Create the `user_accounts` table that all services expect using `100_create_user_accounts_table.sql`.

### Migration Steps

1. **Run the user_accounts table creation**:
   ```bash
   psql -U <username> -d <database> -f database/100_create_user_accounts_table.sql
   ```

2. **Verify the table exists**:
   ```sql
   \d user_accounts
   ```
   
   Expected output should show:
   - `Id` column: INT with GENERATED ALWAYS AS IDENTITY
   - `Email` column: VARCHAR(255) with UNIQUE constraint
   - `Name`, `User_Type`, `status` columns
   - All indexes created
   - RLS enabled with 4 permissive policies

### Services Using user_accounts
The following services all query `user_accounts`:
- userService.ts
- userAdminService.ts
- investmentService.ts
- ajoService.ts
- ajoGroupService.ts
- kycAdminService.ts
- withdrawalService.ts
- withdrawalAdminService.ts
- transactionAdminService.ts
- adminService.ts
- adminDashboardService.ts
- investmentAdminService.ts
- targetSavingsService.ts

### Deprecated Migrations
- `001_create_users_pg.sql` - Creates wrong table name, now deprecated

### Verification
After running the migration, test with:
```bash
npm start
```

The 406 errors should be resolved.

### Rollback (if needed)
```sql
DROP TABLE IF EXISTS user_accounts CASCADE;
```
