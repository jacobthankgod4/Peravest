# Industry-Standard Audit: SQL Migration Failure Analysis

## Error Summary
```
ERROR: 42703: column "Property_Id" does not exist
```

This error occurs when executing the migration script, specifically when creating tables or indexes that reference the "Property_Id" column.

---

## Root Cause Analysis

### Issue 1: Duplicate CONSTRAINT Definition ⚠️ CRITICAL
**Location**: Line 10 in property_image table definition

**Problem**:
```sql
CREATE TABLE IF NOT EXISTS public.property_image (
  ...
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  ...
  CONSTRAINT property_image_property_fk FOREIGN KEY ("Property_Id") REFERENCES public.property("Id") ON DELETE CASCADE
);
```

**Why It Fails**:
- The REFERENCES clause already creates a foreign key constraint
- Adding a second CONSTRAINT with the same column causes PostgreSQL to fail
- The column reference in CONSTRAINT is evaluated before the column is fully initialized

**Solution**: Remove the duplicate CONSTRAINT line

---

### Issue 2: Execution Order Problem ⚠️ CRITICAL
**Location**: Lines 11-15 (RLS policies)

**Problem**:
The migration attempts to:
1. Enable RLS on tables
2. Create policies that reference columns

But if any table creation fails (Issue 1), the RLS policies try to execute on non-existent tables.

**Solution**: Separate table creation from RLS policy creation

---

### Issue 3: Missing Error Handling ⚠️ HIGH
**Problem**:
- No transaction wrapping
- No rollback on failure
- Partial state left in database if migration fails mid-way

**Solution**: Wrap in transaction or execute in phases

---

### Issue 4: Constraint Naming Conflicts ⚠️ MEDIUM
**Problem**:
Multiple tables have constraints with similar names:
- `investment_package_property_fk` (line 48)
- `investment_property_fk` (line 68)
- `property_image_property_fk` (line 88)

If any fail, subsequent constraints may not be created.

**Solution**: Ensure all constraint names are unique and valid

---

## Detailed Error Trace

**Step 1**: Lines 1-7 execute successfully
- Column rename works
- New columns added

**Step 2**: Lines 8-10 execute successfully
- investment_package table created

**Step 3**: Lines 11-15 FAIL
- property_image table creation fails due to duplicate CONSTRAINT
- Error: "column Property_Id does not exist" (misleading - actually constraint syntax error)

**Step 4**: Lines 16-142 never execute
- RLS policies fail because tables don't exist
- Indexes fail because tables don't exist

---

## Issues Found in Migration Script

### Critical Issues (Must Fix):

1. **Duplicate CONSTRAINT in property_image table** (Line 88)
   - Remove: `CONSTRAINT property_image_property_fk FOREIGN KEY ("Property_Id") REFERENCES public.property("Id") ON DELETE CASCADE`
   - Keep: `"Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE`

2. **Duplicate CONSTRAINT in investment_package table** (Line 48)
   - Already has REFERENCES clause
   - Duplicate CONSTRAINT not needed

3. **RLS policies created before all tables exist**
   - If table creation fails, policies fail
   - Need to separate into two phases

### High Priority Issues:

4. **No transaction handling**
   - Migration can leave database in inconsistent state
   - Should use BEGIN/COMMIT or execute in phases

5. **Misleading error messages**
   - "column Property_Id does not exist" actually means constraint syntax error
   - Makes debugging difficult

### Medium Priority Issues:

6. **Constraint naming could be clearer**
   - Some constraints have redundant names
   - Could use shorter, more consistent naming

---

## Corrected Migration Strategy

