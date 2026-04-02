# SPRINT 1: CRUD OPERATIONS - IMPLEMENTATION GUIDE
## Week 2 - 40 Hours

**Status:** READY TO START  
**Goal:** Complete all CRUD operations for Properties, Users, and Ajo Groups  
**Target Score:** 57 → 69 (+12 points)

---

## SPRINT 1.1: Property CRUD (16 hours)

### Task 1.1.1: Add Property Form (6 hours)

**File to Create:** `src/components/admin/AddPropertyForm.tsx`

**Required Fields:**
```typescript
- title: string (validated with propertySchema)
- description: string
- location: string
- price: number
- roi_percentage: number
- duration_months: number
- total_shares: number
- available_shares: number
- property_type: string
- status: enum
- images: File[] (multiple upload with fileValidator)
- video: File (optional)
```

**Implementation Steps:**
1. Import propertySchema from validationSchemas
2. Use react-hook-form with zodResolver
3. Integrate fileValidator for image uploads
4. Use propertyManagementService.createProperty()
5. Show success toast with errorHandler
6. Redirect to property list on success

**Validation:**
- All fields validated with Zod
- Images: max 10, 5MB each, JPEG/PNG/WebP
- Dimensions: max 4096x4096px
- Filename sanitization

**Route:** `/admin/properties/add`

---

### Task 1.1.2: Edit Property Form (6 hours)

**File to Create:** `src/components/admin/EditPropertyForm.tsx`

**Features:**
- Load existing property data
- Pre-fill form fields
- Update images (add/remove)
- Update all fields
- Validation with propertySchema
- Success/error feedback

**Implementation:**
1. Fetch property by ID on mount
2. Populate form with existing data
3. Handle image updates (keep existing + add new)
4. Use propertyManagementService.updateProperty()
5. Show success toast
6. Redirect to property list

**Route:** `/admin/properties/edit/:id`

---

### Task 1.1.3: Delete Property (4 hours)

**File to Update:** `src/components/admin/AdminPropertyManagement.tsx`

**Features:**
- Delete button on each property card
- Confirmation modal
- Check for active investments
- Soft delete option
- Audit log entry

**Implementation:**
1. Add delete button to property cards
2. Create confirmation modal component
3. Check if property has active investments
4. If yes, show warning and offer soft delete
5. Use propertyManagementService.deleteProperty()
6. Update UI on success
7. Log action to audit_logs

**Confirmation Modal:**
```typescript
"Are you sure you want to delete this property?"
"This property has X active investments. Soft delete instead?"
[Cancel] [Soft Delete] [Permanent Delete]
```

---

## SPRINT 1.2: User CRUD (12 hours)

### Task 1.2.1: User Details Modal (4 hours)

**File to Create:** `src/components/admin/UserDetailsModal.tsx`

**Sections:**
1. **User Info**
   - Name, Email, Phone
   - User Type (admin/user)
   - Account Status
   - Join Date
   - KYC Status

2. **Investment History**
   - List of all investments
   - Total invested
   - Current value
   - Active/Completed count

3. **Activity Log**
   - Recent actions
   - Login history
   - Transactions

4. **Actions**
   - Edit User button
   - Enable/Disable Account
   - Reset Password
   - Send Message

**Implementation:**
1. Create modal component
2. Fetch user data by ID
3. Fetch investment history
4. Display in tabs or sections
5. Add action buttons
6. Handle modal open/close

---

### Task 1.2.2: Edit User Form (4 hours)

**File to Create:** `src/components/admin/EditUserForm.tsx`

**Editable Fields:**
```typescript
- name: string
- email: string (with validation)
- phone: string (optional)
- user_type: enum (admin/user)
- status: enum (active/inactive)
```

**Features:**
- Form validation with userSchema
- Role change confirmation
- Account status toggle
- Success feedback
- Audit logging

**Implementation:**
1. Load user data
2. Create form with react-hook-form
3. Validate with userSchema
4. Confirm role changes
5. Use userService.updateUser()
6. Log to audit_logs
7. Show success toast

