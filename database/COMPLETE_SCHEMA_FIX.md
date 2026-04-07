## Complete Database Schema Fix - Executive Summary

### Issues Found and Fixed

#### Issue 1: user_profiles Table Schema Mismatch ✅
**Problem**: INTEGER user_id vs UUID from Supabase Auth
**Solution**: `099_DEFINITIVE_user_profiles_schema.sql`
**Status**: FIXED

#### Issue 2: user_accounts Table Missing ✅
**Problem**: Services query `user_accounts` but migration creates `users`
**Solution**: `100_create_user_accounts_table.sql`
**Status**: FIXED

---

## Complete Migration Sequence

Run these migrations in order:

```bash
# 1. Create user_accounts table (used by all services)
psql -U <username> -d <database> -f database/100_create_user_accounts_table.sql

# 2. Create user_profiles table (Supabase Auth integration)
psql -U <username> -d <database> -f database/099_DEFINITIVE_user_profiles_schema.sql

# 3. Create KYC submissions table
psql -U <username> -d <database> -f database/KYC_MIGRATION_NO_FK.sql

# 4. Add referral code column
psql -U <username> -d <database> -f database/037_add_referral_code.sql
```

---

## Schema Overview

### user_accounts (Main Users Table)
```
Id (INT, PRIMARY KEY, AUTO INCREMENT)
Email (VARCHAR, UNIQUE)
Name (VARCHAR)
User_Type (VARCHAR, default: 'user')
Password (VARCHAR)
status (VARCHAR, default: 'active')
age, gender, bank, Account (optional fields)
created_at (TIMESTAMP)
```

### user_profiles (Extended Profile Data)
```
id (UUID, PRIMARY KEY)
user_id (UUID, UNIQUE) - Links to Supabase Auth
kyc_status (VARCHAR, default: 'pending')
referral_code (VARCHAR, UNIQUE)
date_of_birth, address, city, state, country
occupation, annual_income
investment_experience, risk_tolerance
kyc_documents (JSON)
created_at, updated_at (TIMESTAMP)
```

### kyc_submissions (KYC Document Tracking)
```
id (SERIAL, PRIMARY KEY)
user_id (INTEGER)
first_name, last_name
date_of_birth, phone_number
address, city, state
bvn, nin, id_type, id_number
id_document_url, proof_of_address_url, selfie_url
status (VARCHAR, default: 'pending')
created_at, updated_at (TIMESTAMP)
```

---

## Deprecated Migrations (Do NOT Run)

These migrations have been superseded and should NOT be executed:
- `001_create_users_pg.sql` → Use `100_create_user_accounts_table.sql`
- `007_create_users_profile_pg.sql` → Use `099_DEFINITIVE_user_profiles_schema.sql`
- `016_create_user_profiles_pg.sql` → Use `099_DEFINITIVE_user_profiles_schema.sql`
- `040_fix_user_profiles_rls.sql` → Included in `099_DEFINITIVE_user_profiles_schema.sql`
- `041_fix_user_profiles_id_sequence.sql` → Included in `099_DEFINITIVE_user_profiles_schema.sql`
- `042_remove_user_profiles_fk.sql` → Not needed in definitive schema
- `043_recreate_user_profiles.sql` → Replaced by `099_DEFINITIVE_user_profiles_schema.sql`

---

## Services Compatibility

### ✅ Compatible Services (No Changes Needed)
- referralService.ts - Uses UUID user.id correctly
- kycVerificationService.ts - Uses UUID user.id correctly
- All 30+ services using user_accounts - Will work with new table

---

## Error Resolution

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request (user_profiles) | UUID vs INTEGER mismatch | Run `099_DEFINITIVE_user_profiles_schema.sql` |
| 406 Not Acceptable (user_accounts) | Table doesn't exist | Run `100_create_user_accounts_table.sql` |
| 42703 Column not found | Missing referral_code | Run `037_add_referral_code.sql` |
| 23503 Foreign key violation | UUID not in users table | Remove FK (done in definitive schema) |

---

## Verification Checklist

After running all migrations:

```sql
-- Check user_accounts table
\d user_accounts
-- Should show: Id, Email, Name, User_Type, status, created_at

-- Check user_profiles table
\d user_profiles
-- Should show: id (UUID), user_id (UUID), kyc_status, referral_code

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('user_accounts', 'user_profiles');
-- Should show 4 policies per table (insert, select, update, delete)

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename IN ('user_accounts', 'user_profiles');
-- Should show all expected indexes
```

---

## Next Steps

1. **Backup existing data** (if any):
   ```sql
   CREATE TABLE user_accounts_backup AS SELECT * FROM user_accounts;
   CREATE TABLE user_profiles_backup AS SELECT * FROM user_profiles;
   ```

2. **Run migrations** in order (see Complete Migration Sequence above)

3. **Verify schema** using Verification Checklist

4. **Test application**:
   ```bash
   npm start
   ```

5. **Monitor browser console** for any remaining errors

---

## Documentation Files

- `SCHEMA_FIX_GUIDE.md` - Detailed user_profiles fix
- `USER_ACCOUNTS_FIX_GUIDE.md` - Detailed user_accounts fix
- `SCHEMA_FIX_SUMMARY.md` - user_profiles changes summary
- `099_DEFINITIVE_user_profiles_schema.sql` - Definitive user_profiles schema
- `100_create_user_accounts_table.sql` - user_accounts table creation
