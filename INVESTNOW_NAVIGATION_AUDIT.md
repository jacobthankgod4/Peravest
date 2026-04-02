# INVESTNOW NAVIGATION ISSUE - ATOMIC AUDIT

## ERROR MESSAGE
```
Investment Not Available
Invalid property selection
```

## ROOT CAUSE ANALYSIS

### Issue 1: URL PARAMETER MISMATCH ❌
**InvestmentPackageSelector.tsx sends:**
```typescript
navigate(`/invest/${id}`, { state: { ... } });
// URL: /invest/27
```

**InvestNow.tsx expects:**
```typescript
const propertyId = searchParams.get('property_id');
// Looking for: /invest-now?property_id=27
```

**Problem:** 
- Route is `/invest/:id` but component reads `?property_id=`
- Component expects `/invest-now` but route is `/invest/:id`
- URL params vs query params mismatch

---

### Issue 2: ROUTE PATH MISMATCH ❌
**App.tsx route:**
```typescript
<Route path="/invest/:id" element={<InvestNow />} />
```

**InvestNow.tsx expects:**
```typescript
// Reads from searchParams (query string)
const propertyId = searchParams.get('property_id');
```

**Problem:** Should use `useParams()` not `useSearchParams()`

---

### Issue 3: MISSING PARAMS EXTRACTION ❌
**InvestNow.tsx:**
```typescript
const [searchParams] = useSearchParams();
const propertyId = searchParams.get('property_id'); // ❌ NULL
const identity = searchParams.get('identity');      // ❌ NULL
const cost = searchParams.get('cost');              // ❌ NULL
```

**Should be:**
```typescript
const { id } = useParams();
const location = useLocation();
const { period, shareCost, interestRate } = location.state || {};
```

---

## FIXES REQUIRED

### Fix 1: Update InvestNow.tsx to use useParams
```typescript
// CHANGE FROM:
const [searchParams] = useSearchParams();
const propertyId = searchParams.get('property_id');

// CHANGE TO:
const { id } = useParams<{ id: string }>();
const location = useLocation();
const { period, shareCost, interestRate } = location.state || {};
```

### Fix 2: Update validation check
```typescript
// CHANGE FROM:
if (!propertyId) {
  setError('Invalid property selection');
  return;
}

// CHANGE TO:
if (!id) {
  setError('Invalid property selection');
  return;
}
```

### Fix 3: Update all propertyId references
```typescript
// Replace all instances of:
propertyId

// With:
id
```

### Fix 4: Use state data for pre-filling
```typescript
// Add after params extraction:
useEffect(() => {
  if (shareCost) {
    setAmount(shareCost.toString());
  }
  if (period) {
    setPeriod(period);
  }
}, [shareCost, period]);
```

---

## COMPLETE FIX IMPLEMENTATION

### Changes to InvestNow.tsx:
1. Import useParams and useLocation
2. Extract id from params
3. Extract state from location
4. Update all propertyId references to id
5. Pre-fill amount and period from state
6. Update redirect URL

---

## TESTING CHECKLIST
- [ ] Click "Invest Now" from ListingDetail
- [ ] Verify URL is /invest/27
- [ ] Verify no error message
- [ ] Verify amount is pre-filled
- [ ] Verify period is pre-selected
- [ ] Verify can proceed to checkout
