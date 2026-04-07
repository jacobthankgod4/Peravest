## User Profiles Schema Fix - Complete Guide

### Problem Summary
The application had conflicting schema definitions for the `user_profiles` table:
- Old migrations (016, 007) defined `user_id` as INTEGER
- Supabase Auth provides user IDs as UUID
- Services (referralService, kycVerificationService) expect UUID `user_id`
- This caused 400 Bad Request errors when querying the table

### Root Cause
The schema was designed for a custom user management system with INTEGER IDs, but the application uses Supabase Auth which provides UUID user IDs. The mismatch caused type errors and query failures.

### Solution
Use the definitive schema in `099_DEFINITIVE_user_profiles_schema.sql` which:
- Uses UUID for both `id` and `user_id` columns
- Includes all required columns: `referral_code`, `kyc_status`, etc.
- Has proper RLS policies for Supabase
- Includes all necessary indexes

### Migration Steps

1. **Backup your data** (if you have any existing data):
   ```sql
   CREATE TABLE user_profiles_backup AS SELECT * FROM user_profiles;
   ```

2. **Run the definitive schema migration**:
   ```bash
   psql -U <username> -d <database> -f database/099_DEFINITIVE_user_profiles_schema.sql
   ```

3. **Verify the schema**:
   ```sql
   \d user_profiles
   ```
   
   Expected output should show:
   - `id` column: UUID type with default gen_random_uuid()
   - `user_id` column: UUID type with UNIQUE constraint
   - `referral_code` column: VARCHAR(20) with UNIQUE constraint
   - `kyc_status` column: VARCHAR(20) with CHECK constraint
   - All indexes created
   - RLS enabled with 4 permissive policies

### Deprecated Migrations
The following migrations are now deprecated and should NOT be run:
- `016_create_user_profiles_pg.sql` - Old INTEGER schema
- `007_create_users_profile_pg.sql` - Wrong table name (users_profile)
- `040_fix_user_profiles_rls.sql` - Included in definitive schema
- `041_fix_user_profiles_id_sequence.sql` - Included in definitive schema
- `042_remove_user_profiles_fk.sql` - Not needed in definitive schema
- `043_recreate_user_profiles.sql` - Replaced by definitive schema

### Services Compatibility
Both services are already compatible with the UUID schema:
- `referralService.ts` - Uses `user.id` (UUID) correctly
- `kycVerificationService.ts` - Uses `user.id` (UUID) correctly

### Verification
After running the migration, test with:
```bash
npm start
```

The referral context should no longer show 400 errors when fetching user profiles.

### Rollback (if needed)
If you need to rollback:
```sql
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles_backup AS SELECT * FROM user_profiles_backup;
ALTER TABLE user_profiles_backup RENAME TO user_profiles;
```
