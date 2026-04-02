# Mobile Hamburger Menu - Architecture Diagram

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         Layout                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                      Header                            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Logo  [☰] Hamburger Button (Mobile Only)      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Desktop Menu (> 991px)                         │  │  │
│  │  │  Home | About | Listings | FAQ | Contact        │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Page Content                         │  │
│  │  (ListingDetail, Listings, PackageDetail, etc.)       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Mobile Menu State Flow

```
┌──────────────┐
│ Menu Closed  │
│   State      │
└──────┬───────┘
       │
       │ User clicks hamburger (☰)
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ toggleMobileMenu() called                                 │
│ setIsMobileMenuOpen(true)                                │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ useEffect triggers                                        │
│ document.body.style.overflow = 'hidden'                  │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Menu Opens                                                │
│ - Overlay appears (rgba(0,0,0,0.5))                      │
│ - Menu slides in from right (280px)                      │
│ - Icon changes (☰ → ×)                                   │
│ - Body scroll locked                                      │
└──────┬───────────────────────────────────────────────────┘
       │
       │ User clicks link OR overlay OR close button
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ closeMobileMenu() called                                  │
│ setIsMobileMenuOpen(false)                               │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ useEffect cleanup                                         │
│ document.body.style.overflow = 'unset'                   │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Menu Closed  │
│   State      │
└──────────────┘
```

## CSS Animation Flow

```
Mobile Menu Container
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  Initial State (Closed)                                 │
│  ┌────────────────────────────────────────────┐        │
│  │ position: fixed                             │        │
│  │ right: -100%  ◄── Off screen                │        │
│  │ width: 280px                                │        │
│  │ transition: right 0.3s ease-in-out          │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
│  ▼ .show class added                                    │
│                                                          │
│  Open State                                             │
│  ┌────────────────────────────────────────────┐        │
│  │ position: fixed                             │        │
│  │ right: 0  ◄── Visible on screen             │        │
│  │ width: 280px                                │        │
│  │ transition: right 0.3s ease-in-out          │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Screen Layout (Mobile View)

```
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐ │
│ │  Header                                             │ │
│ │  [Logo]                                      [☰]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                      │ │
│ │  Page Content                                       │ │
│ │  (Scrollable)                                       │ │
│ │                                                      │ │
│ │                                                      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

When Menu Opens:
┌─────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────┐ │
│ │  Header                                             │ │
│ │  [Logo]                                      [×]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────┐ ┌──────────────────────┐  │
│ │                          │ │  Mobile Menu         │  │
│ │  Dark Overlay            │ │  ┌────────────────┐  │  │
│ │  (Click to close)        │ │  │ Home           │  │  │
│ │                          │ │  ├────────────────┤  │  │
│ │  Page Content            │ │  │ About          │  │  │
│ │  (Not scrollable)        │ │  ├────────────────┤  │  │
│ │                          │ │  │ Listings       │  │  │
│ │                          │ │  ├────────────────┤  │  │
│ │                          │ │  │ FAQ            │  │  │
│ │                          │ │  ├────────────────┤  │  │
│ │                          │ │  │ Contact        │  │  │
│ │                          │ │  └────────────────┘  │  │
│ └──────────────────────────┘ └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Z-Index Stacking

```
Layer 10: Close Button (×)
  z-index: 1001
  ▲
  │
Layer 9: Mobile Menu Container
  z-index: 1000
  ▲
  │
Layer 8: Overlay
  z-index: 999
  ▲
  │
Layer 7: Header
  z-index: 100
  ▲
  │
Layer 6: Page Content
  z-index: 1 (default)
```

## File Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                    Page Components                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ ListingDetail│  │  Listings   │  │PackageDetail│    │
│  └──────┬───────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                 │                 │            │
│         └─────────────────┴─────────────────┘            │
│                           │                              │
│                           ▼                              │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Layout Component                    │    │
│  │  ┌───────────────────────────────────────────┐  │    │
│  │  │           Header Component                 │  │    │
│  │  └───────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
│                           │                              │
│         ┌─────────────────┴─────────────────┐            │
│         ▼                                   ▼            │
│  ┌──────────────┐                  ┌──────────────┐     │
│  │header-fix.css│                  │listing-mobile│     │
│  │              │                  │    .css      │     │
│  └──────────────┘                  └──────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