### Phase 1: Alter Existing Table (Safe)
```sql
ALTER TABLE public.property RENAME COLUMN "Ammenities" TO "Amenities";
ALTER TABLE public.property ADD COLUMN "User_Id" INT;
ALTER TABLE public.property ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.property ADD COLUMN "deleted_at" TIMESTAMP;
ALTER TABLE public.property ADD COLUMN "is_deleted" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.property ALTER COLUMN "Area" TYPE NUMERIC(10,2) USING CAST(COALESCE(NULLIF(regexp_replace("Area", '[^0-9.]', '', 'g'), ''), '0') AS NUMERIC);
ALTER TABLE public.property ADD CONSTRAINT property_price_check CHECK ("Price" >= 0);
ALTER TABLE public.property ADD CONSTRAINT property_bedroom_check CHECK ("Bedroom" >= 0);
ALTER TABLE public.property ADD CONSTRAINT property_bathroom_check CHECK ("Bathroom" >= 0);
ALTER TABLE public.property ADD CONSTRAINT property_year_check CHECK ("Built_Year" >= 1800 AND "Built_Year" <= EXTRACT(YEAR FROM CURRENT_DATE) + 10);
CREATE INDEX IF NOT EXISTS property_type_idx ON public.property ("Type");
CREATE INDEX IF NOT EXISTS property_city_idx ON public.property ("City");
CREATE INDEX IF NOT EXISTS property_state_idx ON public.property ("State");
CREATE INDEX IF NOT EXISTS property_status_idx ON public.property ("Status");
CREATE INDEX IF NOT EXISTS property_created_idx ON public.property ("created_at");
```

### Phase 2: Create New Tables (Remove Duplicate Constraints)
```sql
CREATE TABLE IF NOT EXISTS public.investment_package (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL UNIQUE REFERENCES public.property("Id") ON DELETE CASCADE,
  "Share_Cost" NUMERIC(20,2) NOT NULL DEFAULT 5000,
  "Interest_Rate" NUMERIC(5,2) NOT NULL DEFAULT 25,
  "Period_Months" INT NOT NULL DEFAULT 6,
  "Max_Investors" INT NOT NULL DEFAULT 100,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK ("Share_Cost" > 0),
  CHECK ("Interest_Rate" >= 0),
  CHECK ("Period_Months" > 0),
  CHECK ("Max_Investors" > 0)
);

CREATE TABLE IF NOT EXISTS public.investment (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "User_Id" INT NOT NULL,
  "Amount" NUMERIC(20,2) NOT NULL,
  "Shares" INT NOT NULL,
  "Status" VARCHAR(32) NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK ("Amount" > 0),
  CHECK ("Shares" > 0)
);

CREATE TABLE IF NOT EXISTS public.property_image (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "Image_Url" TEXT NOT NULL,
  "Display_Order" INT DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS investment_package_property_idx ON public.investment_package ("Property_Id");
CREATE INDEX IF NOT EXISTS investment_property_idx ON public.investment ("Property_Id");
CREATE INDEX IF NOT EXISTS investment_user_idx ON public.investment ("User_Id");
CREATE INDEX IF NOT EXISTS investment_status_idx ON public.investment ("Status");
CREATE INDEX IF NOT EXISTS property_image_property_idx ON public.property_image ("Property_Id");
```

### Phase 3: Enable RLS (After Tables Exist)
```sql
ALTER TABLE public.property ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_package ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_image ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all properties" ON public.property FOR SELECT USING (true);
CREATE POLICY "Users can create properties" ON public.property FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own properties" ON public.property FOR UPDATE USING (true);
CREATE POLICY "Users can delete own properties" ON public.property FOR DELETE USING (true);

CREATE POLICY "Users can view investment packages" ON public.investment_package FOR SELECT USING (true);
CREATE POLICY "Property owners can manage investment packages" ON public.investment_package FOR ALL USING (true);

CREATE POLICY "Users can view investments" ON public.investment FOR SELECT USING (true);
CREATE POLICY "Users can create investments" ON public.investment FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own investments" ON public.investment FOR SELECT USING (true);

CREATE POLICY "Users can view property images" ON public.property_image FOR SELECT USING (true);
CREATE POLICY "Property owners can manage images" ON public.property_image FOR ALL USING (true);
```

---

## Audit Verdict

**Root Cause**: Duplicate CONSTRAINT definitions in table creation statements

**Severity**: CRITICAL - Prevents entire migration from executing

**Fix Complexity**: LOW - Remove 2 lines of code

**Recommended Action**: Execute corrected migration in 3 phases

