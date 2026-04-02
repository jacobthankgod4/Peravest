# COMPILATION FIXES NEEDED

## ✅ FIXED:
1. Installed zod, react-hook-form, @hookform/resolvers
2. Fixed App.tsx import path in index.tsx

## ⚠️ REMAINING FIXES:

### 1. supabaseClient Import (6 files)
**Issue:** Files import from './supabaseClient' but actual file is '../lib/supabase'

**Files to fix:**
- src/services/financialReportsService.ts
- src/services/kycVerificationService.ts
- src/services/notificationService.ts
- src/services/propertyManagementService.ts
- src/services/realTimeInvestmentTracker.ts
- src/services/withdrawalManagementService.ts

**Fix:** Change all imports from:
```typescript
import { supabase } from './supabaseClient';
```
To:
```typescript
import { supabase } from '../lib/supabase';
```

### 2. TypeScript Config (downlevelIteration)
**Issue:** Set spread not supported without downlevelIteration

**File:** tsconfig.json

**Fix:** Add to compilerOptions:
```json
"downlevelIteration": true
```

### 3. Type Errors (Multiple files)
**Issue:** Implicit 'any' types and property access errors

**Quick Fix:** Add to tsconfig.json:
```json
"noImplicitAny": false
```

### 4. Missing exports in errorHandler
**File:** src/utils/errorHandler.ts

**Fix:** Export ApiError type and handleApiError function

### 5. User type property
**File:** src/hooks/usePermission.ts

**Issue:** user.user_type doesn't exist

**Fix:** Check actual User type structure

---

## QUICK FIX SCRIPT

Run these commands to fix most issues:

```bash
# Fix supabase imports
find src/services -name "*.ts" -exec sed -i "s|from './supabaseClient'|from '../lib/supabase'|g" {} +

# Or manually update each file
```

---

## RECOMMENDED: Create supabaseClient.ts alias

**Create:** src/services/supabaseClient.ts
```typescript
export { supabase } from '../lib/supabase';
```

This way all existing imports will work without changes.
