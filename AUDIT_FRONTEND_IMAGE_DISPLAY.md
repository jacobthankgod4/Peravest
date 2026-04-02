# Atomic Audit: Only One Image Displays on Frontend

## Root Cause Found ⚠️ CRITICAL

**Issue**: Multiple images saved to `property_image` table but frontend only displays first image from `property.Images` column.

---

## Problem Analysis

### Issue 1: Frontend Never Queries property_image Table ⚠️ CRITICAL
**Location**: ListingDetail.tsx, Home.tsx, PropertyCard.tsx

**Problem**:
- All components query `property` table only
- `property.Images` column stores only first image URL
- `property_image` table has all images but is NEVER queried
- Frontend has no code to fetch from `property_image` table

**Current Code**:
```typescript
// ListingDetail.tsx line 42
const { data, error } = await supabase
  .from('property')
  .select('*')  // ← Only selects from property table
  .eq('Id', parseInt(id!))
  .single();
```

**Missing**:
```typescript
// Should also query property_image table
.select('*, property_image(*)')
```

---

### Issue 2: mapToPropertyWithInvestment() Only Returns Single Image ⚠️ CRITICAL
**Location**: propertyService.ts, line 47

**Problem**:
```typescript
images: prop.Images ? [prop.Images] : [],
```

**Issue**:
- Only maps `prop.Images` (single URL from property table)
- Doesn't include images from `property_image` table
- Even if property_image queried, this mapping ignores it

---

### Issue 3: getById() Doesn't Join property_image Table ⚠️ CRITICAL
**Location**: propertyService.ts, getById() method

**Current Code**:
```typescript
const { data, error } = await supabase
  .from('property')
  .select('*, investment_package(*)')  // ← Missing property_image
  .eq('Id', parseInt(String(id)))
  .eq('is_deleted', false)
  .single();
```

**Missing**: `.select('*, investment_package(*), property_image(*)')`

---

### Issue 4: getAll() Doesn't Join property_image Table ⚠️ CRITICAL
**Location**: propertyService.ts, getAll() method

**Same issue as getById()** - doesn't query property_image table

---

### Issue 5: ListingDetail Queries Directly, Bypasses Service ⚠️ HIGH
**Location**: ListingDetail.tsx, line 42

**Problem**:
- Doesn't use propertyService.getById()
- Queries Supabase directly
- Misses property_image join
- Inconsistent with rest of app

---

### Issue 6: Home.tsx Queries Directly, Bypasses Service ⚠️ HIGH
**Location**: Home.tsx, line 38

**Same issue** - queries directly, doesn't use propertyService

---

## Data Flow Analysis

### Current Flow (BROKEN):
```
1. Upload: Multiple images → property_image table ✓
2. Query: property table only (no join) ✗
3. Map: property.Images (single URL) → images array ✗
4. Display: Only first image shown ✗
```

### Correct Flow (FIXED):
```
1. Upload: Multiple images → property_image table ✓
2. Query: property + property_image join ✓
3. Map: property_image rows → images array ✓
4. Display: All images in carousel ✓
```

---

## Files Requiring Fixes

### 1. propertyService.ts
**Lines to fix**: 47, 195, 217

**Changes**:
- Add property_image join to getById()
- Add property_image join to getAll()
- Update mapToPropertyWithInvestment() to use property_image data

### 2. ListingDetail.tsx
**Lines to fix**: 42-50

**Changes**:
- Use propertyService.getById() instead of direct query
- OR add property_image join to direct query

### 3. Home.tsx
**Lines to fix**: 38-45

**Changes**:
- Use propertyService.getAll() instead of direct query
- OR add property_image join to direct query

---

## Solution Priority

### CRITICAL (Must Fix):
1. Add property_image join to propertyService.getById()
2. Add property_image join to propertyService.getAll()
3. Update mapToPropertyWithInvestment() to map property_image data
4. Update ListingDetail to use propertyService or add join
5. Update Home to use propertyService or add join

---

## Verdict

**Root Cause**: Frontend never queries property_image table where all images are stored

**Severity**: CRITICAL - Multiple image feature non-functional on display side

**Fix Complexity**: LOW - Add joins and update mapping

**Estimated Time**: 10 minutes

