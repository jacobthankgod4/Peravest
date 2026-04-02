# PeraVest Agricultural Investment Package
## Expert UI/UX Plan with Database Integration

---

## EXECUTIVE SUMMARY

Transform the "Add Property" page into "Add Investment" with dynamic forms that adapt based on investment type (Real Estate vs Agriculture). Focus on minimal code changes while maximizing user experience.

---

## 1. DATABASE SCHEMA DESIGN

### Option A: Extend Existing Table (RECOMMENDED - Minimal Disruption)

**Rationale:** Reuse 80% of existing infrastructure, add agriculture-specific fields

```sql
-- Migration: 035_add_agriculture_support.sql

-- Add Asset Type field
ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS "Asset_Type" VARCHAR(50) DEFAULT 'Real Estate';

-- Add Agriculture-specific fields
ALTER TABLE public.property 
ADD COLUMN IF NOT EXISTS "Farm_Size_Hectares" DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS "Crop_Type" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "Harvest_Cycle_Months" INTEGER,
ADD COLUMN IF NOT EXISTS "Expected_Yield" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "Farming_Method" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "Soil_Type" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "Water_Source" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "Farm_Equipment" TEXT,
ADD COLUMN IF NOT EXISTS "Insurance_Status" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "Farm_Manager" VARCHAR(200);

-- Rename table for clarity (optional but recommended)
-- ALTER TABLE public.property RENAME TO investment_opportunity;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_asset_type ON public.property("Asset_Type");
CREATE INDEX IF NOT EXISTS idx_crop_type ON public.property("Crop_Type");

-- Update existing records
UPDATE public.property SET "Asset_Type" = 'Real Estate' WHERE "Asset_Type" IS NULL;
```

**Why This Works:**
- ✅ Existing properties remain intact
- ✅ Minimal code changes in services
- ✅ Real Estate fields (Bedroom, Bathroom) ignored for Agriculture
- ✅ Agriculture fields ignored for Real Estate
- ✅ Both types share: Title, Description, Price, Location, Images, Investment Package

---

## 2. UI/UX FLOW - ADD INVESTMENT PAGE

### Step 1: Investment Type Selection (NEW)

**Position:** Top of form, before all other fields

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│  What type of investment are you creating?                  │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │  🏠 Real Estate      │  │  🌾 Agriculture      │       │
│  │                      │  │                      │       │
│  │  Properties, Land,   │  │  Farms, Crops,       │       │
│  │  Commercial Spaces   │  │  Livestock           │       │
│  │                      │  │                      │       │
│  │  [●] Selected        │  │  [ ] Select          │       │
│  └──────────────────────┘  └──────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

**Interaction:**
- Large clickable cards (not dropdown)
- Visual icons for each type
- Selected state clearly visible
- Default: Real Estate (backward compatible)

---

### Step 2: Common Fields (BOTH TYPES)

**Always Visible Regardless of Type:**

```
┌─────────────────────────────────────────────────────────────┐
│  Basic Information                                          │
├─────────────────────────────────────────────────────────────┤
│  Title *                                                    │
│  [_________________________________________________]        │
│                                                              │
│  Description *                                              │
│  [_________________________________________________]        │
│  [_________________________________________________]        │
│  [_________________________________________________]        │
│                                                              │
│  Total Investment Value (₦) *                               │
│  [_________________________________________________]        │
│                                                              │
│  Location Details                                           │
│  Address: [_______________________________________]         │
│  City: [______________] State: [______________]            │
│  LGA: [______________]  Zip: [______________]              │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 3A: Real Estate Specific Fields

**Shown ONLY when Asset_Type = "Real Estate"**

```
┌─────────────────────────────────────────────────────────────┐
│  Property Details                                           │
├─────────────────────────────────────────────────────────────┤
│  Property Type                                              │
│  [Residential ▼]                                            │
│                                                              │
│  Bedrooms: [___]  Bathrooms: [___]                         │
│  Area (Sq Ft): [_______]  Built Year: [_______]           │
│                                                              │
│  Amenities                                                  │
│  [Select amenities with icons...]                          │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 3B: Agriculture Specific Fields (NEW)

**Shown ONLY when Asset_Type = "Agriculture"**

