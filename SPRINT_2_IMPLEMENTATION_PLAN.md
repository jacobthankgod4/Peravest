# SPRINT 2: MISSING FEATURES - IMPLEMENTATION PLAN
## Week 3 - 40 Hours

**Status:** READY TO START  
**Goal:** Implement planned missing features  
**Current Score:** 69/100  
**Target Score:** 79/100 (+10 points)

---

## SPRINT 2.1: CORE MISSING COMPONENTS (20 hours)

### Task 2.1.1: Subscribers Management (6 hours)

**File to Create:** `src/components/admin/AdminSubscribers.tsx`

**Features:**
- List all newsletter subscribers
- Search by email
- Filter by status (active/unsubscribed)
- Export to CSV
- Send bulk email
- Unsubscribe management

**Implementation:**
```typescript
// Data Structure:
interface Subscriber {
  id: number;
  email: string;
  name?: string;
  subscribed_at: Date;
  status: 'active' | 'unsubscribed';
  source: string;
}

// Features:
- Table with pagination
- Search bar
- Status filter
- Bulk actions (select all, send email)
- Export to CSV
- Unsubscribe button

// Service:
- subscriberService.getAll()
- subscriberService.unsubscribe(id)
- subscriberService.exportCSV()
- emailService.sendBulk(emails, template)
```

**Route:** `/admin/subscribers`

---

### Task 2.1.2: Messages System (8 hours)

**File to Create:** `src/components/admin/AdminMessages.tsx`

**Features:**
- Inbox/Sent/Drafts tabs
- Compose new message
- Reply to messages
- Message templates
- Attachments support
- Mark as read/unread
- Delete messages

**Implementation:**
```typescript
// Data Structure:
interface Message {
  id: number;
  from_user_id: number;
  to_user_id: number;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: Date;
  attachments?: string[];
}

// Tabs:
1. Inbox - Received messages
2. Sent - Sent messages
3. Drafts - Unsent messages

// Compose Modal:
- To: (user selector)
- Subject: (text)
- Message: (rich text editor)
- Attachments: (file upload)
- Template: (select)
- [Save Draft] [Send]

// Service:
- messageService.getInbox()
- messageService.getSent()
- messageService.send(message)
- messageService.markAsRead(id)
- messageService.delete(id)
```

**Route:** `/admin/messages`

---

### Task 2.1.3: Settings Page (6 hours)

**File to Create:** `src/components/admin/AdminSettings.tsx`

**Sections:**

1. **System Settings**
   - App Name
   - App Version
   - Maintenance Mode
   - Debug Mode

2. **Interest Rates**
   - Tier 1 rates (≤₦500k)
   - Tier 2 rates (>₦500k)
   - Duration options

3. **Email Settings**
   - SMTP Host
   - SMTP Port
   - From Email
   - From Name
   - Templates

4. **Notification Settings**
   - Email notifications
   - SMS notifications
   - Push notifications
   - Admin alerts

5. **Backup & Restore**
   - Database backup
   - Restore from backup
   - Backup schedule

**Implementation:**
```typescript
// Data Structure:
interface Setting {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
}

// Form Sections:
- Each section has its own form
- Save button per section
- Validation with settingsSchema
- Confirmation for critical changes

// Service:
- settingsService.getAll()
- settingsService.update(key, value)
- settingsService.backup()
- settingsService.restore(file)

// Security:
- Permission.SYSTEM_SETTINGS required
- Audit log all changes
- Confirm critical changes
```

**Route:** `/admin/settings`

---

## SPRINT 2.2: ADVANCED FEATURES (20 hours)

### Task 2.2.1: Global Search (6 hours)

**File to Update:** `src/components/admin/AdminHeader.tsx`

**Features:**
- Search across all entities
- Real-time suggestions
- Keyboard shortcuts (Ctrl+K)
- Search results page
- Recent searches

