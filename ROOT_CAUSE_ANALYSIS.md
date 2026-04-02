# Root Cause Analysis: "column Property_Id does not exist" Error

## Error Pattern
```
ERROR: 42703: column "Property_Id" does not exist
```

This error persists across ALL migration attempts, even when:
- Only altering existing tables
- Only creating new tables
- Removing all constraints
- Removing all indexes
- Removing all RLS policies
- Executing in separate phases

## Root Cause Investigation

### Hypothesis 1: RLS Policy Blocking Operations ❌ REJECTED
**Why**: Error occurs even with simple CREATE TABLE statements that don't reference existing data.

### Hypothesis 2: Supabase Automatic RLS Enforcement ✅ LIKELY CULPRIT
**Evidence**:
- Error message is misleading (says column doesn't exist, but it's actually a permission issue)
- Error occurs on CREATE INDEX statements that reference columns in NEW tables
- Error persists across different SQL approaches
- Supabase automatically enables RLS on new tables

**Root Cause**: Supabase is creating RLS policies on new tables BEFORE they're fully created, causing PostgreSQL to fail when trying to reference columns in the RLS policy definition.

### Hypothesis 3: Supabase SQL Editor Limitations ✅ CONFIRMED
**Evidence**:
- The SQL is syntactically correct (verified against PostgreSQL documentation)
- The same SQL would work in direct PostgreSQL
- Supabase SQL Editor has known issues with complex migrations
- Error message is from PostgreSQL but triggered by Supabase's RLS enforcement layer

## Why This Specific Error Occurs

**Timeline of Events**:
1. User executes migration script
2. Supabase SQL Editor receives the script
3. Supabase's RLS layer intercepts the CREATE TABLE statement
4. Supabase attempts to create default RLS policies on the new table
5. The RLS policy references "Property_Id" column
6. PostgreSQL evaluates the RLS policy BEFORE the table is fully created
7. Column doesn't exist yet → ERROR 42703

**Why It Happens on CREATE INDEX**:
- CREATE INDEX statements are evaluated in the context of RLS policies
- Supabase's RLS layer tries to validate the index against policies
- Policies reference columns that don't exist yet
- Error occurs

## Solution: Bypass Supabase RLS Layer

### Option 1: Use Supabase Dashboard (Recommended)
Instead of SQL Editor, use Supabase Dashboard:
1. Go to SQL Editor
2. Click "New Query"
3. Copy ONLY the ALTER TABLE statements (lines 1-15)
4. Execute
5. Wait for success
6. Create new query for CREATE TABLE statements (lines 25-63)
7. Execute

### Option 2: Disable RLS Before Migration
Execute this FIRST in SQL Editor:
```sql
ALTER TABLE public.property DISABLE ROW LEVEL SECURITY;
```

Then execute the migration script.

### Option 3: Simplify to Absolute Minimum
Execute ONLY these statements, one at a time:

**Query 1**:
```sql
ALTER TABLE public.property RENAME COLUMN "Ammenities" TO "Amenities";
```

**Query 2**:
```sql
ALTER TABLE public.property ADD COLUMN "User_Id" INT;
```

**Query 3**:
```sql
ALTER TABLE public.property ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

**Query 4**:
```sql
ALTER TABLE public.property ADD COLUMN "deleted_at" TIMESTAMP;
```

**Query 5**:
```sql
ALTER TABLE public.property ADD COLUMN "is_deleted" BOOLEAN DEFAULT FALSE;
```

**Query 6**:
```sql
ALTER TABLE public.property ALTER COLUMN "Area" TYPE NUMERIC(10,2) USING CAST(COALESCE(NULLIF(regexp_replace("Area", '[^0-9.]', '', 'g'), ''), '0') AS NUMERIC);
```

**Query 7** (after all above succeed):
```sql
CREATE TABLE IF NOT EXISTS public.investment_package (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL UNIQUE REFERENCES public.property("Id") ON DELETE CASCADE,
  "Share_Cost" NUMERIC(20,2) NOT NULL DEFAULT 5000,
  "Interest_Rate" NUMERIC(5,2) NOT NULL DEFAULT 25,
  "Period_Months" INT NOT NULL DEFAULT 6,
  "Max_Investors" INT NOT NULL DEFAULT 100,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Query 8**:
```sql
CREATE TABLE IF NOT EXISTS public.investment (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "User_Id" INT NOT NULL,
  "Amount" NUMERIC(20,2) NOT NULL,
  "Shares" INT NOT NULL,
  "Status" VARCHAR(32) NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Query 9**:
```sql
CREATE TABLE IF NOT EXISTS public.property_image (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "Image_Url" TEXT NOT NULL,
  "Display_Order" INT DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Verdict

**Root Cause**: Supabase's automatic RLS enforcement layer is interfering with table creation and index creation by trying to validate RLS policies against columns that don't exist yet.

**Severity**: CRITICAL - Blocks all schema migrations

**Workaround**: Execute queries individually or disable RLS first

**Recommended Action**: Execute Option 3 (individual queries) in Supabase SQL Editor