```
┌─────────────────────────────────────────────────────────────┐
│  Farm Details                                               │
├─────────────────────────────────────────────────────────────┤
│  Farm Category *                                            │
│  ○ Crop Farming    ○ Livestock    ○ Aquaculture           │
│  ○ Plantation      ○ Mixed Farming                         │
│                                                              │
│  Farm Size (Hectares) *                                     │
│  [_______] hectares                                         │
│                                                              │
│  Primary Crop/Product *                                     │
│  [Rice ▼]  (Dropdown: Rice, Maize, Cassava, Tomatoes,     │
│             Poultry, Fish, Palm Oil, Cocoa, etc.)          │
│                                                              │
│  Harvest/Production Cycle *                                 │
│  [___] months per cycle                                     │
│                                                              │
│  Expected Yield per Cycle                                   │
│  [_______] tons/kg/units                                    │
│                                                              │
│  Farming Method                                             │
│  ○ Organic    ○ Conventional    ○ Hydroponic               │
│                                                              │
│  Soil Type                                                  │
│  [Loamy ▼] (Sandy, Clay, Loamy, Silt)                     │
│                                                              │
│  Water Source                                               │
│  ☑ Borehole  ☑ River  ☐ Rain-fed  ☐ Irrigation System     │
│                                                              │
│  Farm Equipment Included                                    │
│  [_________________________________________________]        │
│  [_________________________________________________]        │
│  (e.g., Tractors, Harvesters, Storage facilities)          │
│                                                              │
│  Insurance Status                                           │
│  ○ Fully Insured    ○ Partially Insured    ○ Not Insured  │
│                                                              │
│  Farm Manager/Contact                                       │
│  Name: [_______________________________________]            │
│  Phone: [_______________________________________]           │
└─────────────────────────────────────────────────────────────┘
```

**Key UX Decisions:**

1. **Radio Buttons for Categories:** Visual, easy to scan
2. **Contextual Help Text:** "Harvest cycle for rice is typically 4-5 months"
3. **Smart Defaults:** Pre-fill common values based on crop type
4. **Validation:** Farm size must be > 0, Harvest cycle must be realistic
5. **Icons:** 🌾 for crops, 🐄 for livestock, 🐟 for aquaculture

---

### Step 4: Media Upload (BOTH TYPES)

**Adaptive Labels Based on Type:**

**Real Estate:**
```
┌─────────────────────────────────────────────────────────────┐
│  Property Images *                                          │
│  [Drag & drop property photos or click to upload]          │
│                                                              │
│  Property Video (Optional)                                  │
│  [Paste YouTube/Vimeo embed code]                          │
└─────────────────────────────────────────────────────────────┘
```

**Agriculture:**
```
┌─────────────────────────────────────────────────────────────┐
│  Farm Images *                                              │
│  [Drag & drop farm photos or click to upload]              │
│  💡 Include: Farm overview, crops, equipment, facilities    │
│                                                              │
│  Farm Video (Optional)                                      │
│  [Paste YouTube/Vimeo embed code]                          │
│  💡 Show farm tour, farming process, harvest                │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 5: Investment Package (BOTH TYPES)

**Universal - Works for Both:**

```
┌─────────────────────────────────────────────────────────────┐
│  Investment Package Details                                 │
├─────────────────────────────────────────────────────────────┤
│  Share Cost (₦) *                                           │
│  [_______] (Minimum investment per investor)                │
│                                                              │
│  Expected Returns (% per annum) *                           │
│  [_______] %                                                │
│                                                              │
│  Investment Duration (Months) *                             │
│  [___] months                                               │
│                                                              │
│  Maximum Investors                                          │
│  [_______] investors                                        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  💡 Investment Calculator                            │  │
│  │                                                       │  │
│  │  Total Value: ₦10,000,000                           │  │
│  │  Share Cost: ₦50,000                                │  │
│  │  Max Investors: 200                                  │  │
│  │  ────────────────────────────────────────           │  │
│  │  Shares Available: 200 shares                       │  │
│  │  Investor Return (12 months): ₦6,000 per share     │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Smart Features:**
- Auto-calculate shares available
- Show projected returns per share
- Validate: Share Cost × Max Investors ≥ Total Value

---

### Step 6: Documents Upload (BOTH TYPES - Different Requirements)