**Security:**
- Check permissions with usePermission
- Only super_admin can change roles
- Prevent self-demotion

---

### Task 1.2.3: User Communication (4 hours)

**File to Create:** `src/components/admin/SendMessageModal.tsx`

**Features:**
- Email user directly
- SMS option (if integrated)
- Message templates
- Send notification

**Fields:**
```typescript
- recipient: string (pre-filled)
- subject: string
- message: string (textarea)
- template: select (optional)
- send_email: boolean
- send_notification: boolean
```

**Templates:**
- Welcome message
- Account verification
- Investment update
- Withdrawal approved
- Custom

**Implementation:**
1. Create modal component
2. Form with messageSchema validation
3. Template selector
4. Integrate with notificationService
5. Send email (TODO: email service)
6. Show success feedback

---

## SPRINT 1.3: Ajo CRUD (12 hours)

### Task 1.3.1: Ajo Group Details (6 hours)

**File to Update:** `src/components/admin/AdminAjoManagement.tsx`

**Add Detailed View:**

1. **Member List**
   ```typescript
   - Member name
   - Join date
   - Contribution status (paid/pending)
   - Position in cycle
   - Reliability score
   - Actions (remove, mark default)
   ```

2. **Contribution Tracking**
   ```typescript
   - Current cycle number
   - Total cycles
   - Contributions this cycle
   - Pending contributions
   - Defaulted members
   - Total collected
   ```

3. **Payment History**
   ```typescript
   - Date
   - Member
   - Amount
   - Status
   - Transaction reference
   ```

4. **Cycle Details**
   ```typescript
   - Start date
   - End date
   - Payout date
   - Payout recipient
   - Payout amount
   - Status (active/completed)
   ```

**Implementation:**
1. Expand group card to show details
2. Fetch members with ajoGroupService
3. Fetch contribution history
4. Display in organized sections
5. Add action buttons

---

### Task 1.3.2: Manual Payout Trigger (4 hours)

**Feature:** Process Payout Button

**Workflow:**
1. Check cycle readiness
   - All contributions received?
   - Cycle end date reached?
   - No pending defaults?

2. Show confirmation
   ```
   "Process payout for Cycle X?"
   Recipient: [Member Name]
   Amount: ₦[Amount]
   [Cancel] [Confirm]
   ```

3. Execute atomic transaction
   - Use ajoPayoutScheduler.processCyclePayout()
   - Lock funds
   - Transfer to recipient
   - Update cycle status
   - Rotate positions

4. Send notifications
   - Notify recipient
   - Notify all members
   - Admin notification

5. Show success/error

**Implementation:**
1. Add "Process Payout" button
2. Validate cycle readiness
3. Show confirmation modal
4. Call ajoPayoutScheduler
5. Handle success/error
6. Refresh group data
7. Show toast notification

**Error Handling:**
- Insufficient funds
- Member not found
- Cycle not ready
- Transaction failed

---

### Task 1.3.3: Handle Defaults (2 hours)

**Feature:** Default Management

**Actions:**
1. **Mark as Defaulted**
   - Button on member row
   - Confirmation required
   - Lock member's contributions
   - Calculate penalty
   - Update member status

2. **Resolution Workflow**
   - Member pays penalty
   - Unlock contributions
   - Resume participation
   - Or remove from group

**Implementation:**
1. Add "Mark Default" button
2. Confirmation modal
3. Update member status
4. Lock funds with ajoWithdrawalController
5. Calculate penalty (e.g., 10% of contribution)
6. Send notification
7. Log to audit

**Penalty Calculation:**
```typescript
penalty = contribution_amount * 0.10
total_owed = contribution_amount + penalty
```

---

## ROUTES TO ADD

**File:** `public_html/src/App.tsx`

