# Phase 17: CSS Values Reference Guide
**Quick Lookup for Testing & Verification**

---

## 🎨 COLOR PALETTE

### Primary Colors
| Name | Hex Value | RGB | Usage |
|------|-----------|-----|-------|
| Primary Dark | #0e2e50 | rgb(14, 46, 80) | Headings, text, backgrounds |
| Accent Green | #09c398 | rgb(9, 195, 152) | Links, buttons, hover states, badges |
| Dark Green (Hover) | #08b189 | rgb(8, 177, 137) | Button hover, darker accent |
| Footer Dark | #00122d | rgb(0, 18, 45) | Footer background |

### Neutral Colors
| Name | Hex Value | RGB | Usage |
|------|-----------|-----|-------|
| White | #fff | rgb(255, 255, 255) | Backgrounds, text on dark |
| Light Gray | #f5f5f5 | rgb(245, 245, 245) | Light backgrounds, subtle |
| Medium Gray | #e0e0e0 | rgb(224, 224, 224) | Borders, dividers |
| Gray | #999 | rgb(153, 153, 153) | Secondary text |
| Dark Gray | #666 | rgb(102, 102, 102) | Body text |
| Very Dark | #333 | rgb(51, 51, 51) | Dark text, labels |
| Muted | #6c757d | rgb(108, 117, 125) | Muted text |

### Status Colors
| Name | Hex Value | Usage |
|------|-----------|-------|
| Success | #28a745 | Success states, valid inputs |
| Danger | #dc3545 | Error states, warnings |
| Warning | #ffc107 | Warning states |
| Info | #17a2b8 | Information states |

---

## 🔤 TYPOGRAPHY

### Font Families
| Element | Font | Weights | Size Desktop | Size Mobile |
|---------|------|---------|--------------|-------------|
| **Headings (H1-H6)** | K2D | 300, 400, 700, 800 | 28-48px | 18-32px |
| **Body Text** | Roboto | 100, 300, 400, 500, 700, 900 | 14-16px | 14px |
| **Code/Mono** | Courier New | 400 | 13px | 12px |

### Heading Sizes
| Heading | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| H1 | 48px | 36px | 28px |
| H2 | 36px | 28px | 24px |
| H3 | 28px | 24px | 20px |
| H4 | 24px | 20px | 18px |
| H5 | 20px | 18px | 16px |
| H6 | 16px | 14px | 14px |

### Body Text Sizes
| Type | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body Normal | 14-16px | 400 | 1.6 |
| Body Muted | 13-14px | 400 | 1.5 |
| Small | 12px | 400 | 1.4 |
| Label | 14px | 600 | 1.4 |
| Navigation | 16px | 500 | 1 |

### Font Weight Scale
| Class | Weight | CSS Value |
|-------|--------|-----------|
| Light | 300 | font-weight: 300 |
| Normal | 400 | font-weight: 400 |
| Medium | 500 | font-weight: 500 |
| Semi-Bold | 600 | font-weight: 600 |
| Bold | 700 | font-weight: 700 |

---

## 📦 SPACING & SIZING

### Border Radius
| Type | Value | Usage |
|------|-------|-------|
| Small | 4px | Badges, small elements |
| Default | 6px | Buttons, icons |
| Medium | 8px | Secondary elements |
| Large | 12px | Cards, modals, inputs |
| Extra Large | 20px | Large sections |
| Full | 50% | Circles, pills |
| Pill | 500px | Fully rounded pills |

### Shadow System
| Type | Value | Usage |
|------|-------|-------|
| Subtle | 0 0 40px 5px rgba(0,0,0,0.05) | Cards (normal) |
| Medium | 0 5px 20px rgba(0,0,0,0.1) | Dropdowns |
| Strong | 0 10px 60px rgba(0,0,0,0.3) | Modals |
| Hover | 0 0 50px 10px rgba(0,0,0,0.1) | Cards (hover) |
| Inset | inset 0 0 10px rgba(0,0,0,0.05) | Indented areas |

### Button Padding
| Type | Padding | Height |
|------|---------|--------|
| Small | 8px 16px | 32px |
| Default | 12px 24px | 40px |
| Large | 14px 40px | 48px |
| Block | 0 (full width) | 48px+ |

### Input Fields
| Property | Value | Note |
|----------|-------|------|
| Height | 48px | Touch-friendly minimum |
| Padding | 15px 18px | Generous internal space |
| Border Radius | 12px | IMPORTANT: 12px not 6px |
| Border Width | 1px | Single pixel |
| Font Size | 16px | Prevents zoom on iOS |
| Border Color | #e0e0e0 | Light gray |
| Focus Border | #09c398 | Green when active |
| Focus Shadow | 0 0 0 3px rgba(9,195,152,0.1) | Light glow |

