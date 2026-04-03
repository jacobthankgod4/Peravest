# Atomic Implementation Plan: Homepage Savings Features Section

## Diagnosis Summary

The PHP homepage does **not** have a savings features section either — it is a **React-only feature** that was designed, routed, and styled but never rendered on the homepage. The evidence trail:

| Asset | Status | Location |
|---|---|---|
| Routes (`/ajo`, `/target-savings`, `/safelock`) | ✅ Exist | `App.tsx` |
| Feature pages (AjoSavings, TargetSavings, SafeLock) | ✅ Exist | `src/components/` + `src/pages/` |
| `useSmartRouting` hook with `handleFeatureClick` | ✅ Exists | `src/hooks/useSmartRouting.ts` |
| `savings-features.css` with card styles | ✅ Exists | `src/savings-features.css` |
| Savings features JSX block in `Home.tsx` | ❌ **MISSING** | `src/pages/Home.tsx` |

---

## Phase 1 — Audit the 4 Feature Pages for Card Content

**File:** `src/pages/AjoSavings.tsx`
**File:** `src/components/TargetSavings.tsx`
**File:** `src/components/SafeLock.tsx`
**File:** `src/pages/Home.tsx`

### 1.1 — Extract the exact title, description, and key benefits for each feature

From the existing pages, collect:

| Feature | Title | Icon | Color | Route | Key Benefit |
|---|---|---|---|---|---|
| Real Estate | Crowdfund Real Estate | `fa-building` | `#0e2e50` | `/listings` | Invest from ₦5,000 |
| Ajo Savings | Ajo Savings Circle | `fa-users` | `#09c398` | `/ajo` | Rotating group payouts |
| Target Savings | Target Savings | `fa-bullseye` | `#0d6efd` | `/target-savings` | Save towards a goal |
| SafeLock | SafeLock | `fa-lock` | `#ffc107` | `/safelock` | Up to 15% annual returns |

### 1.2 — Confirm `handleFeatureClick` routing logic

In `useSmartRouting.ts`:
- If authenticated → navigate directly to feature route
- If not authenticated → navigate to `/login?return=<feature-url>`

This means the CTA button on each card must call `handleFeatureClick('ajo')`, `handleFeatureClick('target-savings')`, etc. — **not** a plain `<Link>`.

### 1.3 — Confirm `savings-features.css` class names to reuse

Classes already defined and ready to use:
- `.savings-features-area` — section wrapper
- `.savings-feature-card` — individual card
- `.feature-benefits` — bullet list
- `.feature-benefits li` — individual benefit item (has `✓` pseudo-element)
- `.feature-btn` — CTA button (currently blue `#007bff`, needs updating to match brand)

---

## Phase 2 — Fix `savings-features.css` Before Writing JSX

**File:** `src/savings-features.css`

### 2.1 — Update `.feature-btn` to use brand colors

Current `.feature-btn` uses `#007bff` (generic Bootstrap blue). It must use the project's `theme-btn` style (`#0e2e50` background with `#09c398` hover) to be consistent with the rest of the site.

**Action:** Replace `.feature-btn` background from `#007bff` to `#0e2e50` and hover from `#0056b3` to `#09c398`.

### 2.2 — Add card hover effect

The existing `.savings-feature-card` has no hover state. Add:
- `transition: transform 0.3s, box-shadow 0.3s`
- On hover: `transform: translateY(-5px)` and elevated `box-shadow`

This matches the `choose-item` hover pattern already used in the PHP homepage's "Why Choose Us" section.

### 2.3 — Add section background

The section needs a background to visually separate it from "Featured Properties" (gray `#f9f9f9`) above and "How It Works" (dark gradient) below. Use the project's `.bg` class background: `#eaf7f4` (light green tint — already used in `style.css`).

---

## Phase 3 — Write the JSX Section in `Home.tsx`

**File:** `src/pages/Home.tsx`

### 3.1 — Confirm `handleFeatureClick` is already imported

Line 4 already has:
```
const { handleFeatureClick } = useSmartRouting();
```
It is imported but **never used**. This is the exact hook needed. No new imports required.

### 3.2 — Determine exact insertion point

The section must be inserted **between** the "Featured Properties" section and the "How It Works" section. In the current JSX order:

```
1. <HeroCarousel />
2. About Section
3. Featured Properties   ← INSERT AFTER THIS
4. [MISSING: Savings Features Section]
5. How It Works
6. <ContactUs />
7. Blog Section
```

