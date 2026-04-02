# Hamburger Menu Debugging Checklist

## 🔍 Issue: Hamburger Menu Not Showing

### Step 1: Verify Screen Size
- [ ] Open browser DevTools (F12)
- [ ] Check current screen width
- [ ] Ensure width is < 991px
- [ ] Try resizing to 768px, 576px, 375px

**Command to check:**
```javascript
console.log('Screen width:', window.innerWidth);
```

### Step 2: Check CSS File Loading
- [ ] Open DevTools > Network tab
- [ ] Reload page
- [ ] Look for `header-fix.css`
- [ ] Verify it loads (status 200)
- [ ] Check file size is not 0

**Command to check:**
```javascript
// Check if CSS is loaded
const styles = Array.from(document.styleSheets);
const headerFix = styles.find(s => s.href && s.href.includes('header-fix.css'));
console.log('header-fix.css loaded:', !!headerFix);
```

### Step 3: Inspect Hamburger Button Element
- [ ] Open DevTools > Elements tab
- [ ] Find `.mobile-menu-right` element
- [ ] Check computed styles
- [ ] Verify `display` property

**Command to check:**
```javascript
const mobileMenuRight = document.querySelector('.mobile-menu-right');
console.log('Mobile menu right exists:', !!mobileMenuRight);
if (mobileMenuRight) {
    const styles = window.getComputedStyle(mobileMenuRight);
    console.log('Display:', styles.display);
    console.log('Visibility:', styles.visibility);
    console.log('Opacity:', styles.opacity);
}
```

### Step 4: Check Button Rendering
- [ ] Look for `.navbar-toggler` button
- [ ] Verify it's in the DOM
- [ ] Check if it has click handler

**Command to check:**
```javascript
const toggleBtn = document.querySelector('.navbar-toggler');
console.log('Toggle button exists:', !!toggleBtn);
if (toggleBtn) {
    console.log('Button HTML:', toggleBtn.outerHTML);
    console.log('Button styles:', window.getComputedStyle(toggleBtn).display);
}
```

### Step 5: Verify Icon Font Loading
- [ ] Check Font Awesome is loaded
- [ ] Verify icon classes are correct
- [ ] Look for icon in Elements tab

**Command to check:**
```javascript
const icon = document.querySelector('.navbar-toggler-btn-icon i');
console.log('Icon exists:', !!icon);
if (icon) {
    console.log('Icon classes:', icon.className);
    console.log('Icon computed content:', window.getComputedStyle(icon, ':before').content);
}
```

### Step 6: Check React State
- [ ] Open React DevTools
- [ ] Find Header component
- [ ] Check `isMobileMenuOpen` state
- [ ] Verify state changes on click

**Manual test:**
```javascript
// In browser console
const btn = document.querySelector('.navbar-toggler');
if (btn) {
    btn.click();
    console.log('Button clicked - check if menu opens');
}
```

### Step 7: Check for CSS Conflicts
- [ ] Look for conflicting `display: none`
- [ ] Check z-index stacking
- [ ] Verify no `visibility: hidden`

**Command to check:**
```javascript
const allStyles = document.styleSheets;
let conflicts = [];
for (let sheet of allStyles) {
    try {
        const rules = sheet.cssRules || sheet.rules;
        for (let rule of rules) {
            if (rule.selectorText && rule.selectorText.includes('mobile-menu-right')) {
                conflicts.push({
                    selector: rule.selectorText,
                    display: rule.style.display,
                    file: sheet.href
                });
            }
        }
    } catch (e) {}
}
console.log('CSS conflicts:', conflicts);
```

### Step 8: Check Bootstrap Conflicts
- [ ] Verify Bootstrap version
- [ ] Check if Bootstrap JS is interfering
- [ ] Look for `.collapse` class conflicts

**Command to check:**
```javascript
console.log('Bootstrap loaded:', typeof window.bootstrap !== 'undefined');
const collapseElements = document.querySelectorAll('.collapse');
console.log('Collapse elements:', collapseElements.length);
```

### Step 9: Verify Media Query
- [ ] Open DevTools > Elements
- [ ] Select `.mobile-menu-right`
- [ ] Check "Computed" tab
- [ ] Look for media query matches

**Command to check:**
```javascript
const mediaQuery = window.matchMedia('(max-width: 991px)');
console.log('Mobile media query matches:', mediaQuery.matches);
```

### Step 10: Check Console Errors
- [ ] Open Console tab
- [ ] Look for JavaScript errors
- [ ] Check for React errors
- [ ] Verify no CSS parse errors

## 🔧 Common Issues & Fixes

### Issue 1: Button Not Visible
**Symptoms:** Button element exists but not visible
**Fix:**
```css
@media (max-width: 991px) {
  .mobile-menu-right {
    display: flex !important;
    align-items: center !important;
  }
  
  .navbar-toggler {
    display: block !important;
  }
}
```

