# CSS Load Order Documentation

**Status:** CRITICAL - Correct load order affects all styling  
**Last Updated:** April 3, 2026

## Load Sequence (MUST BE IN THIS ORDER)

The CSS files in `public/index.html` must load in this exact sequence for proper cascading and override behavior:

### 1. Foundation Framework
```html
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/bootstrap.min.css">
```
**Purpose:** Bootstrap grid system, utilities, and base component styles  
**Size:** ~180KB  
**Priority:** CRITICAL - Must load first

### 2. Icon Fonts
```html
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/all-fontawesome.min.css">
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/flaticon.css">
```
**Purpose:** Font Awesome 6 Pro icons and Flaticon custom icons  
**Files:** `/public/assets/fonts/` (all font files)  
**Size:** Font Awesome ~150KB, Flaticon ~50KB

### 3. Animation Library
```html
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/animate.min.css">
```
**Purpose:** Animate.css library for fade-in, slide, bounce effects  
**Size:** ~80KB  
**Note:** Used with wow.min.js

### 4. Plugin Stylesheets
```html
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/owl.carousel.min.css">
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/nice-select.min.css">
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/magnific-popup.min.css">
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/jquery-ui.min.css">
```

**Owl Carousel:** Property image sliders  
**Nice Select:** Custom dropdown styling  
**Magnific Popup:** Image galleries and lightbox  
**jQuery UI:** Date pickers and range sliders

### 5. Main Brand Stylesheet
```html
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/style.css">
```
**Purpose:** ALL component styles from PHP version (56KB)
- Header and navigation
- Cards and listings
- Buttons and forms
- Modals and popups
- Footer
- All typography
- All animations

**Size:** ~280KB (unminified)  
**Critical:** Contains 95% of visual styling

### 6. Bug Fix & Override Sheets
```html
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/button-icon-fix.css">
<link rel="stylesheet" href="%PUBLIC_URL%/assets/css/breadcrumb-fix.css">
```
**Purpose:** Target specific CSS issues or overrides  
**Load After:** style.css (higher specificity)

### 7. React Custom Styles (HIGHEST PRIORITY)
```html
<!-- In index.css or separate files via import in React -->
```
**Purpose:** React-specific component overrides  
**Location:** `src/index.css` (imported via React)  
**Loads:** After all external CSS in `<head>`

---

## Critical Rules for CSS Load Order

### ✅ DO THIS
1. ✅ Load Bootstrap FIRST (foundation)
2. ✅ Load icon fonts SECOND (needed by style.css)
3. ✅ Load style.css BEFORE component-specific CSS
4. ✅ Load fixes/overrides AFTER style.css
5. ✅ Load React imports LAST (highest priority)

### ❌ DON'T DO THIS
1. ❌ Mix up the load order
2. ❌ Load style.css before icon fonts
3. ❌ Load Bootstrap after other plugins
4. ❌ Add CSS files randomly
5. ❌ Use `!important` excessively (breaks cascade)

---

## In index.html Head Section

```html
<head>
  <!-- ... existing meta tags ... -->
  
  <!-- 1. Foundation Framework -->
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/bootstrap.min.css">
  
  <!-- 2. Icon Fonts -->
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/all-fontawesome.min.css">
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/flaticon.css">
  
  <!-- 3. Animations -->
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/animate.min.css">
  
  <!-- 4. Plugins -->
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/owl.carousel.min.css">
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/nice-select.min.css">
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/magnific-popup.min.css">
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/jquery-ui.min.css">
  
  <!-- 5. Main Brand Styles -->
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/style.css">
  
  <!-- 6. Bug Fixes & Overrides -->
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/button-icon-fix.css">
  <link rel="stylesheet" href="%PUBLIC_URL%/assets/css/breadcrumb-fix.css">
  
  <!-- 7. Google Fonts (can be in index.css) -->
  <link href="https://fonts.googleapis.com/css2?family=K2D:wght@300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&display=swap" rel="stylesheet">
</head>
```

---

## Font Loading

### Font Files Location
```
/public/assets/fonts/
  ├── fa-solid-900.woff2       (Font Awesome Solid)
  ├── fa-solid-900.woff
  ├── fa-solid-900.ttf
  ├── fa-brands-400.woff2      (Font Awesome Brands)
  ├── fa-brands-400.woff
  ├── fa-duotone-900.woff2     (Font Awesome Duotone)
  ├── Flaticon.woff2           (Flaticon)
  ├── Flaticon.woff
  ├── Flaticon.ttf
  └── ... (other font variations)
```

### Font-Face References
All @font-face references in CSS must use proper relative paths:
- In `/public/assets/css/all-fontawesome.min.css`: Points to `../fonts/`
- In `/public/assets/css/flaticon.css`: Points to `../fonts/`

### Google Fonts
K2D and Roboto imported from Google Fonts CDN:
```css
@import url('https://fonts.googleapis.com/css2?family=K2D:wght@300;400;500;600;700;800&family=Roboto:wght@100;300;400;500;700;900&display=swap');
```

---

## CSS File Sizes (Reference)

| File | Size | Purpose |
|------|------|---------|
| bootstrap.min.css | ~180KB | Grid + utilities |
| all-fontawesome.min.css | ~50KB | Icon declarations |
| flaticon.css | ~10KB | Custom icons |
| animate.min.css | ~80KB | Animations |
| owl.carousel.min.css | ~15KB | Carousels |
| nice-select.min.css | ~8KB | Dropdowns |
| magnific-popup.min.css | ~12KB | Lightbox |
| jquery-ui.min.css | ~20KB | Sliders |
| style.css | ~280KB | All component styles |
| button-icon-fix.css | ~2KB | Fixes |
| breadcrumb-fix.css | ~1KB | Fixes |
| **TOTAL** | **~658KB** | **All CSS** |

**Font Files:** ~500KB total

---

## Debugging CSS Load Issues

### Check DevTools
1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Filter by **CSS**
4. Reload page
5. Verify all files load (no 404 errors)
6. Verify load order matches this document

### Common Issues

**Icons showing as squares:**
- Font Awesome CSS not loading
- Font files not found (404 error)
- @font-face path incorrect

**Styles not applying:**
- CSS file didn't load
- CSS loaded in wrong order
- Specificity conflict

**Form styling broken:**
- nice-select.min.css not loading
- Bootstrap CSS not loading

**Carousel broken:**
- owl.carousel.min.css not loading
- owl.carousel.min.js not loading

---

## Testing Checklist

After any CSS changes, verify:

- [ ] All CSS files load (Network tab, no 404s)
- [ ] Icons display (not black squares)
- [ ] Bootstrap grid works (inspect `.container`)
- [ ] Buttons styled correctly
- [ ] Form inputs styled
- [ ] Dropdowns styled (nice-select working)
- [ ] Carousels functional
- [ ] Animations smooth
- [ ] Colors correct (#09c398 accent, #0e2e50 primary)
- [ ] Fonts loading (K2D for headings, Roboto for body)
- [ ] DevTools shows no CSS errors
- [ ] Mobile responsive

---

## Related Files

- [CSS_FIX_ATOMIC_IMPLEMENTATION_PLAN.md](../CSS_FIX_ATOMIC_IMPLEMENTATION_PLAN.md) - Main implementation guide
- [public/index.html](./index.html) - Current HTML with CSS links
- [src/index.css](../src/index.css) - React custom styles
- [src/styles/](../src/styles/) - Additional style files

---

**Version:** 1.0  
**Status:** Active  
**Last Modified:** April 3, 2026