The insertion point is after the closing `</div>` of the Featured Properties block (the one with `background: '#f9f9f9'`).

### 3.3 — Define the 4 feature card data structure

Define a local `features` array inside the component (above the return statement) with these fields per card:
- `key` — matches `handleFeatureClick` argument (`'real-estate'`, `'ajo'`, `'target-savings'`, `'safelock'`)
- `icon` — FontAwesome class string
- `iconBg` — accent color for the icon circle
- `title` — display name
- `description` — one-sentence pitch
- `benefits` — array of 3 short bullet strings
- `cta` — button label text

### 3.4 — Write the section wrapper

Use the existing `.savings-features-area` class on the outer `<div>`. Apply `background: '#eaf7f4'` and `padding: '80px 20px'` inline to match the spacing pattern of other sections in the file.

### 3.5 — Write the section heading

Follow the exact same heading pattern used in the "How It Works" section already in `Home.tsx`:
- `<span>` with `site-title-tagline` class for the eyebrow text: `"Our Investment Products"`
- `<h2>` with `site-title` class: `"Choose How You Want to Grow"`

### 3.6 — Write the 4 feature cards using Bootstrap grid

Use `col-md-6 col-lg-3` so cards are:
- 4 across on desktop (≥992px)
- 2 across on tablet (≥768px)
- 1 across on mobile

Each card structure:
```
<div className="savings-feature-card">
  [icon circle]
  [title h4]
  [description p]
  [benefits ul.feature-benefits]
  [CTA button calling handleFeatureClick]
</div>
```

### 3.7 — Wire the CTA button to `handleFeatureClick`

Each card's button must call `handleFeatureClick` with the correct feature key:
- Real Estate card → `handleFeatureClick('real-estate')`
- Ajo card → `handleFeatureClick('ajo')`
- Target Savings card → `handleFeatureClick('target-savings')`
- SafeLock card → `handleFeatureClick('safelock')`

This ensures unauthenticated users are redirected to login with a return URL, and authenticated users go directly to the feature page.

### 3.8 — Remove the `handleFeatureClick` unused variable warning

Since `handleFeatureClick` is currently imported but unused, adding it to the JSX in 3.7 will also fix the ESLint `no-unused-vars` warning that currently exists on line 31 of `Home.tsx`.

---

## Phase 4 — Verify No Broken Imports or Dead Code

**File:** `src/pages/Home.tsx`

### 4.1 — Confirm `savings-features.css` is already imported

Line 11: `import '../savings-features.css';` — already present. No action needed.

### 4.2 — Confirm `testimonial-override.css` import is still valid

Line 12: `import '../testimonial-override.css';` — check this file exists to avoid a build warning.

### 4.3 — Confirm no duplicate section IDs

The new section has no `id` attribute so no conflict with existing anchor links.

---

## Phase 5 — Test the Routing Behaviour

### 5.1 — Test as unauthenticated user

Click each feature card CTA → should redirect to `/login?return=/ajo` (or respective route) → after login, should land on the correct feature page.

### 5.2 — Test as authenticated user

Click each feature card CTA → should navigate directly to `/ajo`, `/target-savings`, `/safelock`, `/listings` without going through login.

### 5.3 — Test responsive layout

- Desktop (1200px+): 4 cards in a row
- Tablet (768px–991px): 2 cards per row
- Mobile (<768px): 1 card per row, full width

### 5.4 — Verify no ESLint errors introduced

The `handleFeatureClick` unused variable warning on line 31 should be gone. No new warnings should appear.

---

## Phase 6 — Commit and Push

### 6.1 — Stage only the two changed files
```
git add src/pages/Home.tsx src/savings-features.css
```

### 6.2 — Commit with a descriptive message
```
git commit -m "Add savings features section to homepage: Ajo, Target Savings, SafeLock, Real Estate"
```

### 6.3 — Push to main
```
git push origin main
```

---

## Files Changed Summary

| File | Change Type | What Changes |
|---|---|---|
| `src/pages/Home.tsx` | Edit | Add savings features JSX section between Featured Properties and How It Works |
| `src/savings-features.css` | Edit | Fix `.feature-btn` colors, add card hover effect, add section background |

**Files NOT touched:**
- `App.tsx` — routes already exist
- `useSmartRouting.ts` — hook already works correctly
- All feature pages (AjoSavings, TargetSavings, SafeLock) — no changes needed
- `header-fix.css` — unrelated