```
Screen Width
    0px          576px         768px         991px        1200px
     │             │             │             │             │
     ├─────────────┼─────────────┼─────────────┼─────────────┤
     │   xs        │     sm      │     md      │     lg      │
     │             │             │             │             │
     │◄────────────┴─────────────┴─────────────┤             │
     │        Hamburger Menu Active            │             │
     │                                         │             │
     │                                         │◄────────────┤
     │                                         │  Desktop    │
     │                                         │   Menu      │
     │                                         │             │
     
Mobile Optimizations:
├─ 0-576px:   Single column, small images, compact spacing
├─ 576-768px: Single column, medium images
├─ 768-991px: Two columns (listings), hamburger menu
└─ 991px+:    Desktop layout, horizontal menu
```

## Event Flow Diagram

```
User Action                React State              DOM Changes
    │                          │                         │
    │ Click Hamburger          │                         │
    ├─────────────────────────►│                         │
    │                          │ isMobileMenuOpen=true   │
    │                          ├────────────────────────►│
    │                          │                         │ Add .show class
    │                          │                         │ Render overlay
    │                          │                         │ Lock body scroll
    │                          │                         │ Change icon
    │                          │                         │
    │ Click Link/Overlay       │                         │
    ├─────────────────────────►│                         │
    │                          │ isMobileMenuOpen=false  │
    │                          ├────────────────────────►│
    │                          │                         │ Remove .show class
    │                          │                         │ Remove overlay
    │                          │                         │ Unlock body scroll
    │                          │                         │ Change icon
    │                          │                         │
```

## CSS Class Relationships

```
.header
  └── .main-navigation
      └── .navbar
          ├── .navbar-brand (Logo)
          ├── .mobile-menu-right (Mobile only)
          │   └── .navbar-toggler
          │       └── .navbar-toggler-btn-icon
          │           └── i.fa-bars / i.fa-times
          │
          └── .navbar-collapse.mobile-menu-container
              ├── .navbar-nav
              │   └── .nav-item
              │       └── .nav-link
              │
              └── .header-nav-right
                  └── .theme-btn (Invest Now)

.mobile-menu-overlay (Rendered conditionally)
```

## Performance Optimization

```
Initial Load
    │
    ├─ Load HTML
    ├─ Load CSS (header-fix.css, listing-mobile.css)
    ├─ Load JavaScript (React bundle)
    └─ Render Page
         │
         └─ User on Desktop (> 991px)
              │
              └─ Mobile styles ignored (media queries)
                   │
                   └─ No performance impact
         
         └─ User on Mobile (< 991px)
              │
              ├─ Apply mobile styles
              ├─ Hide desktop menu
              └─ Show hamburger button
                   │
                   └─ Menu closed by default
                        │
                        └─ Minimal memory footprint
```

## Testing Matrix

```
┌─────────────┬──────────┬──────────┬──────────┬──────────┐
│   Device    │  Chrome  │  Safari  │ Firefox  │   Edge   │
├─────────────┼──────────┼──────────┼──────────┼──────────┤
│ iPhone 12   │    ✅    │    ✅    │    ✅    │    ✅    │
├─────────────┼──────────┼──────────┼──────────┼──────────┤
│ Galaxy S21  │    ✅    │    N/A   │    ✅    │    ✅    │
├─────────────┼──────────┼──────────┼──────────┼──────────┤
│ iPad Pro    │    ✅    │    ✅    │    ✅    │    ✅    │
├─────────────┼──────────┼──────────┼──────────┼──────────┤
│ Desktop     │    ✅    │    ✅    │    ✅    │    ✅    │
└─────────────┴──────────┴──────────┴──────────┴──────────┘

Legend:
✅ = Fully tested and working
N/A = Not applicable
```

---

This architecture ensures a clean, maintainable, and performant mobile navigation experience!
