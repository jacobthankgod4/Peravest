# PeraVest Multi-Asset Platform Implementation
## Industry-Standard Atomic Roadmap (Non-Destructive)

---

## IMPLEMENTATION PHILOSOPHY

**Core Principles:**
1. **Zero Downtime:** Platform remains operational throughout
2. **Backward Compatible:** Existing properties/investors unaffected
3. **Incremental Rollout:** Test each phase before proceeding
4. **Rollback Ready:** Can revert at any phase
5. **Data Integrity:** No data loss, all migrations reversible

---

## PHASE 0: PRE-IMPLEMENTATION (Week 0)

### Objectives:
- Backup current system
- Set up staging environment
- Document current state

### Tasks:

#### 0.1 Database Backup
```bash
# Full database backup
pg_dump peravest_db > backup_pre_multiasset_$(date +%Y%m%d).sql

# Verify backup
pg_restore --list backup_pre_multiasset_*.sql
```

#### 0.2 Create Staging Environment
- Clone production database to staging
- Deploy current codebase to staging
- Test all existing functionality

#### 0.3 Documentation Audit
- [ ] Document all current API endpoints
- [ ] Document database schema
- [ ] List all dependent services
- [ ] Map user flows (investor + admin)

**Success Criteria:**
✅ Complete backup created
✅ Staging environment mirrors production
✅ All documentation complete

**Rollback Plan:** N/A (no changes made)

---

## PHASE 1: DATABASE FOUNDATION (Week 1)

### Objectives:
- Add Asset_Type column
- Add agriculture fields
- Maintain 100% backward compatibility

### Migration 1.1: Add Asset Type Column

**File:** `database/035_add_asset_type.sql`

```sql
-- Migration: Add Asset Type support
-- Rollback: 035_rollback_asset_type.sql

BEGIN;

-- Add Asset_Type column with default
ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS "Asset_Type" VARCHAR(50) DEFAULT 'Real Estate';

-- Update all existing records
UPDATE public.property 
SET "Asset_Type" = 'Real Estate' 
WHERE "Asset_Type" IS NULL;

-- Add NOT NULL constraint after data migration
ALTER TABLE public.property 
ALTER COLUMN "Asset_Type" SET NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_property_asset_type 
ON public.property("Asset_Type");

COMMIT;
```

**Rollback File:** `database/035_rollback_asset_type.sql`
```sql
BEGIN;
DROP INDEX IF EXISTS idx_property_asset_type;
ALTER TABLE public.property DROP COLUMN IF EXISTS "Asset_Type";
COMMIT;
```

### Migration 1.2: Add Agriculture Fields

**File:** `database/036_add_agriculture_fields.sql`

```sql
BEGIN;

-- Agriculture-specific fields (all nullable for backward compatibility)
ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS "Farm_Size_Hectares" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "Crop_Type" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "Harvest_Cycle_Months" INTEGER,
ADD COLUMN IF NOT EXISTS "Expected_Yield" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "Farming_Method" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "Soil_Type" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "Water_Source" VARCHAR(200),
ADD COLUMN IF NOT EXISTS "Farm_Equipment" TEXT,
ADD COLUMN IF NOT EXISTS "Insurance_Status" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "Farm_Manager" VARCHAR(200);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_property_crop_type 
ON public.property("Crop_Type");

CREATE INDEX IF NOT EXISTS idx_property_farming_method 
ON public.property("Farming_Method");

COMMIT;
```

**Rollback File:** `database/036_rollback_agriculture_fields.sql`
```sql
BEGIN;
DROP INDEX IF EXISTS idx_property_crop_type;
DROP INDEX IF EXISTS idx_property_farming_method;
ALTER TABLE public.property 
DROP COLUMN IF EXISTS "Farm_Size_Hectares",
DROP COLUMN IF EXISTS "Crop_Type",
DROP COLUMN IF EXISTS "Harvest_Cycle_Months",
DROP COLUMN IF EXISTS "Expected_Yield",
DROP COLUMN IF EXISTS "Farming_Method",
DROP COLUMN IF EXISTS "Soil_Type",
DROP COLUMN IF EXISTS "Water_Source",
DROP COLUMN IF EXISTS "Farm_Equipment",
DROP COLUMN IF EXISTS "Insurance_Status",
DROP COLUMN IF EXISTS "Farm_Manager";
COMMIT;
```

### Testing Phase 1:

```bash
# Run on staging
psql staging_db < database/035_add_asset_type.sql
psql staging_db < database/036_add_agriculture_fields.sql

# Verify
psql staging_db -c "\d property"

# Test existing queries still work
psql staging_db -c "SELECT * FROM property WHERE \"Asset_Type\" = 'Real Estate';"

# Test rollback
psql staging_db < database/036_rollback_agriculture_fields.sql
psql staging_db < database/035_rollback_asset_type.sql
```