**Implementation:**
```typescript
// Search Entities:
- Properties (by title, location)
- Users (by name, email)
- Investments (by property, user)
- Ajo Groups (by name)
- Transactions (by reference)

// Search Component:
- Input with icon
- Dropdown suggestions
- Keyboard navigation
- Click to navigate
- ESC to close

// Search Results Page:
- Grouped by entity type
- Pagination
- Filters
- Sort options

// Service:
- searchService.search(query)
- searchService.searchProperties(query)
- searchService.searchUsers(query)
- searchService.searchInvestments(query)

// Keyboard Shortcuts:
- Ctrl+K: Open search
- ESC: Close search
- Arrow keys: Navigate results
- Enter: Go to result
```

**File to Create:** `src/components/admin/SearchResults.tsx`

---

### Task 2.2.2: Breadcrumb Navigation (4 hours)

**File to Create:** `src/components/admin/Breadcrumbs.tsx`

**Features:**
- Auto-generate from route
- Clickable navigation
- Current page highlight
- Mobile-friendly
- Custom labels

**Implementation:**
```typescript
// Route Mapping:
const routeLabels = {
  '/admin/dashboard': 'Dashboard',
  '/admin/properties': 'Properties',
  '/admin/properties/add': 'Add Property',
  '/admin/properties/edit/:id': 'Edit Property',
  '/admin/users': 'Users',
  '/admin/ajo': 'Ajo Groups',
  // ... etc
};

// Breadcrumb Structure:
Home > Properties > Edit Property

// Component:
- Parse current route
- Generate breadcrumb trail
- Render as links
- Highlight current page
- Responsive (collapse on mobile)

// Styling:
- Separator: >
- Current: bold, no link
- Previous: links
- Hover effects
```

**Add to:** `AdminLayout.tsx` (below header)

---

### Task 2.2.3: Export Enhancements (6 hours)

**Files to Create:**
- `src/utils/exportUtils.ts`
- `src/utils/pdfGenerator.ts`

**Features:**

1. **PDF Export**
   - Investment reports
   - Financial reports
   - User reports
   - Formatted with logo
   - Tables and charts

2. **Excel Export**
   - All tables
   - Multiple sheets
   - Formatted data
   - Formulas
   - Charts

3. **Scheduled Reports**
   - Daily/Weekly/Monthly
   - Email delivery
   - Auto-generate

**Implementation:**
```typescript
// Libraries:
- jspdf (PDF generation)
- jspdf-autotable (PDF tables)
- xlsx (Excel generation)

// PDF Generator:
class PDFGenerator {
  generateInvestmentReport(data)
  generateFinancialReport(data)
  generateUserReport(data)
  addHeader(doc, title)
  addTable(doc, data)
  addChart(doc, data)
  save(filename)
}

// Excel Generator:
class ExcelGenerator {
  generateWorkbook(data)
  addSheet(name, data)
  formatCells(sheet, format)
  addFormulas(sheet)
  addChart(sheet, data)
  save(filename)
}

// Export Service:
- exportService.toPDF(type, data)
- exportService.toExcel(type, data)
- exportService.schedule(type, frequency)
```

**Add Export Buttons to:**
- InvestmentsTable
- AdminAnalytics
- AdminAuditLogs
- AdminUsers
- AdminProperties

---

### Task 2.2.4: Real-time Integration (4 hours)

**Files to Update:**
- `src/components_main/AdminDashboard.tsx`
- `src/components/admin/AdminNotifications.tsx`

**Features:**

1. **Live Investment Updates**
   - Real-time interest calculations
   - Maturity alerts
   - New investment notifications

2. **Live Notifications**
   - Badge count updates
   - Toast on new notification
   - Sound alert (optional)

3. **Live Stats**
   - Dashboard stats auto-refresh
   - Investment count updates
   - Revenue updates

**Implementation:**
```typescript
// Integrate realTimeInvestmentTracker:

// In AdminDashboard:
useEffect(() => {
  // Subscribe to investment updates
  const subscription = realTimeInvestmentTracker
    .subscribeToInvestment(investmentId, (status) => {
      // Update UI with new status
      updateInvestmentStatus(status);
    });

  return () => subscription.unsubscribe();
}, []);

// Auto-refresh stats every 30 seconds:
useEffect(() => {
  const interval = setInterval(() => {
    loadDashboardData();
  }, 30000);

  return () => clearInterval(interval);
}, []);

// Maturity alerts:
useEffect(() => {
  const checkMaturity = async () => {
    const matured = await realTimeInvestmentTracker
      .checkMaturedInvestments();
    
    if (matured.length > 0) {
      errorHandler.handleInfo(
        `${matured.length} investments have matured`
      );
    }
  };

  const interval = setInterval(checkMaturity, 60000);
  return () => clearInterval(interval);
}, []);
```