**Real Estate Documents:**
```
┌─────────────────────────────────────────────────────────────┐
│  Property Documents                                         │
├─────────────────────────────────────────────────────────────┤
│  ☑ Title Deed                    [Upload]  [✓ Uploaded]    │
│  ☑ Valuation Report              [Upload]  [✓ Uploaded]    │
│  ☐ Survey Plan                   [Upload]                  │
│  ☐ Building Permit               [Upload]                  │
│  ☐ Investment Prospectus         [Upload]                  │
└─────────────────────────────────────────────────────────────┘
```

**Agriculture Documents:**
```
┌─────────────────────────────────────────────────────────────┐
│  Farm Documents                                             │
├─────────────────────────────────────────────────────────────┤
│  ☑ Land Title/Lease Agreement    [Upload]  [✓ Uploaded]    │
│  ☑ Farm Business Plan            [Upload]  [✓ Uploaded]    │
│  ☐ Soil Test Report              [Upload]                  │
│  ☐ Insurance Certificate         [Upload]                  │
│  ☐ Farm Registration             [Upload]                  │
│  ☐ Environmental Clearance       [Upload]                  │
│  ☐ Investment Prospectus         [Upload]                  │
└─────────────────────────────────────────────────────────────┘
```

---

### Step 7: Review & Submit

**Side-by-side Preview:**

```
┌─────────────────────────────────────────────────────────────┐
│  Review Your Investment                                     │
├─────────────────────────────────────────────────────────────┤
│  [Preview Card showing how it will appear to investors]     │
│                                                              │
│  ✓ All required fields completed                           │
│  ✓ 5 images uploaded                                       │
│  ✓ 2 documents uploaded                                    │
│                                                              │
│  [Create Investment]  [Save as Draft]  [Cancel]            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. FRONTEND COMPONENT STRUCTURE

### Component Hierarchy:

```
AddInvestment.tsx (Main Component)
├── InvestmentTypeSelector.tsx (NEW)
│   └── TypeCard.tsx
│
├── CommonFields.tsx (Refactored from existing)
│   ├── BasicInfo
│   ├── LocationInfo
│   └── MediaUpload
│
├── RealEstateFields.tsx (Existing, extracted)
│   ├── PropertySpecs
│   └── AmenitySelector
│
├── AgricultureFields.tsx (NEW)
│   ├── FarmCategory
│   ├── FarmSpecs
│   ├── ProductionDetails
│   └── FarmManagement
│
├── InvestmentPackage.tsx (Existing, universal)
│   └── InvestmentCalculator.tsx (NEW)
│
├── DocumentUpload.tsx (Enhanced)
│   └── DocumentTypeSelector (Dynamic based on Asset_Type)
│
└── InvestmentPreview.tsx (NEW)
```

---

## 4. STATE MANAGEMENT

### Form State Structure:

```typescript
interface InvestmentFormData {
  // Common Fields
  assetType: 'Real Estate' | 'Agriculture';
  title: string;
  description: string;
  totalValue: number;
  address: string;
  city: string;
  state: string;
  lga: string;
  zipCode: string;
  images: File[];
  video: string;
  
  // Real Estate Specific (nullable)
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  builtYear?: number;
  amenities?: string[];
  
  // Agriculture Specific (nullable)
  farmCategory?: 'Crop' | 'Livestock' | 'Aquaculture' | 'Plantation' | 'Mixed';
  farmSizeHectares?: number;
  cropType?: string;
  harvestCycleMonths?: number;
  expectedYield?: string;
  farmingMethod?: 'Organic' | 'Conventional' | 'Hydroponic';
  soilType?: string;
  waterSource?: string[];
  farmEquipment?: string;
  insuranceStatus?: string;
  farmManager?: string;
  
  // Investment Package (common)
  shareCost: number;
  interestRate: number;
  periodMonths: number;
  maxInvestors: number;
}
```

---

## 5. VALIDATION RULES

### Real Estate Validation:
```typescript
if (assetType === 'Real Estate') {
  required: ['title', 'propertyType', 'address', 'city', 'state', 'totalValue']
  optional: ['bedrooms', 'bathrooms', 'area', 'builtYear']
  images: minimum 1, maximum 10
  documents: minimum 1 (Title Deed required)
}
```

### Agriculture Validation:
```typescript
if (assetType === 'Agriculture') {
  required: ['title', 'farmCategory', 'farmSizeHectares', 'cropType', 
             'harvestCycleMonths', 'address', 'city', 'state', 'totalValue']
  optional: ['expectedYield', 'farmingMethod', 'soilType']
  images: minimum 3, maximum 15
  documents: minimum 2 (Land Title + Business Plan required)
  
  // Business Logic Validation
  if (farmSizeHectares < 1) error: "Farm size must be at least 1 hectare"
  if (harvestCycleMonths < 1 || > 24) error: "Invalid harvest cycle"
}
```

---

## 6. DATABASE SERVICE LAYER

### Updated propertyService.ts:

```typescript
// Key Changes:

1. Rename: propertyService → investmentService (or keep name for compatibility)

2. Create function checks assetType:
   - If 'Real Estate': Save to Bedroom, Bathroom, Area, etc.
   - If 'Agriculture': Save to Farm_Size_Hectares, Crop_Type, etc.

3. Update function checks assetType:
   - Only update relevant fields based on type

4. GetAll function:
   - Filter by Asset_Type if needed
   - Return appropriate fields based on type

5. GetById function:
   - Return all fields
   - Frontend decides which to display based on Asset_Type
```

---

## 7. INVESTOR-FACING LISTING PAGE

### Agriculture Listing Card (NEW):

```
┌─────────────────────────────────────────────────────────────┐
│  [Farm Image]                                    🌾         │
│                                                              │
│  Rice Farm Investment - Kaduna                              │
│  50 Hectares • 4-Month Cycle • Organic                     │
│                                                              │
│  ₦10,000,000                                                │
│  12% Returns • 12 Months                                    │
│                                                              │
│  ████████░░ 80% Funded                                      │
│  156 Investors • ₦50,000 per share                         │
│                                                              │
│  [View Details]                                             │
└─────────────────────────────────────────────────────────────┘
```

### Agriculture Detail Page:

**Key Sections:**
1. **Farm Overview:** Images, location, size
2. **Production Details:** Crop type, yield, cycle
3. **Farm Specifications:** Soil, water, equipment
4. **Investment Terms:** Share cost, returns, duration
5. **Farm Management:** Manager info, insurance
6. **Documents:** Business plan, land title, soil report
7. **Investment Progress:** Funding status, investor count
8. **Risk Disclosure:** Weather, market, operational risks

**Unique to Agriculture:**
- **Harvest Timeline:** Visual calendar showing planting → harvest → payout
- **Yield Calculator:** "If you invest ₦100,000, your share of harvest = X kg"
- **Farm Updates:** Photo/video updates during growing season
- **Weather Widget:** Current weather at farm location

---

## 8. ADMIN DASHBOARD ENHANCEMENTS

### Investment Overview:

```
┌─────────────────────────────────────────────────────────────┐
│  Investment Portfolio                                       │
├─────────────────────────────────────────────────────────────┤
│  Total Investments: 45                                      │
│                                                              │
│  🏠 Real Estate: 30 (₦450M)                                │
│  🌾 Agriculture: 15 (₦180M)                                │
│                                                              │
│  [Filter: All ▼]  [Add Investment]                         │
└─────────────────────────────────────────────────────────────┘
```

### Investment Table:

```
┌──────────────────────────────────────────────────────────────────┐
│ Type    │ Title              │ Value      │ Status   │ Actions   │
├──────────────────────────────────────────────────────────────────┤
│ 🏠 RE   │ Luxury Apartment   │ ₦15M      │ Active   │ Edit View │
│ 🌾 Agri │ Rice Farm Kaduna   │ ₦10M      │ Active   │ Edit View │
│ 🏠 RE   │ Commercial Plaza   │ ₦50M      │ Funded   │ View      │
│ 🌾 Agri │ Fish Farm Lagos    │ ₦8M       │ Draft    │ Edit      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. IMPLEMENTATION CHECKLIST

### Database (Week 1):
- [ ] Run migration 035_add_agriculture_support.sql
- [ ] Test with sample agriculture data
- [ ] Verify existing properties unaffected

### Backend (Week 1):
- [ ] Update Property interface to include agriculture fields
- [ ] Update create() function to handle both types
- [ ] Update update() function to handle both types
- [ ] Add validation for agriculture-specific fields

### Frontend - Phase 1 (Week 2):
- [ ] Create InvestmentTypeSelector component
- [ ] Extract RealEstateFields from AddProperty
- [ ] Create AgricultureFields component
- [ ] Implement conditional rendering based on assetType
- [ ] Update form validation