### Spacing Scale (Margins/Padding)
| Utility | Value | Usage |
|---------|-------|-------|
| pt-10 | 10px | Padding top |
| pt-20 | 20px | Padding top |
| pt-40 | 40px | Padding top |
| pt-60 | 60px | Padding top |
| pt-80 | 80px | Padding top |
| pt-100 | 100px | Padding top |
| pt-120 | 120px | Padding top |
| mb-20 | 20px | Margin bottom |
| gap-20 | 20px | Grid/flex gap |

---

## 🎯 COMPONENT SPECIFICATIONS

### Header/Navbar
| Property | Value | Note |
|----------|-------|------|
| Top Bar Height | 45px | Including padding |
| Top Bar Background | #0e2e50 | Dark blue |
| Navbar Height | 70-80px | Including logo |
| Hamburger Show | ≤768px | Mobile breakpoint |
| Fixed Position | Yes | Sticky on scroll |
| Z-index | 1000+ | Above other content |
| Icon Circle Diameter | 45px | Header icons |
| Icon Circle Color | #09c398 | Green background |

### Hero Section
| Property | Value | Note |
|----------|-------|------|
| Min Height (Desktop) | 500px | Full viewport-ish |
| Min Height (Tablet) | 350px | Reduced |
| Min Height (Mobile) | 300px | Compact |
| Overlay Color | rgba(14, 46, 80, 0.5) | Dark overlay |
| Background Attachment | fixed | Parallax effect |
| Text Color | #fff | White text |
| Button Margin | 0 10px | Between buttons |

### Property Cards
| Property | Value | Note |
|----------|-------|------|
| Border Radius | 12px | Rounded corners |
| Card Shadow | 0 0 40px 5px rgba(0,0,0,0.05) | Subtle shadow |
| Hover Shadow | 0 0 50px 10px rgba(0,0,0,0.1) | Increased on hover |
| Hover Lift | translateY(-5px) | 5px up |
| Image Height | 250-300px | Consistent aspect ratio |
| Image Zoom | scale(1.2) | 1.2x on hover |
| Zoom Duration | 0.3s ease | Smooth animation |
| Badge Position | Top-right | Over image |
| Badge Padding | 8-10px | Comfortable button size |
| Price Color | #09c398 | GREEN (IMPORTANT) |

### Footer
| Property | Value | Note |
|----------|-------|------|
| Background | #00122d | Very dark blue |
| Widget Columns | 4 (desktop), 2 (768px), 1 (480px) | Responsive |
| Widget Title Color | #fff | White |
| Widget Title Font Weight | 600-700 | Bold |
| Title Underline Color | #09c398 | Green accent |
| Title Underline Height | 3px | Visible bar |
| Link Color | #ddd | Light gray |
| Link Hover | #09c398 | Green on hover |
| Padding | 60px 0 20px | Top/bottom emphasis |

### Forms
| Property | Value | Note |
|----------|-------|------|
| Input Border Radius | 12px | MUST BE 12px |
| Input Height | 48px | Touch-friendly |
| Input Padding | 15px 18px | Generous interior |
| Input Font Size | 16px | Prevents zoom |
| Input Border Color | #e0e0e0 | Gray border |
| Focus Border | #09c398 | Green focus |
| Focus Shadow | 0 0 0 3px rgba(9,195,152,0.1) | Light glow effect |
| Textarea Min Height | 120px | Visible text area |
| Label Font Weight | 500-600 | Semi-bold |
| Button Background | #09c398 | Green |
| Button Hover | #08b189 | Darker green |
| Button Text Color | #fff | White text |

---

## ⚡ ANIMATION & TRANSITION VALUES

### Standard Transitions
| Property | Value | Usage |
|----------|-------|-------|
| Standard | all 0.3s ease | Default transition |
| Fast | all 0.15s ease | Quick feedback |
| Slow | all 0.5s ease | Smooth animations |

### Button Ripple Effect
| Property | Value | Note |
|----------|-------|-------|
| Initial Scale | scale(0) | Starts invisible |
| Final Scale | scale(1) | Grows to full size |
| Duration | 0.5s | Medium speed |
| Timing | cubic-bezier(.25,.46,.45,.94) | Custom easing |
| Color | #08b189 | Semi-transparent green |
| Diameter | 400px | Large ripple coverage |

### Scroll Behavior
| Property | Value | Usage |
|----------|-------|-------|
| Smooth Scroll | scroll-behavior: smooth | All internal links |
| Duration | ~500-1000ms | Implicit |

### Menu Animation
| Property | Value | Note |
|----------|-------|-------|
| Slide Direction | From right | Mobile menu |
| Slide Duration | 0.3s ease | Moderate speed |
| Drawer Width | 280px | Standard mobile |
| Z-index | 9999 | Above all content |

### Preloader Animation
| Property | Value | Note |
|----------|-------|-------|
| Rotation | 360deg continuous | Full spin |
| Duration | ~2s per rotation | Not too fast |
| Z-index | 9999 | Above all content |
| Position | fixed, centered | Full screen overlay |

---

## 📱 RESPONSIVE BREAKPOINTS

