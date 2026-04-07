# KYC Button Visibility - Comprehensive Audit Report

## Executive Summary
The KYC button is not displaying on the Dashboard because of a **multi-layer issue** involving:
1. Database schema mismatch
2. KYC status loading logic flaw
3. CSS flex layout constraints
4. Missing error handling

---

## Root Cause Analysis

### Issue 1: Database Schema Mismatch (CRITICAL)
**Location:** `database/016_create_user_profiles_pg.sql`

**Problem:**
```sql
kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending',
CONSTRAINT chk_kyc_status CHECK (kyc_status IN ('pending', 'submitted', 'approved', 'rejected'))
```

**Dashboard expects:**
```typescript
if (profile?.kyc_status === 'approved') {
  setKycStatus('verified');
} else if (profile?.kyc_status === 'pending') {
  setKycStatus('pending');
}
```

**Mismatch:**
- Database stores: `'pending'`, `'submitted'`, `'approved'`, `'rejected'`
- Dashboard checks for: `'approved'` (maps to 'verified')
- **Missing mapping:** `'submitted'` status is not handled!

**Impact:** When user submits KYC, status becomes `'submitted'` but Dashboard doesn't recognize it, defaults to `'not_verified'`, and button doesn't show.

---

### Issue 2: KYC Status Loading Logic (HIGH)
**Location:** `src/components_main/Dashboard.tsx` lines 48-68

**Current Logic:**
```typescript
if (profile?.kyc_status === 'approved') {
  setKycStatus('verified');
} else if (profile?.kyc_status === 'pending') {
  setKycStatus('pending');
} else {
  setKycStatus('not_verified');  // FALLBACK - catches 'submitted' status!
}
```

**Problem:**
- `'submitted'` status falls through to `'not_verified'`
- No logging to debug which status is being returned
- No error handling if profile query fails

**Solution Needed:**
```typescript
if (profile?.kyc_status === 'approved') {
  setKycStatus('verified');
} else if (profile?.kyc_status === 'pending' || profile?.kyc_status === 'submitted') {
  setKycStatus('pending');  // Both pending and submitted show as pending
} else if (profile?.kyc_status === 'rejected') {
  setKycStatus('not_verified');  // Rejected users need to resubmit
} else {
  setKycStatus('not_verified');
}
```

---

### Issue 3: CSS Flex Layout (MEDIUM)
**Location:** `src/components_main/Dashboard.module.css` lines 265-280

**Current CSS:**
```css
.primaryActionBtn {
  flex: 1 1 auto;  /* FIXED - was calc(50% - var(--space-1)) */
  min-width: 100px;
  height: 44px;
  ...
}
```

**Status:** ✅ Already fixed in previous changes

---

### Issue 4: Missing KYC Submission Table (HIGH)
**Location:** Database schema

**Problem:**
- `kycVerificationService.submitKYC()` inserts into `kyc_submissions` table
- But this table doesn't exist in migrations!
- Only `user_profiles` table exists with `kyc_status` field

**Missing Migration:**
```sql
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  phone_number VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  bvn VARCHAR(11),
  nin VARCHAR(11),
  id_type VARCHAR(50),
  id_number VARCHAR(100),
  id_document_url TEXT,
  proof_of_address_url TEXT,
  selfie_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### Issue 5: KYC Status Not Updating After Submission (HIGH)
**Location:** `src/pages/KYC.tsx` and `src/services/kycVerificationService.ts`

**Problem:**
1. User submits KYC form
2. Data saved to `kyc_submissions` table
3. **But `user_profiles.kyc_status` is NOT updated!**
4. Dashboard still shows `'pending'` because it queries `user_profiles`

**Missing Logic:**
```typescript
// After successful submission, update user_profiles
await supabase
  .from('user_profiles')
  .update({ kyc_status: 'submitted' })
  .eq('user_id', userId);
```

---

## Console Debug Output Analysis

### Expected vs Actual Logs

**Expected (if working):**
```
🔍 KYC Status Debug
  Current KYC Status: pending
  Should Show KYC Button: true
  Button Condition: true

✅ Profile Data: { kyc_status: 'pending' }
📄 Setting KYC to: pending

🔍 Rendering Primary Actions - KYC Status: pending
🔍 KYC Button Condition TRUE - Rendering KYC Button
```

**Actual (if broken):**
```
🔍 KYC Status Debug
  Current KYC Status: not_verified  ← WRONG!
  Should Show KYC Button: false     ← WRONG!
  Button Condition: false           ← WRONG!

✅ Profile Data: { kyc_status: 'submitted' }  ← Not handled!
📄 Setting KYC to: not_verified (default)     ← Falls through!

🔍 Rendering Primary Actions - KYC Status: not_verified
🔍 KYC Button Condition FALSE - NOT Rendering KYC Button  ← Button hidden!
```

---

## Implementation Comparison with GitHub Standards

### Standard KYC Implementation Pattern:

**1. Database Schema:**
```sql
-- user_profiles table
kyc_status ENUM('not_started', 'pending', 'submitted', 'approved', 'rejected')

-- kyc_submissions table (separate)
status ENUM('pending', 'approved', 'rejected')
```

**2. Frontend Logic:**
```typescript
// Map all statuses correctly
const statusMap = {
  'not_started': 'not_verified',
  'pending': 'pending',
  'submitted': 'pending',  // KEY: submitted also shows pending
  'approved': 'verified',
  'rejected': 'not_verified'
};

