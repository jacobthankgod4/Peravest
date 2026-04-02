-- Check if properties exist
SELECT 
    COUNT(*) as total_properties,
    COUNT(CASE WHEN "Status" = 'active' THEN 1 END) as active_properties,
    COUNT(CASE WHEN is_deleted = false THEN 1 END) as not_deleted_properties
FROM property;

-- Show all properties with their status
SELECT 
    "Id",
    "Title",
    "Status",
    is_deleted,
    created_at
FROM property
ORDER BY created_at DESC
LIMIT 10;

-- If no properties exist, you need to add some
-- If properties exist but Status is not 'active', update them:
-- UPDATE property SET "Status" = 'active' WHERE is_deleted = false;
