# Atomic Admin Dashboard Implementation Plan
## Based on PHP Version Audit

## Current PHP Admin Dashboard Features

### 1. **Dashboard Overview**
- Total Investments Display (₦ aggregated)
- Quick Action Buttons:
  - Property Management
  - Subscribers Management
  - Messages
  - Blog

### 2. **Investors Table**
- Columns: Investments, Interest, Start Date, Duration, Status
- Shows: Property details, investor name, share cost, calculated interest
- Real-time interest calculation based on:
  - Investment amount (< ₦500k or >= ₦500k)
  - Duration (6, 12, 24, 60 months)
  - Days elapsed since start date

### 3. **Interest Calculation Logic**
```
For amounts <= ₦500,000:
- 6 months: 9.25% p.a.
- 12 months: 18.5% p.a.
- 24 months: 37% p.a.
- 60 months: 92.5% p.a.

For amounts >= ₦500,000:
- 6 months: 8.8% p.a.
- 12 months: 16% p.a.
- 24 months: 33% p.a.
- 60 months: 65% p.a.

Formula: (days_elapsed * (amount * rate) / (duration_months * 30)) + principal
```

## React Admin Dashboard Implementation

### Phase 1: Core Admin Services

#### 1. Admin Dashboard Service
```typescript
// src/services/adminDashboardService.ts
- getAdminStats() - Total investments, users, properties
- getAllInvestments() - All user investments with calculations
- getRecentActivity() - Recent transactions and activities
- getUsersList() - All registered users
- getPropertiesList() - All properties
- getSubscribersList() - Newsletter subscribers
```

#### 2. Investment Calculation Service
```typescript
// src/services/investmentCalculationService.ts
- calculateInterest(amount, duration, startDate) - Real-time interest
- calculateMaturityAmount(investment) - Final payout amount
- calculateDaysElapsed(startDate) - Days since investment
- getInterestRate(amount, duration) - Dynamic rate based on tier
```

#### 3. Admin Analytics Service
```typescript
// src/services/adminAnalyticsService.ts
- getTotalInvestments() - Aggregate all investments
- getActiveInvestors() - Count of active investors
- getPropertyPerformance() - Performance by property
- getMonthlyRevenue() - Revenue trends
- getInvestmentsByDuration() - Distribution analysis
```

### Phase 2: Admin Dashboard Components

#### 1. AdminDashboard Component
```typescript
// src/components_main/AdminDashboard.tsx
Features:
- Stats cards (Total Investments, Active Investors, Properties, Revenue)
- Quick action buttons
- Recent investments table
- Charts and analytics
- Real-time updates
```

#### 2. InvestmentsTable Component
```typescript
// src/components/admin/InvestmentsTable.tsx
Features:
- Sortable columns
- Search and filter
- Real-time interest calculation display
- Status indicators
- Export functionality
- Pagination
```

#### 3. AdminStats Component
```typescript
// src/components/admin/AdminStats.tsx
Features:
- Total investments (aggregated)
- Active investors count
- Properties count
- Monthly revenue
- Growth indicators
```

#### 4. PropertyManagement Component
```typescript
// src/components/admin/PropertyManagement.tsx
Features:
- List all properties
- Add/Edit/Delete properties
- View property investments
- Property performance metrics
```

#### 5. UserManagement Component
```typescript
// src/components/admin/UserManagement.tsx
Features:
- List all users
- User details and investments
- User status management
- KYC verification
```

### Phase 3: Database Schema for Admin

#### Admin-Specific Tables
```sql
-- Admin audit logs
CREATE TABLE admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin notifications
CREATE TABLE admin_notifications (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) NOT NULL,
    updated_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Phase 4: Admin Routes and Permissions

#### Protected Admin Routes
```typescript
// src/App.tsx additions
<Route path="/admin/dashboard" element={
  <ProtectedRoute adminOnly>
    <AdminDashboard />
  </ProtectedRoute>
} />