### Issue 2: CSS Not Loading
**Symptoms:** header-fix.css returns 404
**Fix:**
- Check file path in import
- Verify file exists in src folder
- Clear browser cache
- Restart dev server

### Issue 3: Bootstrap Overriding Styles
**Symptoms:** Bootstrap classes conflicting
**Fix:**
```css
/* Add higher specificity */
.header .mobile-menu-right {
  display: flex !important;
}
```

### Issue 4: React Not Re-rendering
**Symptoms:** State changes but UI doesn't update
**Fix:**
- Check React DevTools
- Verify useState is imported
- Check component key prop

### Issue 5: Font Awesome Not Loading
**Symptoms:** Icon shows as square or missing
**Fix:**
- Verify Font Awesome CDN/package
- Check icon class names
- Use fallback text

## 🧪 Quick Test Script

Run this in browser console:

```javascript
// Comprehensive hamburger menu test
(function() {
    console.log('=== HAMBURGER MENU DEBUG ===');
    
    // 1. Screen size
    console.log('1. Screen width:', window.innerWidth, 'px');
    console.log('   Should show menu:', window.innerWidth < 991);
    
    // 2. Elements exist
    const menuRight = document.querySelector('.mobile-menu-right');
    const toggleBtn = document.querySelector('.navbar-toggler');
    const icon = document.querySelector('.navbar-toggler-btn-icon i');
    const menuContainer = document.querySelector('.mobile-menu-container');
    
    console.log('2. Elements:');
    console.log('   .mobile-menu-right:', !!menuRight);
    console.log('   .navbar-toggler:', !!toggleBtn);
    console.log('   Icon:', !!icon);
    console.log('   .mobile-menu-container:', !!menuContainer);
    
    // 3. Computed styles
    if (menuRight) {
        const styles = window.getComputedStyle(menuRight);
        console.log('3. .mobile-menu-right styles:');
        console.log('   display:', styles.display);
        console.log('   visibility:', styles.visibility);
        console.log('   opacity:', styles.opacity);
    }
    
    if (toggleBtn) {
        const btnStyles = window.getComputedStyle(toggleBtn);
        console.log('4. .navbar-toggler styles:');
        console.log('   display:', btnStyles.display);
        console.log('   position:', btnStyles.position);
        console.log('   z-index:', btnStyles.zIndex);
    }
    
    // 5. CSS file loaded
    const sheets = Array.from(document.styleSheets);
    const headerFix = sheets.find(s => s.href && s.href.includes('header-fix'));
    console.log('5. header-fix.css loaded:', !!headerFix);
    
    // 6. Media query
    const mq = window.matchMedia('(max-width: 991px)');
    console.log('6. Media query (max-width: 991px) matches:', mq.matches);
    
    // 7. Try clicking
    if (toggleBtn) {
        console.log('7. Attempting to click button...');
        toggleBtn.click();
        setTimeout(() => {
            const isOpen = menuContainer && menuContainer.classList.contains('show');
            console.log('   Menu opened:', isOpen);
        }, 100);
    }
    
    console.log('=== END DEBUG ===');
})();
```

## 📋 Manual Verification Steps

1. **Open test page:**
   - Navigate to `/hamburger-test.html`
   - Resize browser to < 991px
   - Verify hamburger shows and works

2. **Check actual page:**
   - Navigate to `/listings` or `/listings/:id`
   - Resize to mobile width
   - Compare with test page

3. **Inspect differences:**
   - Compare HTML structure
   - Compare CSS classes
   - Compare JavaScript behavior

## 🚨 Emergency Fix

If nothing works, add this inline style temporarily:

```tsx
<div 
  className="mobile-menu-right" 
  style={{
    display: window.innerWidth < 991 ? 'flex' : 'none',
    alignItems: 'center'
  }}
>
  <button 
    className="navbar-toggler"
    style={{
      display: 'block',
      border: 'none',
      background: 'transparent',
      padding: '8px',
      cursor: 'pointer'
    }}
    onClick={toggleMobileMenu}
  >
    <i 
      className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}
      style={{
        fontSize: '24px',
        color: '#0e2e50'
      }}
    />
  </button>
</div>
```

## ✅ Success Criteria

When working correctly, you should see:
- ☰ icon visible on mobile (< 991px)
- Icon clickable
- Menu slides in from right
- Dark overlay appears
- Body scroll locked
- Icon changes to × when open
- Menu closes on link click
- Menu closes on overlay click

## 📞 Next Steps

If still not working:
1. Run the debug script above
2. Copy console output
3. Check which step fails
4. Apply corresponding fix
5. Test again

---

**Last Updated:** 2025
**Status:** Active Debugging