```typescript
// Property routes
<Route path="/admin/properties/add" element={
  <ProtectedRoute adminOnly>
    <AdminLayout><AddPropertyForm /></AdminLayout>
  </ProtectedRoute>
} />

<Route path="/admin/properties/edit/:id" element={
  <ProtectedRoute adminOnly>
    <AdminLayout><EditPropertyForm /></AdminLayout>
  </ProtectedRoute>
} />

// User routes (modals, no new routes needed)

// Ajo routes (expanded existing component)
```

---

## SERVICES TO USE

### Existing Services:
- `propertyManagementService` - Property CRUD
- `userService` - User operations
- `ajoGroupService` - Ajo operations
- `ajoPayoutScheduler` - Payout processing
- `ajoWithdrawalController` - Fund locking
- `notificationService` - Notifications
- `errorHandler` - Error handling

### Validation:
- `propertySchema` - Property validation
- `userSchema` - User validation
- `fileValidator` - File uploads
- `permissionManager` - RBAC checks

---

## COMPONENTS TO CREATE

### Sprint 1.1 (3 components):
1. AddPropertyForm.tsx
2. EditPropertyForm.tsx
3. DeleteConfirmationModal.tsx

### Sprint 1.2 (3 components):
1. UserDetailsModal.tsx
2. EditUserForm.tsx
3. SendMessageModal.tsx

### Sprint 1.3 (2 components):
1. ProcessPayoutModal.tsx
2. MarkDefaultModal.tsx

**Total:** 8 new components

---

## TESTING CHECKLIST

### Property CRUD:
- [ ] Can add property with images
- [ ] Form validation works
- [ ] Can edit existing property
- [ ] Can delete property
- [ ] Soft delete works for active properties
- [ ] Audit logs created

### User CRUD:
- [ ] User details modal shows all info
- [ ] Can edit user information
- [ ] Role changes work
- [ ] Account enable/disable works
- [ ] Can send messages
- [ ] Permissions enforced

### Ajo CRUD:
- [ ] Member list displays correctly
- [ ] Contribution tracking accurate
- [ ] Can process payout
- [ ] Atomic transaction works
- [ ] Can mark defaults
- [ ] Penalties calculated correctly

---

## SUCCESS METRICS

### Before Sprint 1:
- CRUD Score: 33/100
- Functional Completeness: 45/100
- Overall Score: 57/100

### After Sprint 1:
- CRUD Score: 75/100 (+42)
- Functional Completeness: 65/100 (+20)
- Overall Score: 69/100 (+12)

### Improvements:
- Properties: 25% → 100% (+75%)
- Users: 25% → 75% (+50%)
- Ajo: 25% → 75% (+50%)

---

## IMPLEMENTATION ORDER

### Day 1-2 (16 hours): Property CRUD
- Add Property Form
- Edit Property Form
- Delete Property

### Day 3-4 (12 hours): User CRUD
- User Details Modal
- Edit User Form
- Send Message Modal

### Day 4-5 (12 hours): Ajo CRUD
- Ajo Group Details
- Process Payout
- Handle Defaults

---

## DEPENDENCIES

### Required:
- ✅ Validation schemas (Sprint 0.2)
- ✅ File validator (Sprint 0.2)
- ✅ Error handler (Sprint 0.1)
- ✅ Permission system (Sprint 0.2)
- ✅ Responsive CSS (Sprint 0.3)

### Services:
- ✅ propertyManagementService
- ✅ userService
- ✅ ajoGroupService
- ✅ ajoPayoutScheduler
- ✅ notificationService

**All dependencies ready!**

---

## NEXT STEPS

1. **Start with Task 1.1.1:** Create AddPropertyForm.tsx
2. **Use existing patterns:** Follow AdminWithdrawals.tsx structure
3. **Integrate validation:** Use propertySchema with react-hook-form
4. **Test thoroughly:** Each CRUD operation
5. **Document:** Add comments for complex logic

**Ready to implement Sprint 1.1.1: Add Property Form?**

Type "implement" to start coding or "continue" to proceed to Sprint 2 planning.