### Standard Breakpoints
| Breakpoint | Width | Breakpoint | Width |
|------------|-------|-----------|-------|
| **Small Mobile** | ≤480px | **Mobile** | ≤768px |
| **Tablet** | 768px-991px | **Large Tablet** | 992px-1199px |
| **Desktop** | ≥1200px | | |

### Touch Target Sizes
| Min Size (Horizontal) | 48px | Thumb-friendly |
| Min Size (Vertical) | 48px | WCAG guideline |
| Min Size (Icon) | 45px | Circular buttons |
| **Recommended** | **56px+** | Comfort margin |

### Mobile Font Sizes
| Element | Size | Note |
|---------|------|------|
| Body | 14-16px | Readable without zoom |
| Small | 12px | Minimum readable |
| Large | 18px | Comfortable reading |
| Button | 16px | Touch-friendly |
| Input | 16px | Prevents zoom |

---

## ✅ TESTING CHECKLIST - QUICK REFERENCE

### Colors to Verify
- [ ] Primary text: #0e2e50
- [ ] Links: #09c398
- [ ] Buttons: #09c398 with #08b189 hover
- [ ] Footer background: #00122d
- [ ] Input borders: #e0e0e0
- [ ] Input focus: #09c398

### Sizes to Verify
- [ ] H1: 48px (desktop)
- [ ] Body text: 14-16px
- [ ] Input fields: 48px height
- [ ] Input border-radius: 12px
- [ ] Icon circles: 45px diameter
- [ ] Cards: 12px radius

### Animations to Verify
- [ ] Button ripple: Yes, visible
- [ ] Card lift: -5px translateY
- [ ] Image zoom: 1.2x scale
- [ ] Menu slide: From right, 280px width
- [ ] Smooth scroll: Active

### Mobile to Verify
- [ ] Hamburger shows at 768px
- [ ] Touch targets: 48px minimum
- [ ] Font size: 14-16px body
- [ ] Cards stack: 1 column
- [ ] No horizontal scroll

---

## 🔍 KNOWN CSS PROPERTIES TO CHECK

### Properties That Often Have Issues
```css
/* Check these specific property values */

/* CRITICAL - Often Wrong */
border-radius: 12px; /* NOT 6px, NOT 8px */
padding: 15px 18px; /* For inputs specifically */
font-size: 16px; /* On inputs to prevent zoom */
color: #09c398; /* Price color MUST be green */

/* IMPORTANT - Verify Match */
background: #0e2e50; /* Primary dark - verify exact shade */
color: #00122d; /* Footer dark - very dark blue */
line-height: 1.6; /* Body text readability */
box-shadow: 0 0 40px 5px rgba(0,0,0,0.05); /* Card shadow pattern */
font-family: 'K2D', sans-serif; /* Headings font */

/* COMMON MISTAKES */
/* Don't use: */
border-radius: 6px; /* Use 12px instead */
padding: 10px 15px; /* Too small for inputs */
font-size: 14px; /* On inputs, causes zoom */
color: #1abc9c; /* Use #09c398 instead */
box-shadow: 0 5px 15px rgba(0,0,0,0.2); /* Use lighter shadow */
```

---

## 📸 SCREENSHOT REFERENCE POINTS

When taking screenshots, ensure you capture:
1. **Full Component:** Entire component visible
2. **Hover State:** Component in hover state (if applicable)
3. **Active State:** Component in active/focused state
4. **Mobile View:** Same component at 375px width
5. **Error State:** Validation errors visible (forms)

### Components to Screenshot
1. **Header:** Desktop and Mobile
2. **Hero:** Full hero section
3. **Card Grid:** Multiple cards showing hover
4. **Form:** Filled form with focus state
5. **Footer:** Complete footer
6. **Mobile Navbar:** Hamburger menu open
7. **Animations:** Video or GIF of transitions

---

## 🐛 COMMON CSS ISSUES & FIXES

| Issue | Cause | Fix |
|-------|-------|-----|
| Icon appears black square | Missing font files | Verify `/public/assets/fonts/` |
| Input looks wrong | Wrong border-radius | Change to 12px |
| Cards don't lift | Missing transform | Add `transform: translateY(-5px)` |
| Mobile menu doesn't appear | Wrong breakpoint | Check max-width: 768px |
| Colors don't match | Wrong hex value | Use exact value from reference |
| Text too small | Font size too small | Use 16px minimum on mobile |
| Buttons not clickable | Z-index issue | Increase z-index value |
| Parallax doesn't work | Mobile override | Check `@media (max-width: 768px)` |
| Focus ring missing | Outline removed | Add box-shadow instead |
| Animation jank | Transition on wrong property | Use `transform` not `left/top` |

---

## 📞 VERIFICATION NOTES

**When testing, document:**
- Component name
- Property being tested (e.g., border-radius, color, size)
- PHP value (expected)
- React value (current)
- Match status (Y/N)
- Screenshot reference

**Example Entry:**
```
Component: Input Field
Property: border-radius
PHP Value: 12px
React Value: [measure in DevTools]
Match: [Y/N]
Screenshot: 002_input_field_focus.png
```

