# SCROLL TO TOP FIX - REAL ESTATE INVESTMENT

## Issue
When clicking "Real Estate Investment" on the user dashboard, the next screen (Listings page) was scrolling down automatically instead of starting at the top.

## Solution Applied

Added `window.scrollTo(0, 0)` to the useEffect hook in the Listings component to ensure the page scrolls to the top when the component mounts.

### File Modified:
- `src/components_main/Listings.tsx`

### Change Made:
```typescript
useEffect(() => {
  window.scrollTo(0, 0);  // Added this line
  fetchProperties();
}, []);
```

## Additional Pages That Need Same Fix

Due to disk space issues, the following pages still need the same fix applied:

1. **Packages.tsx** - Add scroll to top in useEffect
2. **InvestNow.tsx** - Add scroll to top in useEffect
3. **ListingDetail.tsx** - Add scroll to top in useEffect
4. **Portfolio.tsx** - Add scroll to top in useEffect

### Manual Fix Instructions:

For each file above, add this line at the start of the first useEffect:
```typescript
window.scrollTo(0, 0);
```

Example:
```typescript
useEffect(() => {
  window.scrollTo(0, 0);  // Add this
  // ... rest of code
}, []);
```

## Status
✅ Listings.tsx - FIXED
⚠️ Other investment pages - Need manual fix due to disk space

## Testing
1. Navigate to dashboard
2. Click "Real Estate Investment"
3. Verify page loads at the top (not scrolled down)
