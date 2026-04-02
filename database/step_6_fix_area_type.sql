-- Step 6: Fix Area data type
ALTER TABLE public.property ALTER COLUMN "Area" TYPE NUMERIC(10,2) USING CAST(COALESCE(NULLIF(regexp_replace("Area", '[^0-9.]', '', 'g'), ''), '0') AS NUMERIC);
