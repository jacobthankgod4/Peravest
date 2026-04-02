# PeraVest Multi-Asset Deployment Checklist

## PHASE 0: PRE-IMPLEMENTATION ✓

### Database Backup
- [ ] Create full database backup
  ```bash
  pg_dump -h <host> -U <user> -d peravest_db > backup_pre_multiasset_$(date +%Y%m%d).sql
  ```
- [ ] Verify backup file exists and has data
  ```bash
  ls -lh backup_pre_multiasset_*.sql
  ```
- [ ] Store backup in secure location (cloud storage + local)

### Staging Environment
- [ ] Clone production database to staging
- [ ] Deploy current codebase to staging
- [ ] Test all existing functionality on staging
- [ ] Verify staging matches production

### Documentation
- [ ] Document current database schema
- [ ] List all API endpoints
- [ ] Map user flows (investor + admin)
- [ ] Note any custom configurations

---

## PHASE 1: DATABASE FOUNDATION

### Pre-Migration Checks
- [ ] Confirm backup is complete
- [ ] Verify database connection
- [ ] Check current table structure
  ```sql
  \d property
  ```
- [ ] Count existing properties
  ```sql
  SELECT COUNT(*) FROM property;
  ```

### Migration 1: Add Asset_Type Column

**File:** `database/035_add_asset_type.sql`

- [ ] Review migration script
- [ ] Test on staging first
  ```bash
  psql staging_db < database/035_add_asset_type.sql
  ```
- [ ] Verify on staging
  ```sql
  SELECT "Asset_Type", COUNT(*) FROM property GROUP BY "Asset_Type";
  ```
- [ ] Test rollback on staging
  ```bash
  psql staging_db < database/035_rollback_asset_type.sql
  ```
- [ ] Re-run migration on staging (after rollback test)
- [ ] Run on production
  ```bash
  psql production_db < database/035_add_asset_type.sql
  ```
- [ ] Verify on production
  ```sql
  SELECT "Asset_Type", COUNT(*) FROM property GROUP BY "Asset_Type";
  -- Should show all properties as 'Real Estate'
  ```

### Migration 2: Add Agriculture Fields

**File:** `database/036_add_agriculture_fields.sql`

- [ ] Review migration script
- [ ] Test on staging
  ```bash
  psql staging_db < database/036_add_agriculture_fields.sql
  ```
- [ ] Verify columns added
  ```sql
  SELECT column_name, data_type, is_nullable 
  FROM information_schema.columns 
  WHERE table_name = 'property' 
  AND (column_name LIKE '%Farm%' OR column_name LIKE '%Crop%');
  ```
- [ ] Test rollback on staging
  ```bash
  psql staging_db < database/036_rollback_agriculture_fields.sql
  ```
- [ ] Re-run migration on staging
- [ ] Run on production
  ```bash
  psql production_db < database/036_add_agriculture_fields.sql
  ```
- [ ] Verify on production

### Post-Migration Verification

- [ ] Check table structure
  ```sql
  \d property
  ```
- [ ] Verify indexes created
  ```sql
  \di idx_property_asset_type
  \di idx_property_crop_type
  \di idx_property_farming_method
  ```
- [ ] Test existing queries still work
  ```sql
  SELECT * FROM property WHERE "Status" = 'active' LIMIT 5;
  ```
- [ ] Check database performance (no degradation)
- [ ] Verify all existing properties intact
  ```sql
  SELECT COUNT(*) FROM property WHERE "Asset_Type" = 'Real Estate';
  ```

---

## PHASE 1 SUCCESS CRITERIA

✅ All migrations completed without errors
✅ All existing properties have Asset_Type = 'Real Estate'
✅ New agriculture columns exist and are nullable
✅ Indexes created successfully
✅ Existing queries return same results
✅ No data loss
✅ Rollback scripts tested and working

---

## ROLLBACK PROCEDURE (If Needed)

### If issues detected during Phase 1:

```bash
# Step 1: Rollback agriculture fields
psql production_db < database/036_rollback_agriculture_fields.sql

# Step 2: Rollback asset type
psql production_db < database/035_rollback_asset_type.sql

# Step 3: Verify rollback
psql production_db -c "\d property"

# Step 4: Restore from backup if needed
psql production_db < backup_pre_multiasset_YYYYMMDD.sql
```

---

## NEXT STEPS

After Phase 1 completion:
1. ✅ Mark Phase 1 as complete
2. → Proceed to Phase 2: Backend Services
3. → Update TypeScript interfaces
4. → Extend propertyService

---

## NOTES

**Date Started:** _______________
**Completed By:** _______________
**Issues Encountered:** _______________
**Resolution:** _______________