### Frontend - Phase 2 (Week 3):
- [ ] Create agriculture listing card design
- [ ] Create agriculture detail page
- [ ] Add agriculture filters to listings page
- [ ] Update admin dashboard with type indicators

### Testing (Week 4):
- [ ] Create 3 test agriculture investments
- [ ] Test full investor flow (browse → invest → track)
- [ ] Test admin flow (create → edit → publish)
- [ ] Mobile responsiveness testing

---

## 10. SAMPLE DATA FOR TESTING

### Agriculture Investment Example 1:

```json
{
  "assetType": "Agriculture",
  "title": "Organic Rice Farm - Kaduna State",
  "description": "50-hectare organic rice farm with modern irrigation...",
  "totalValue": 10000000,
  "address": "Km 45, Kaduna-Zaria Road",
  "city": "Kaduna",
  "state": "Kaduna",
  "lga": "Sabon Gari",
  "farmCategory": "Crop",
  "farmSizeHectares": 50,
  "cropType": "Rice (FARO 44)",
  "harvestCycleMonths": 4,
  "expectedYield": "200 tons per cycle",
  "farmingMethod": "Organic",
  "soilType": "Loamy",
  "waterSource": ["Borehole", "Irrigation System"],
  "farmEquipment": "2 Tractors, 1 Harvester, Storage facility (500 tons)",
  "insuranceStatus": "Fully Insured",
  "farmManager": "Musa Ibrahim - 08012345678",
  "shareCost": 50000,
  "interestRate": 12,
  "periodMonths": 12,
  "maxInvestors": 200
}
```

### Agriculture Investment Example 2:

```json
{
  "assetType": "Agriculture",
  "title": "Catfish Farm - Lagos",
  "description": "Modern aquaculture facility with 20 concrete ponds...",
  "totalValue": 8000000,
  "address": "Ikorodu Industrial Area",
  "city": "Lagos",
  "state": "Lagos",
  "lga": "Ikorodu",
  "farmCategory": "Aquaculture",
  "farmSizeHectares": 2,
  "cropType": "Catfish",
  "harvestCycleMonths": 6,
  "expectedYield": "15 tons per cycle",
  "farmingMethod": "Conventional",
  "waterSource": ["Borehole"],
  "farmEquipment": "20 concrete ponds, Aerators, Feeding systems",
  "insuranceStatus": "Partially Insured",
  "farmManager": "Adebayo Oluwaseun - 08098765432",
  "shareCost": 25000,
  "interestRate": 15,
  "periodMonths": 12,
  "maxInvestors": 320
}
```

---

## 11. RISK MITIGATION

### Agriculture-Specific Risks:

**Weather Risk:**
- Solution: Require insurance for all farms
- Display insurance status prominently
- Partner with agricultural insurance providers

**Market Risk:**
- Solution: Pre-arrange off-takers (buyers)
- Include off-taker agreements in documents
- Show historical price trends for crops

**Operational Risk:**
- Solution: Vet farm managers thoroughly
- Require regular photo/video updates
- Site visits by PeraVest team

**Investor Education:**
- Clear risk disclosure on every agriculture listing
- "Agriculture investments carry higher risk than real estate"
- Recommend diversification across multiple farms

---

## 12. SUCCESS METRICS

### Track Per Asset Type:

**Real Estate:**
- Average time to full funding
- Average investment per investor
- Return on investment (actual vs projected)

**Agriculture:**
- Average time to full funding
- Harvest success rate
- Investor satisfaction scores
- Repeat investment rate

**Platform-Wide:**
- % of investors diversified across both types
- Total value: Real Estate vs Agriculture
- User preference trends

---

## CONCLUSION

This plan provides a complete roadmap for adding agriculture investments to PeraVest with:

✅ **Minimal disruption** to existing real estate functionality
✅ **Scalable database** design for future asset types
✅ **Intuitive UI/UX** with clear differentiation between types
✅ **Comprehensive validation** and risk management
✅ **Investor-friendly** presentation of agriculture opportunities

**Next Step:** Review this plan, then I'll create the atomic implementation with exact code files and changes needed.

---

**Estimated Timeline:** 4 weeks from database migration to production launch
**Estimated Effort:** 1 senior developer + 1 designer
**Risk Level:** Low (backward compatible, incremental rollout possible)