---

## ROUTES TO ADD

**File:** `public_html/src/App.tsx`

```typescript
<Route path="/admin/subscribers" element={
  <ProtectedRoute adminOnly>
    <AdminLayout><AdminSubscribers /></AdminLayout>
  </ProtectedRoute>
} />

<Route path="/admin/messages" element={
  <ProtectedRoute adminOnly>
    <AdminLayout><AdminMessages /></AdminLayout>
  </ProtectedRoute>
} />

<Route path="/admin/settings" element={
  <ProtectedRoute adminOnly>
    <AdminLayout><AdminSettings /></AdminLayout>
  </ProtectedRoute>
} />

<Route path="/admin/search" element={
  <ProtectedRoute adminOnly>
    <AdminLayout><SearchResults /></AdminLayout>
  </ProtectedRoute>
} />
```

---

## SERVICES TO CREATE

### New Services:
1. **subscriberService.ts**
   - getAll()
   - subscribe(email)
   - unsubscribe(id)
   - exportCSV()

2. **messageService.ts**
   - getInbox(userId)
   - getSent(userId)
   - send(message)
   - markAsRead(id)
   - delete(id)

3. **settingsService.ts**
   - getAll()
   - get(key)
   - update(key, value)
   - backup()
   - restore(file)

4. **searchService.ts**
   - search(query)
   - searchProperties(query)
   - searchUsers(query)
   - searchInvestments(query)

5. **exportService.ts**
   - toPDF(type, data)
   - toExcel(type, data)
   - schedule(type, frequency)

---

## COMPONENTS TO CREATE

### Sprint 2.1 (3 components):
1. AdminSubscribers.tsx
2. AdminMessages.tsx
3. AdminSettings.tsx

### Sprint 2.2 (4 components):
4. SearchResults.tsx
5. Breadcrumbs.tsx
6. PDFExportButton.tsx
7. ExcelExportButton.tsx

**Total:** 7 new components

---

## LIBRARIES TO INSTALL

```bash
npm install jspdf jspdf-autotable xlsx
```

---

## SUCCESS METRICS

### Before Sprint 2:
- Planned Features: 25/100
- Overall Score: 69/100

### After Sprint 2:
- Planned Features: 65/100 (+40)
- Overall Score: 79/100 (+10)

### Features Added:
- Subscribers Management ✅
- Messages System ✅
- Settings Page ✅
- Global Search ✅
- Breadcrumbs ✅
- PDF Export ✅
- Excel Export ✅
- Real-time Updates ✅

---

## IMPLEMENTATION ORDER

### Day 1-2 (12 hours): Core Components
- AdminSubscribers
- AdminMessages (basic)

### Day 2-3 (8 hours): Settings
- AdminSettings
- All setting sections

### Day 3-4 (12 hours): Advanced Features
- Global Search
- Breadcrumbs
- Export utilities

### Day 4-5 (8 hours): Integration
- Real-time updates
- Export buttons
- Testing

---

## SPRINT 2 READY TO START ✅

**All dependencies ready:**
- ✅ Validation schemas
- ✅ Error handling
- ✅ Permission system
- ✅ Responsive design
- ✅ CRUD patterns established

**Target:** 79/100 (Production-ready threshold: 85/100)

**After Sprint 2, only Sprint 3 (Testing & Polish) remains to reach 85/100!**

---

## NEXT STEPS

1. Install required libraries (jspdf, xlsx)
2. Create subscriber service
3. Implement AdminSubscribers component
4. Continue with remaining components
5. Test all features
6. Move to Sprint 3

**Sprint 2 implementation plan complete!**