<Route path="/admin/investments" element={
  <ProtectedRoute adminOnly>
    <AdminInvestments />
  </ProtectedRoute>
} />

<Route path="/admin/users" element={
  <ProtectedRoute adminOnly>
    <AdminUsers />
  </ProtectedRoute>
} />

<Route path="/admin/properties" element={
  <ProtectedRoute adminOnly>
    <AdminProperties />
  </ProtectedRoute>
} />

<Route path="/admin/ajo" element={
  <ProtectedRoute adminOnly>
    <AdminAjo />
  </ProtectedRoute>
} />

<Route path="/admin/analytics" element={
  <ProtectedRoute adminOnly>
    <AdminAnalytics />
  </ProtectedRoute>
} />
```

### Phase 5: Key Features to Implement

#### 1. Real-Time Investment Tracking
- Live interest calculation
- Investment status monitoring
- Maturity date tracking
- Automatic notifications

#### 2. Ajo Group Management
- View all Ajo groups
- Monitor contribution cycles
- Track member payments
- Process payouts
- Handle defaults

#### 3. User Management
- View all users
- User investment history
- KYC verification
- Account status management
- Communication tools

#### 4. Property Management
- Add/Edit/Delete properties
- Upload images and videos
- Set investment packages
- Track property performance
- Manage availability

#### 5. Financial Reports
- Investment reports
- Revenue reports
- Payout reports
- Tax reports
- Audit trails

#### 6. Notifications System
- New investment alerts
- Withdrawal requests
- KYC submissions
- System alerts
- User messages

### Phase 6: Admin Dashboard Layout

```typescript
// Layout Structure
<AdminLayout>
  <AdminSidebar>
    - Dashboard
    - Investments
    - Properties
    - Users
    - Ajo Groups
    - Withdrawals
    - Analytics
    - Settings
  </AdminSidebar>
  
  <AdminContent>
    <AdminHeader>
      - Search
      - Notifications
      - Profile
    </AdminHeader>
    
    <AdminMain>
      {/* Dynamic content based on route */}
    </AdminMain>
  </AdminContent>
</AdminLayout>
```

### Phase 7: Implementation Priority

**Week 1: Core Services**
1. Admin dashboard service
2. Investment calculation service
3. Admin analytics service
4. Database schema updates

**Week 2: Main Dashboard**
1. AdminDashboard component
2. Stats cards
3. Investments table
4. Quick actions

**Week 3: Management Interfaces**
1. Property management
2. User management
3. Ajo group management

**Week 4: Advanced Features**
1. Analytics and reports
2. Notifications system
3. Audit logging
4. Export functionality

## Integration with Existing React App

### 1. Update AdminContext
```typescript
// src/contexts/AdminContext.tsx
- Add admin-specific state management
- Admin permissions
- Admin actions
```

### 2. Update AuthContext
```typescript
// src/contexts/AuthContext.tsx
- Add admin role checking
- Admin session management
```

### 3. Create Admin API Layer
```typescript
// src/services/adminApi.ts
- Centralized admin API calls
- Error handling
- Request interceptors
```

## Security Considerations

1. **Role-Based Access Control (RBAC)**
   - Admin-only routes
   - Permission checks on all actions
   - Audit logging

2. **Data Protection**
   - Sensitive data encryption
   - Secure API endpoints
   - Input validation

3. **Audit Trail**
   - Log all admin actions
   - Track data changes
   - Monitor suspicious activity

## Next Steps

1. ✅ Audit PHP admin dashboard (COMPLETED)
2. Create admin services layer
3. Build admin dashboard UI
4. Implement investment calculations
5. Add Ajo group management
6. Create analytics dashboard
7. Implement notifications
8. Add audit logging
9. Testing and QA
10. Deploy to production

This plan ensures the React admin dashboard has feature parity with the PHP version while adding modern improvements and atomic Ajo functionality.