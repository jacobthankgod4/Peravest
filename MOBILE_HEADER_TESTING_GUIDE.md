# Mobile Header Testing Guide

## Quick Test Scenarios

### 1. **Basic Functionality** ⚡
```
✓ Hamburger icon appears on mobile (< 992px)
✓ Hamburger icon hidden on desktop (≥ 992px)
✓ Clicking hamburger opens menu from right
✓ Menu slides in smoothly (0.3s transition)
✓ Clicking overlay closes menu
✓ Clicking X button inside menu closes it
✓ Clicking any menu item closes menu and navigates
```

### 2. **Admin vs Regular User** 👥
```
ADMIN USER:
✓ Hamburger menu shows on mobile
✓ Menu contains: Listings, Dashboard, Properties, Users, Logout
✓ All admin links work correctly

REGULAR USER (Not Authenticated):
✓ Menu contains: Home, About, Listings, FAQ, Contact, Login, Sign Up
✓ "Invest Now" button visible at bottom of menu

AUTHENTICATED USER:
✓ Menu contains: Listings, Dashboard, Profile, Logout
✓ "Invest Now" button visible at bottom of menu
```

### 3. **Device Rotation** 🔄
```
✓ Open menu in portrait mode
✓ Rotate to landscape
✓ Menu should close automatically
✓ Hamburger should still work in landscape
✓ Rotate back to portrait
✓ Everything works normally
```

### 4. **Scroll Behavior** 📜
```
✓ Open menu on mobile
✓ Try to scroll page background → Should be locked
✓ Scroll inside menu → Should work smoothly
✓ Close menu
✓ Page scroll should work again
```

### 5. **iOS Safari Specific** 🍎
```
✓ Open menu
✓ Background doesn't scroll (position: fixed works)
✓ Menu scrolls smoothly (-webkit-overflow-scrolling)
✓ Safe area insets respected on notched devices
✓ No bounce effect on background
```

### 6. **Keyboard Navigation** ⌨️
```
✓ Tab through menu items
✓ Focus indicators visible
✓ Press Escape key → Menu closes
✓ Tab order is logical
✓ Enter/Space activates links
```

### 7. **Touch Interactions** 👆
```
✓ Tap menu item → Visual feedback (highlight)
✓ Tap and hold → No weird behavior
✓ Swipe on overlay → Menu closes
✓ Touch targets are at least 44x44px
✓ No accidental double-taps
```

### 8. **Visual States** 👁️
```
✓ Hamburger icon: 3 bars when closed
✓ Hamburger icon: X when open
✓ Menu items have hover effect (desktop)
✓ Menu items have active effect (mobile)
✓ Logo displays correctly (not tiny)
✓ No layout shifts when opening menu
```

### 9. **Responsive Breakpoints** 📱
```
SMALL MOBILE (< 576px):
✓ Menu width: 260px
✓ Logo height: 40px
✓ Font size: 15px

MOBILE (576px - 767px):
✓ Menu width: 280px
✓ Logo height: 45px
✓ Font size: 16px

TABLET (768px - 991px):
✓ Menu width: 320px
✓ Logo height: 48px
✓ Font size: 17px

DESKTOP (≥ 992px):
✓ No hamburger menu
✓ Horizontal navigation
✓ Logo height: 50px
```

### 10. **Accessibility** ♿
```
✓ Screen reader announces "Toggle navigation menu"
✓ aria-expanded changes with menu state
✓ Focus trap works (can't tab outside menu)
✓ High contrast mode works
✓ Reduced motion respected
✓ Color contrast ratio ≥ 4.5:1
```

---

## Browser Testing Matrix

| Browser | Version | Status |
|---------|---------|--------|
| Safari iOS | 14+ | ✅ Test |
| Chrome Android | 90+ | ✅ Test |
| Firefox Mobile | 88+ | ✅ Test |
| Samsung Internet | 14+ | ✅ Test |
| Edge Mobile | 90+ | ✅ Test |

---

## Device Testing Matrix

| Device | Screen Size | Orientation | Status |
|--------|-------------|-------------|--------|
| iPhone SE | 375x667 | Portrait | ✅ Test |
| iPhone SE | 667x375 | Landscape | ✅ Test |
| iPhone 12 | 390x844 | Portrait | ✅ Test |
| iPhone 14 Pro Max | 430x932 | Portrait | ✅ Test |
| Samsung Galaxy S21 | 360x800 | Portrait | ✅ Test |
| iPad Mini | 768x1024 | Portrait | ✅ Test |
| iPad Air | 820x1180 | Portrait | ✅ Test |
| iPad Pro | 1024x1366 | Portrait | ✅ Test |

---

## Performance Checks

```
✓ Menu opens in < 300ms
✓ No janky animations (60fps)
✓ No memory leaks (event listeners cleaned up)
✓ No console errors
✓ No console warnings
✓ Bundle size increase < 5KB
```

---

## Edge Cases to Test

### 1. **Rapid Clicking**
- Click hamburger 10 times rapidly
- Menu should handle gracefully
- No state corruption

### 2. **Window Resize**
- Open menu on mobile
- Resize window to desktop size
- Menu should close automatically
- Resize back to mobile
- Hamburger should reappear

### 3. **Multiple Tabs**
- Open site in 2 tabs
- Open menu in tab 1
- Switch to tab 2
- Menu state should be independent

### 4. **Slow Network**
- Throttle network to 3G
- Open menu
- Should still be responsive
- No loading delays

### 5. **Long Menu Items**
- Test with very long page names
- Text should wrap or truncate
- No horizontal overflow

### 6. **No JavaScript**
- Disable JavaScript
- Menu should show fallback
- Or gracefully degrade

---

## Regression Testing

After any header changes, verify:

```
✓ Listing detail page hamburger works
✓ Home page hamburger works
✓ Dashboard page hamburger works
✓ Admin pages hamburger works
✓ All pages maintain consistent behavior
```

---

## Bug Report Template

```markdown
**Issue**: [Brief description]
**Device**: [e.g., iPhone 12, iOS 15.5]
**Browser**: [e.g., Safari 15.5]
**Screen Size**: [e.g., 390x844]
**Orientation**: [Portrait/Landscape]
**User Type**: [Guest/Authenticated/Admin]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happens]
**Screenshot**: [If applicable]
**Console Errors**: [If any]
```

---

## Sign-Off Checklist

Before marking as complete:

- [ ] All 10 test scenarios pass
- [ ] Tested on at least 3 different devices
- [ ] Tested on at least 2 different browsers
- [ ] No console errors or warnings
- [ ] Accessibility audit passes
- [ ] Performance is acceptable
- [ ] Code review completed
- [ ] Documentation updated

---

**Status**: Ready for QA Testing
**Priority**: High
**Estimated Testing Time**: 2-3 hours
