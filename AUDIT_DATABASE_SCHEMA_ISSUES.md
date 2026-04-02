# Industry-Standard Database Schema & Property Management Audit

## Executive Summary
Comprehensive audit of the Peravest property management system identified **15 critical issues** across database schema, data persistence, and application logic that prevent proper property creation, storage, and retrieval.

---

## CRITICAL ISSUES FOUND

### 1. **Missing Investment Package Table** ⚠️ CRITICAL
**Issue**: Investment package data (share_cost, interest_rate, period_months, max_investors) is collected in AddProperty form but never saved to database.

**Impact**: 
- Investment data is lost after property creation
- No way to retrieve investment details for properties
- Frontend shows hardcoded values (25% p.a., ₦5,000 share cost)

**Root Cause**: No `investment_package` table exists in database schema

**Fix Required**:
```sql
CREATE TABLE IF NOT EXISTS public.investment_package (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "Share_Cost" NUMERIC(20,2) NOT NULL DEFAULT 5000,
  "Interest_Rate" NUMERIC(5,2) NOT NULL DEFAULT 25,
  "Period_Months" INT NOT NULL DEFAULT 6,
  "Max_Investors" INT NOT NULL DEFAULT 100,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT investment_package_property_fk FOREIGN KEY ("Property_Id") REFERENCES public.property("Id")
);

CREATE INDEX IF NOT EXISTS investment_package_property_idx ON public.investment_package ("Property_Id");
```

---

### 2. **Missing Investment Tracking Table** ⚠️ CRITICAL
**Issue**: No table to track actual investments (investors, amounts raised, funding percentage)

**Impact**:
- Cannot track investor count
- Cannot calculate funding percentage
- Cannot store raised amounts
- Frontend shows fake random data

**Root Cause**: No `investment` or `investor_transaction` table

**Fix Required**:
```sql
CREATE TABLE IF NOT EXISTS public.investment (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "User_Id" INT NOT NULL REFERENCES public.users("Id") ON DELETE CASCADE,
  "Amount" NUMERIC(20,2) NOT NULL,
  "Shares" INT NOT NULL,
  "Status" VARCHAR(32) NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT investment_property_fk FOREIGN KEY ("Property_Id") REFERENCES public.property("Id"),
  CONSTRAINT investment_user_fk FOREIGN KEY ("User_Id") REFERENCES public.users("Id")
);

CREATE INDEX IF NOT EXISTS investment_property_idx ON public.investment ("Property_Id");
CREATE INDEX IF NOT EXISTS investment_user_idx ON public.investment ("User_Id");
```

---

### 3. **Typo in Column Name: "Ammenities"** ⚠️ HIGH
**Issue**: Column is named `Ammenities` (misspelled) instead of `Amenities`

**Impact**:
- Inconsistent with industry standards
- Confusing for developers
- May cause issues with ORM tools
- Hard to search/find in code

**Current**: `"Ammenities" TEXT`
**Should Be**: `"Amenities" TEXT`

**Fix Required**:
```sql
ALTER TABLE public.property RENAME COLUMN "Ammenities" TO "Amenities";
```

---

### 4. **Missing User_Id Foreign Key** ⚠️ CRITICAL
**Issue**: Property table has no reference to the user who created it

**Impact**:
- Cannot track property ownership
- Cannot filter properties by creator
- Cannot implement permission-based access control
- Cannot prevent unauthorized property deletion

**Fix Required**:
```sql
ALTER TABLE public.property ADD COLUMN "User_Id" INT REFERENCES public.users("Id") ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS property_user_idx ON public.property ("User_Id");
```

---

### 5. **Missing Status Tracking for Investments** ⚠️ HIGH
**Issue**: No way to track investment status (pending, active, completed, cancelled)

**Impact**:
- Cannot manage investment lifecycle
- Cannot handle refunds or cancellations
- Cannot track investment history

**Fix Required**: Already exists in investment table schema above

---

### 6. **No Unique Constraint on Property Title** ⚠️ MEDIUM
**Issue**: Multiple properties can have identical titles

**Impact**:
- Confusing for users
- Difficult to identify specific properties
- May violate business logic

**Fix Required**:
```sql
ALTER TABLE public.property ADD CONSTRAINT property_title_unique UNIQUE ("Title");
```

---

### 7. **Missing Validation Constraints** ⚠️ HIGH
**Issue**: Database has no constraints to enforce data quality

**Impact**:
- Invalid data can be inserted (negative prices, invalid years)
- No data integrity at database level
- Application must handle all validation

**Fix Required**:
```sql
ALTER TABLE public.property 
  ADD CONSTRAINT property_price_check CHECK ("Price" >= 0),
  ADD CONSTRAINT property_bedroom_check CHECK ("Bedroom" >= 0),
  ADD CONSTRAINT property_bathroom_check CHECK ("Bathroom" >= 0),
  ADD CONSTRAINT property_year_check CHECK ("Built_Year" >= 1800 AND "Built_Year" <= EXTRACT(YEAR FROM CURRENT_DATE) + 10);
```

---

### 8. **Images Column Stores Single URL, Not Array** ⚠️ MEDIUM
**Issue**: `Images` column is TEXT, but code treats it as single URL

**Impact**:
- Cannot store multiple images per property
- Misleading column name (plural "Images")
- Code maps to array but only stores one URL

**Current**: `"Images" TEXT` (stores single URL)
**Should Be**: Either rename to `"Image"` or create separate `property_images` table

**Fix Required** (Option A - Simple):
```sql
ALTER TABLE public.property RENAME COLUMN "Images" TO "Image";
```