**Success Criteria:**
✅ Migrations run without errors
✅ All existing properties have Asset_Type = 'Real Estate'
✅ Existing queries return same results
✅ Rollback scripts work correctly

**Rollback Plan:** Run rollback scripts in reverse order

---

## PHASE 2: BACKEND SERVICES (Week 2)

### Objectives:
- Update TypeScript interfaces
- Extend propertyService for agriculture
- Maintain API backward compatibility

### Task 2.1: Update Property Interface

**File:** `src/services/propertyService.ts`

**Changes:**
```typescript
export interface Property {
  // Existing fields
  Id?: number;
  Title: string;
  Type: string;
  Address: string;
  City: string;
  State: string;
  LGA?: string;
  Zip_Code: string;
  Images: string;
  Video: string;
  Description: string;
  Price: number;
  Area: number;
  Bedroom: number;
  Bathroom: number;
  Built_Year: number;
  Amenities: string;
  Status: string;
  User_Id?: number;
  created_at?: string;
  updated_at?: string;
  
  // NEW: Asset Type
  Asset_Type: 'Real Estate' | 'Agriculture';
  
  // NEW: Agriculture fields (all optional)
  Farm_Size_Hectares?: number;
  Crop_Type?: string;
  Harvest_Cycle_Months?: number;
  Expected_Yield?: string;
  Farming_Method?: 'Organic' | 'Conventional' | 'Hydroponic';
  Soil_Type?: string;
  Water_Source?: string;
  Farm_Equipment?: string;
  Insurance_Status?: string;
  Farm_Manager?: string;
}
```

### Task 2.2: Update Create Function

**Add to propertyService.create():**

```typescript
const insertData: Property = {
  // ... existing fields ...
  
  // NEW: Asset Type (default to Real Estate)
  Asset_Type: String(property.Asset_Type || 'Real Estate').trim(),
  
  // NEW: Agriculture fields (only if Asset_Type is Agriculture)
  ...(property.Asset_Type === 'Agriculture' && {
    Farm_Size_Hectares: property.Farm_Size_Hectares ? parseFloat(String(property.Farm_Size_Hectares)) : null,
    Crop_Type: String(property.Crop_Type || '').trim() || null,
    Harvest_Cycle_Months: property.Harvest_Cycle_Months ? parseInt(String(property.Harvest_Cycle_Months)) : null,
    Expected_Yield: String(property.Expected_Yield || '').trim() || null,
    Farming_Method: String(property.Farming_Method || '').trim() || null,
    Soil_Type: String(property.Soil_Type || '').trim() || null,
    Water_Source: String(property.Water_Source || '').trim() || null,
    Farm_Equipment: String(property.Farm_Equipment || '').trim() || null,
    Insurance_Status: String(property.Insurance_Status || '').trim() || null,
    Farm_Manager: String(property.Farm_Manager || '').trim() || null,
  })
};
```

### Task 2.3: Update Update Function

**Add to propertyService.update():**

```typescript
// NEW: Handle Asset_Type
if (property.Asset_Type) updateData.Asset_Type = property.Asset_Type;

// NEW: Handle Agriculture fields
if (property.Asset_Type === 'Agriculture') {
  if (property.Farm_Size_Hectares !== undefined) 
    updateData.Farm_Size_Hectares = parseFloat(String(property.Farm_Size_Hectares));
  if (property.Crop_Type) updateData.Crop_Type = property.Crop_Type;
  if (property.Harvest_Cycle_Months !== undefined) 
    updateData.Harvest_Cycle_Months = parseInt(String(property.Harvest_Cycle_Months));
  if (property.Expected_Yield) updateData.Expected_Yield = property.Expected_Yield;
  if (property.Farming_Method) updateData.Farming_Method = property.Farming_Method;
  if (property.Soil_Type) updateData.Soil_Type = property.Soil_Type;
  if (property.Water_Source) updateData.Water_Source = property.Water_Source;
  if (property.Farm_Equipment) updateData.Farm_Equipment = property.Farm_Equipment;
  if (property.Insurance_Status) updateData.Insurance_Status = property.Insurance_Status;
  if (property.Farm_Manager) updateData.Farm_Manager = property.Farm_Manager;
}
```

### Testing Phase 2:

```typescript
// Test 1: Create Real Estate (existing flow)
const realEstate = await propertyService.create({
  Title: "Test Property",
  Asset_Type: "Real Estate",
  // ... other fields
});
// Should work exactly as before

// Test 2: Create Agriculture (new flow)
const agriculture = await propertyService.create({
  Title: "Test Farm",
  Asset_Type: "Agriculture",
  Farm_Size_Hectares: 50,
  Crop_Type: "Rice",
  // ... other fields
});
// Should save agriculture fields

// Test 3: Backward compatibility
const legacy = await propertyService.create({
  Title: "Legacy Property",
  // No Asset_Type specified
  // ... other fields
});
// Should default to Real Estate
```

**Success Criteria:**
✅ Existing real estate creation works unchanged
✅ New agriculture creation saves all fields
✅ API responses include new fields
✅ No breaking changes to existing endpoints

**Rollback Plan:** Revert code changes, database remains compatible

---

## PHASE 3: FRONTEND COMPONENTS (Week 3)

### Objectives:
- Create InvestmentTypeSelector
- Create AgricultureFields component
- Update AddProperty page with conditional rendering

### Task 3.1: Create Investment Type Selector

**File:** `src/components/InvestmentTypeSelector.tsx` (NEW)

### Task 3.2: Create Agriculture Fields Component

**File:** `src/components/AgricultureFields.tsx` (NEW)

### Task 3.3: Update AddProperty Page

**File:** `src/pages/AddProperty.tsx`

**Changes:**
1. Add state for assetType
2. Import InvestmentTypeSelector
3. Import AgricultureFields
4. Add conditional rendering

### Task 3.4: Update EditProperty Page

**File:** `src/pages/EditProperty.tsx`

**Changes:**
1. Load Asset_Type from database
2. Show appropriate fields based on type
3. Handle agriculture field updates

### Testing Phase 3:

**Manual Testing Checklist:**
- [ ] Can select Real Estate type (default)
- [ ] Can select Agriculture type
- [ ] Real Estate fields show/hide correctly
- [ ] Agriculture fields show/hide correctly
- [ ] Form validation works for both types
- [ ] Can create Real Estate investment
- [ ] Can create Agriculture investment
- [ ] Can edit existing Real Estate
- [ ] Can edit and convert to Agriculture
- [ ] Mobile responsive on both types

**Success Criteria:**
✅ Type selector works smoothly
✅ Conditional fields render correctly
✅ No console errors
✅ Form submission works for both types

**Rollback Plan:** Revert frontend code, backend/database unaffected

---

## PHASE 4: LISTING PAGES (Week 4)

### Objectives:
- Update listing cards to show asset type
- Create agriculture-specific detail page sections
- Add filtering by asset type

### Task 4.1: Update Listing Cards

**File:** `src/components/PropertyCard.tsx`

**Changes:**
- Add asset type badge
- Show appropriate metrics (bedrooms vs hectares)
- Different icons for different types

### Task 4.2: Update Detail Page

**File:** `src/pages/ListingDetail.tsx`

**Changes:**
- Detect asset type
- Show Real Estate specs OR Agriculture specs
- Different document requirements

### Task 4.3: Add Filters

**File:** `src/pages/Listings.tsx`

**Changes:**
- Add "Asset Type" filter dropdown
- Filter results by type
- Show count per type

### Testing Phase 4:

- [ ] Real Estate listings display correctly
- [ ] Agriculture listings display correctly
- [ ] Mixed listings show both types
- [ ] Filters work correctly
- [ ] Detail pages show correct fields
- [ ] Investor can browse both types

**Success Criteria:**
✅ Listings show asset type clearly
✅ Filters work correctly
✅ Detail pages adapt to type
✅ No confusion between types

**Rollback Plan:** Revert frontend, existing listings still work

---

## PHASE 5: ADMIN DASHBOARD (Week 5)

### Objectives:
- Add asset type indicators
- Update admin table with type column
- Add type-based analytics

### Task 5.1: Update Admin Property Table

**File:** `src/pages/admin/AdminPropertyManagement.tsx`

**Changes:**
- Add "Type" column with icons
- Filter by asset type
- Show type-specific metrics

### Task 5.2: Update Analytics

**File:** `src/pages/admin/AdminDashboard.tsx`

**Changes:**
- Show breakdown by asset type
- Total value per type
- Count per type

### Testing Phase 5:

- [ ] Admin can see asset types
- [ ] Can filter by type
- [ ] Analytics show correct breakdown
- [ ] Can create both types from admin

**Success Criteria:**
✅ Admin dashboard shows types
✅ Analytics accurate
✅ Easy to manage both types

**Rollback Plan:** Revert admin UI, core functionality intact

---

## PHASE 6: PRODUCTION DEPLOYMENT (Week 6)

### Pre-Deployment Checklist:

#### Database:
- [ ] Backup production database
- [ ] Test migrations on staging
- [ ] Verify rollback scripts work
- [ ] Schedule maintenance window (optional)