const displayStatus = statusMap[profile?.kyc_status] || 'not_verified';
```

**3. Button Visibility:**
```typescript
// Show button if NOT verified
{displayStatus !== 'verified' && (
  <KYCButton status={displayStatus} />
)}
```

---

## Complete Fix Implementation

### Step 1: Update Dashboard KYC Status Logic

**File:** `src/components_main/Dashboard.tsx`

```typescript
// Replace lines 48-68 with:
if (profileError) {
  console.error('❌ KYC Query Error:', profileError);
  setKycStatus('not_verified');
} else {
  console.log('✅ Profile Data:', profile);
  console.log('Raw KYC Status from DB:', profile?.kyc_status);
  
  // Map all possible statuses
  const statusMap: Record<string, 'verified' | 'pending' | 'not_verified'> = {
    'approved': 'verified',
    'pending': 'pending',
    'submitted': 'pending',  // KEY FIX: Handle submitted status
    'rejected': 'not_verified',
    'not_started': 'not_verified'
  };
  
  const mappedStatus = statusMap[profile?.kyc_status] || 'not_verified';
  console.log('📄 Setting KYC to:', mappedStatus);
  setKycStatus(mappedStatus);
}
```

### Step 2: Create Missing KYC Submissions Table

**File:** `database/017_create_kyc_submissions_pg.sql`

```sql
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  phone_number VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  bvn VARCHAR(11),
  nin VARCHAR(11),
  id_type VARCHAR(50),
  id_number VARCHAR(100),
  id_document_url TEXT,
  proof_of_address_url TEXT,
  selfie_url TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_kyc_submissions_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE,
  CONSTRAINT chk_kyc_submission_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_submissions_status ON kyc_submissions(status);
```

### Step 3: Update KYC Verification Service

**File:** `src/services/kycVerificationService.ts`

```typescript
async submitKYC(formData: FormData) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user_id from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('Id')
      .eq('email', user.email)
      .single();

    if (userError) throw userError;
    const userId = userData.Id;

    // Upload files...
    const uploadResults = await Promise.all(uploadPromises);
    const documentUrls = uploadResults.reduce((acc, result) => ({ ...acc, ...result }), {});

    // Save to kyc_submissions
    const { data: submissionData, error: submissionError } = await supabase
      .from('kyc_submissions')
      .insert({
        user_id: userId,
        first_name: formData.get('firstName'),
        last_name: formData.get('lastName'),
        date_of_birth: formData.get('dateOfBirth'),
        phone_number: formData.get('phoneNumber'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        bvn: formData.get('bvn'),
        nin: formData.get('nin'),
        id_type: formData.get('idType'),
        id_number: formData.get('idNumber'),
        id_document_url: documentUrls.idDocument,
        proof_of_address_url: documentUrls.proofOfAddress,
        selfie_url: documentUrls.selfie,
        status: 'pending'
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // KEY FIX: Update user_profiles kyc_status
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ kyc_status: 'submitted' })
      .eq('user_id', userId);

    if (profileError) throw profileError;

    return { data: submissionData, error: null };
  } catch (error) {
    console.error('KYC Submission Error:', error);
    return { data: null, error };
  }
}
```

---

## Verification Checklist

- [ ] Database migration 017 created and applied
- [ ] Dashboard KYC status mapping updated
- [ ] KYC service updates user_profiles after submission
- [ ] Console logs show correct status mapping
- [ ] KYC button appears when status is 'pending' or 'submitted'
- [ ] KYC button disappears when status is 'verified'
- [ ] KYC alert shows for non-verified users
- [ ] All three buttons (Invest, Withdraw, Refer) display
- [ ] KYC button displays as 4th button

---

## Testing Steps

1. **Check Database:**
   ```sql
   SELECT kyc_status FROM user_profiles WHERE user_id = [YOUR_ID];
   ```
   Should return: `'pending'`, `'submitted'`, `'approved'`, or `'rejected'`

2. **Check Console Logs:**
   - Open DevTools (F12)
   - Look for "🔍 KYC Status Debug" logs
   - Verify status is mapped correctly

3. **Test KYC Submission:**
   - Go to /kyc page
   - Fill form and submit
   - Check database: `kyc_status` should change to `'submitted'`
   - Refresh dashboard: KYC button should still show

4. **Test Button Visibility:**
   - Dashboard should show 4 buttons in primary actions
   - KYC button should be red/pink gradient
   - Button text should be "KYC Pending" or "Complete KYC"

---

## Summary of Issues Found

| Issue | Severity | Status | Fix |
|-------|----------|--------|-----|
| Database status mismatch | CRITICAL | ❌ Not Fixed | Add 'submitted' to status map |
| KYC status logic flaw | HIGH | ❌ Not Fixed | Update Dashboard.tsx lines 48-68 |
| Missing kyc_submissions table | HIGH | ❌ Not Fixed | Create migration 017 |
| Profile not updated after submission | HIGH | ❌ Not Fixed | Add update in kycVerificationService |
| CSS flex layout | MEDIUM | ✅ Fixed | Already corrected |
| Console logging | LOW | ✅ Fixed | Already added |

---

## Next Steps

1. Apply database migration 017
2. Update Dashboard.tsx with status mapping
3. Update kycVerificationService.ts to update user_profiles
4. Test KYC submission flow
5. Verify button displays on dashboard