**Fix Required** (Option B - Scalable):
```sql
CREATE TABLE IF NOT EXISTS public.property_image (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "Image_Url" TEXT NOT NULL,
  "Display_Order" INT DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT property_image_property_fk FOREIGN KEY ("Property_Id") REFERENCES public.property("Id")
);

CREATE INDEX IF NOT EXISTS property_image_property_idx ON public.property_image ("Property_Id");
```

---

### 9. **Missing Timestamp for Updates** ⚠️ MEDIUM
**Issue**: Only `created_at` exists, no `updated_at` timestamp

**Impact**:
- Cannot track when properties were last modified
- Cannot sort by recent updates
- Cannot implement audit trails

**Fix Required**:
```sql
ALTER TABLE public.property ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

---

### 10. **No Soft Delete Support** ⚠️ MEDIUM
**Issue**: Properties are permanently deleted, no soft delete option

**Impact**:
- Cannot recover deleted properties
- Cannot maintain audit trail
- Cannot implement "archived" status

**Fix Required**:
```sql
ALTER TABLE public.property ADD COLUMN "deleted_at" TIMESTAMP;
ALTER TABLE public.property ADD COLUMN "is_deleted" BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS property_deleted_idx ON public.property ("is_deleted");
```

---

### 11. **Missing Property Specifications Table** ⚠️ MEDIUM
**Issue**: Property details (bedrooms, bathrooms, area) are stored as simple columns

**Impact**:
- Cannot add new property types with different specifications
- Not scalable for future property types
- Difficult to query by specifications

**Fix Required** (Optional - for scalability):
```sql
CREATE TABLE IF NOT EXISTS public.property_specification (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "Spec_Key" VARCHAR(128) NOT NULL,
  "Spec_Value" VARCHAR(255) NOT NULL,
  CONSTRAINT property_specification_property_fk FOREIGN KEY ("Property_Id") REFERENCES public.property("Id")
);
```

---

### 12. **Missing Video URL Validation** ⚠️ LOW
**Issue**: Video column accepts any text, no validation

**Impact**:
- Invalid URLs can be stored
- No way to validate video platform (YouTube, Vimeo, etc.)

**Fix Required**: Add application-level validation

---

### 13. **No Indexing on Frequently Queried Columns** ⚠️ MEDIUM
**Issue**: Missing indexes on columns used in WHERE clauses

**Impact**:
- Slow queries as data grows
- Poor performance on filtering by Status, Type, City, State

**Fix Required**:
```sql
CREATE INDEX IF NOT EXISTS property_type_idx ON public.property ("Type");
CREATE INDEX IF NOT EXISTS property_city_idx ON public.property ("City");
CREATE INDEX IF NOT EXISTS property_state_idx ON public.property ("State");
CREATE INDEX IF NOT EXISTS property_created_idx ON public.property ("created_at");
```

---

### 14. **Missing Data Type Precision** ⚠️ MEDIUM
**Issue**: Area stored as VARCHAR instead of numeric

**Impact**:
- Cannot perform numeric operations on area
- Cannot sort by area
- Type inconsistency

**Current**: `"Area" VARCHAR(64)`
**Should Be**: `"Area" NUMERIC(10,2)`

**Fix Required**:
```sql
ALTER TABLE public.property ALTER COLUMN "Area" TYPE NUMERIC(10,2) USING CAST("Area" AS NUMERIC);
```

---

### 15. **No RLS (Row Level Security) Policies** ⚠️ CRITICAL
**Issue**: No row-level security to prevent unauthorized access

**Impact**:
- Users can see/edit/delete other users' properties
- No data isolation
- Security vulnerability

**Fix Required**:
```sql
ALTER TABLE public.property ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all properties" ON public.property
  FOR SELECT USING (true);

CREATE POLICY "Users can create properties" ON public.property
  FOR INSERT WITH CHECK (auth.uid()::text = "User_Id"::text);

CREATE POLICY "Users can update own properties" ON public.property
  FOR UPDATE USING ("User_Id" = auth.uid()::int)
  WITH CHECK ("User_Id" = auth.uid()::int);

CREATE POLICY "Users can delete own properties" ON public.property
  FOR DELETE USING ("User_Id" = auth.uid()::int);
```

---

## SUMMARY OF REQUIRED FIXES

### Immediate (Blocking):
1. ✅ Create `investment_package` table
2. ✅ Create `investment` table
3. ✅ Add `User_Id` foreign key to property table
4. ✅ Fix typo: `Ammenities` → `Amenities`
5. ✅ Add RLS policies

### High Priority:
6. ✅ Add validation constraints (price, bedrooms, etc.)
7. ✅ Add missing indexes
8. ✅ Fix Area data type (VARCHAR → NUMERIC)

### Medium Priority:
9. ✅ Add `updated_at` timestamp
10. ✅ Add soft delete support
11. ✅ Rename/restructure Images column

### Low Priority:
12. ✅ Add video URL validation
13. ✅ Create property_specification table (optional)

---

## IMPLEMENTATION ORDER

1. **Phase 1 - Critical Fixes** (Do First):
   - Create investment_package table
   - Create investment table
   - Add User_Id to property table
   - Fix Ammenities typo
   - Add RLS policies

2. **Phase 2 - Data Integrity** (Do Second):
   - Add validation constraints
   - Fix Area data type
   - Add missing indexes

3. **Phase 3 - Enhancements** (Do Third):
   - Add timestamps (updated_at, deleted_at)
   - Add soft delete support
   - Restructure Images column

---

## ESTIMATED IMPACT

- **Data Loss Risk**: HIGH (if not done carefully)
- **Downtime Required**: 5-10 minutes
- **Backward Compatibility**: BREAKING (requires application updates)
- **Testing Required**: CRITICAL (test all CRUD operations)

