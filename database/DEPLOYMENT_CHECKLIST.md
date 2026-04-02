# PERAVEST DATABASE DEPLOYMENT CHECKLIST

## PRE-DEPLOYMENT VERIFICATION

### ✅ BACKUP CURRENT DATABASE
- [ ] Create full database backup
- [ ] Export existing data
- [ ] Document current schema version
- [ ] Test backup restoration

### ✅ ENVIRONMENT PREPARATION
- [ ] Verify Supabase connection
- [ ] Check database permissions
- [ ] Ensure sufficient storage space
- [ ] Validate network connectivity

## ATOMIC MIGRATION EXECUTION

### ✅ PHASE 1: SCHEMA CREATION
```sql
-- Execute in Supabase SQL Editor
-- File: database/ATOMIC_MIGRATION.sql
```
- [ ] Run atomic migration script
- [ ] Verify all tables created
- [ ] Check foreign key constraints
- [ ] Validate indexes created
- [ ] Confirm RLS policies applied

### ✅ PHASE 2: DATA POPULATION
```sql
-- Execute in Supabase SQL Editor  
-- File: database/SAMPLE_DATA.sql
```
- [ ] Insert sample data
- [ ] Verify data integrity
- [ ] Test foreign key relationships
- [ ] Validate constraints

### ✅ PHASE 3: VERIFICATION
```bash
# Run verification script
node check-supabase.js
```
- [ ] All tables exist
- [ ] Sample data populated
- [ ] Relationships working
- [ ] RLS policies active

## POST-DEPLOYMENT TESTING

### ✅ FUNCTIONAL TESTING
- [ ] User registration flow
- [ ] Property investment process
- [ ] Ajo savings functionality
- [ ] Target savings operations
- [ ] Withdrawal requests
- [ ] Notification system
- [ ] Audit logging

### ✅ SECURITY TESTING
- [ ] RLS policies enforced
- [ ] User data isolation
- [ ] Admin access controls
- [ ] Session management
- [ ] Data encryption

### ✅ PERFORMANCE TESTING
- [ ] Query performance
- [ ] Index effectiveness
- [ ] Connection pooling
- [ ] Response times

## ROLLBACK PLAN

### ✅ IF MIGRATION FAILS
1. Stop application
2. Restore from backup
3. Investigate issues
4. Fix migration script
5. Retry deployment

### ✅ MONITORING
- [ ] Set up database monitoring
- [ ] Configure alerts
- [ ] Monitor query performance
- [ ] Track error rates

## COMPLETION CHECKLIST

- [ ] All 16 missing tables created
- [ ] Foreign key relationships established
- [ ] Indexes optimized for performance
- [ ] RLS policies implemented
- [ ] Sample data inserted
- [ ] Application tested end-to-end
- [ ] Documentation updated
- [ ] Team notified of completion

## FILES TO EXECUTE IN ORDER

1. `database/ATOMIC_MIGRATION.sql` - Complete schema
2. `database/SAMPLE_DATA.sql` - Test data
3. `node check-supabase.js` - Verification

## ESTIMATED EXECUTION TIME
- Schema Creation: 5-10 minutes
- Data Population: 2-3 minutes
- Verification: 1-2 minutes
- **Total: 8-15 minutes**