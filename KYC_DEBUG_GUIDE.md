# KYC Button Visibility - Debug Guide

## Quick Debug Steps

### Step 1: Check Console Logs
Open browser DevTools (F12) and look for these logs:

```
🔍 KYC Status Debug
  Current KYC Status: [pending/not_verified/verified]
  Should Show KYC Button: [true/false]
  Button Condition: [true/false]
```

**Expected:** If status is NOT "verified", should show `true`

---

### Step 2: Run Debug Script
Copy and paste this in browser console:

```javascript
// Check KYC Status
const kycStatus = document.querySelector('[class*="badge"]')?.textContent;
console.log('KYC Status Badge:', kycStatus);

// Check if button exists
const kycBtn = document.querySelector('a[aria-label="Complete KYC"]');
console.log('KYC Button Exists:', !!kycBtn);

// Check primary actions
const actions = document.querySelector('[class*="primaryActions"]');
console.log('Primary Actions Children:', actions?.children.length);
```

---

### Step 3: Inspect Elements
1. Right-click on Primary Actions area → Inspect
2. Look for 4 buttons (Invest, Withdraw, Refer, KYC)
3. Check if KYC button has:
   - `aria-label="Complete KYC"`
   - Classes: `primaryActionBtn kycBtn`
   - Display: `flex` (not `none`)

---

## Common Issues & Solutions

### Issue 1: Button Not Rendering (Not in DOM)
**Symptoms:** Only 3 buttons visible, KYC button missing from HTML

**Causes:**
- `kycStatus === 'verified'` (condition is false)
- React conditional rendering failed

**Debug:**
```javascript
// Check state
console.log('KYC Status:', document.querySelector('.badgeNotVerified') ? 'not_verified' : 'other');

// Check condition
console.log('Condition Result:', kycStatus !== 'verified');
```

**Fix:** Verify KYC status is loading correctly from database

---

### Issue 2: Button Rendered but Hidden (CSS Issue)
**Symptoms:** 4 buttons in HTML but only 3 visible

**Causes:**
- `display: none` or `visibility: hidden`
- Flex layout wrapping
- Overflow hidden

**Debug:**
```javascript
const kycBtn = document.querySelector('.kycBtn');
const styles = window.getComputedStyle(kycBtn);
console.log('Display:', styles.display);
console.log('Visibility:', styles.visibility);
console.log('Opacity:', styles.opacity);
console.log('Width:', styles.width);
```

**Fix:** Check CSS in Dashboard.module.css for `.kycBtn` and `.primaryActionBtn`

---

### Issue 3: Flex Layout Breaking
**Symptoms:** Buttons wrapping to multiple rows

**Causes:**
- `flex: 1 1 calc(50% - var(--space-1))` forces 2 columns
- Not enough space for 4 buttons

**Debug:**
```javascript
const actions = document.querySelector('[class*="primaryActions"]');
const parent = window.getComputedStyle(actions);
console.log('Display:', parent.display);
console.log('Flex-Wrap:', parent.flexWrap);
console.log('Gap:', parent.gap);
```

**Fix:** Change flex basis to `auto` or use `flex: 1 1 auto`

---

## Console Log Checklist

When debugging, look for these logs in order:

1. ✅ `🔍 KYC Status Debug` - Status loaded
2. ✅ `🔍 Loading KYC Status` - Database query started
3. ✅ `✅ Profile Data` - Database returned data
4. ✅ `📄 Setting KYC to: [status]` - Status set
5. ✅ `🔍 Rendering Primary Actions` - Component rendering
6. ✅ `🔍 KYC Button Condition TRUE` - Button should render

**If any log is missing:** That's where the issue is

---

## Database Check

Verify KYC status in Supabase:

```sql
SELECT user_id, kyc_status FROM user_profiles WHERE user_id = '[YOUR_USER_ID]';
```

Expected values:
- `approved` → renders as "verified"
- `pending` → renders as "pending"
- `null` or other → renders as "not_verified"

---

## CSS Verification

Check these CSS rules exist in Dashboard.module.css:

```css
.primaryActions {
  display: flex;
  flex-wrap: wrap;
}

.primaryActionBtn {
  flex: 1 1 auto;  /* Should be 'auto', not 'calc(50% - ...)' */
}

.kycBtn {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  display: flex !important;
  visibility: visible !important;
}
```

---

## Quick Fix Checklist

- [ ] KYC status is NOT "verified"
- [ ] Condition `kycStatus !== 'verified'` evaluates to TRUE
- [ ] Button renders in DOM (check HTML)
- [ ] Button has correct classes
- [ ] CSS display is not `none`
- [ ] Flex layout allows 4 buttons
- [ ] No overflow hidden on parent

---

## Still Not Working?

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check browser console for errors
4. Verify user is logged in
5. Check database has KYC data
6. Restart dev server (`npm start`)