#### Code:
- [ ] All tests passing
- [ ] Code review complete
- [ ] No console errors
- [ ] Performance tested

#### Documentation:
- [ ] Update API documentation
- [ ] Create admin guide
- [ ] Create investor FAQ
- [ ] Update help center

### Deployment Steps:

**Step 1: Database Migration (5 minutes)**
```bash
# Connect to production
psql production_db

# Run migrations
\i database/035_add_asset_type.sql
\i database/036_add_agriculture_fields.sql

# Verify
SELECT "Asset_Type", COUNT(*) FROM property GROUP BY "Asset_Type";
```

**Step 2: Deploy Backend (10 minutes)**
```bash
# Deploy updated services
npm run build
pm2 restart peravest-api

# Verify
curl https://api.peravest.com/health
```

**Step 3: Deploy Frontend (10 minutes)**
```bash
# Build and deploy
npm run build
# Upload to hosting

# Verify
curl https://peravest.com
```

**Step 4: Smoke Tests (15 minutes)**
- [ ] Can view existing properties
- [ ] Can create new real estate
- [ ] Can create new agriculture
- [ ] Can invest in existing properties
- [ ] Admin dashboard loads
- [ ] No errors in logs

### Post-Deployment Monitoring:

**First Hour:**
- Monitor error logs
- Check database performance
- Watch user activity
- Be ready to rollback

**First Day:**
- Monitor user feedback
- Track new agriculture listings
- Check conversion rates
- Fix any minor issues

**First Week:**
- Analyze usage patterns
- Gather user feedback
- Plan improvements
- Document lessons learned

---

## ROLLBACK PROCEDURES

### If Issues Detected in Phase 1-2:
```bash
# Rollback database
psql production_db < database/036_rollback_agriculture_fields.sql
psql production_db < database/035_rollback_asset_type.sql

# Verify
\d property
```

### If Issues Detected in Phase 3-5:
```bash
# Revert code deployment
git revert <commit-hash>
npm run build
pm2 restart peravest-api

# Database remains (no harm)
```

### If Issues Detected Post-Production:
1. Assess severity
2. If critical: Full rollback
3. If minor: Hot fix
4. Document incident

---

## SUCCESS METRICS

### Week 1-2 (Foundation):
- ✅ Zero downtime
- ✅ All existing properties intact
- ✅ Database performance unchanged

### Week 3-4 (Features):
- ✅ Can create agriculture investments
- ✅ Both types display correctly
- ✅ No user complaints

### Week 5-6 (Launch):
- 🎯 5 agriculture investments created
- 🎯 50+ investors view agriculture
- 🎯 10+ investments in agriculture
- 🎯 Zero critical bugs

### Month 1-3 (Growth):
- 🎯 20% of new investments are agriculture
- 🎯 30% of users diversified across types
- 🎯 ₦50M in agriculture investments

---

## RISK MITIGATION

### Technical Risks:

**Risk:** Database migration fails
**Mitigation:** Test on staging, have rollback ready
**Impact:** Low (can rollback immediately)

**Risk:** Performance degradation
**Mitigation:** Index new columns, monitor queries
**Impact:** Low (minimal new columns)

**Risk:** Data corruption
**Mitigation:** Full backup before migration
**Impact:** Very Low (additive changes only)

### Business Risks:

**Risk:** Users confused by new types
**Mitigation:** Clear UI, help text, tutorials
**Impact:** Medium (can clarify with updates)

**Risk:** Low agriculture adoption
**Mitigation:** Start with pilot farms, marketing
**Impact:** Low (real estate continues)

**Risk:** Regulatory issues
**Mitigation:** Consult legal, proper disclosures
**Impact:** Medium (can pause agriculture)

---

## TIMELINE SUMMARY

| Phase | Duration | Risk | Can Rollback |
|-------|----------|------|--------------|
| 0: Pre-Implementation | 3 days | None | N/A |
| 1: Database | 5 days | Low | Yes |
| 2: Backend | 5 days | Low | Yes |
| 3: Frontend | 7 days | Medium | Yes |
| 4: Listings | 5 days | Low | Yes |
| 5: Admin | 5 days | Low | Yes |
| 6: Production | 3 days | Medium | Yes |
| **TOTAL** | **33 days** | **Low** | **Yes** |

---

## CONCLUSION

This atomic roadmap ensures:

✅ **Non-Destructive:** No existing data or functionality affected
✅ **Incremental:** Each phase independently testable
✅ **Reversible:** Can rollback at any point
✅ **Low Risk:** Backward compatible throughout
✅ **Production Ready:** Industry-standard practices

**Next Action:** Review roadmap → Approve → Begin Phase 0
