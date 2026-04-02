# Database Migration Instructions

Execute these SQL files in Supabase SQL Editor **one at a time**, in order. Wait for each to complete successfully before running the next.

## Migration Steps

1. **step_1_rename_column.sql** - Rename "Ammenities" to "Amenities"
2. **step_2_add_user_id.sql** - Add User_Id column
3. **step_3_add_updated_at.sql** - Add updated_at column
4. **step_4_add_deleted_at.sql** - Add deleted_at column
5. **step_5_add_is_deleted.sql** - Add is_deleted column
6. **step_6_fix_area_type.sql** - Convert Area from VARCHAR to NUMERIC
7. **step_7_add_indexes.sql** - Create indexes on property table
8. **step_8_create_investment_package.sql** - Create investment_package table
9. **step_9_create_investment.sql** - Create investment table
10. **step_10_create_property_image.sql** - Create property_image table

## How to Execute

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Click "New Query"
4. Copy contents of step_1_rename_column.sql
5. Click "Run"
6. Wait for success message
7. Repeat steps 3-6 for each subsequent step file

## Expected Results

After all steps complete:
- property table has 4 new columns (User_Id, updated_at, deleted_at, is_deleted)
- property.Area is now NUMERIC type
- property table has 7 new indexes
- 3 new tables created (investment_package, investment, property_image)
- All foreign keys and indexes in place

## Rollback (if needed)

If any step fails, you can safely stop and investigate. The migration is non-destructive and can be resumed from the failed step.

