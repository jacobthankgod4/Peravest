# Peravest Admin Platform - Implementation Plan

## Overview
Complete implementation roadmap for transforming Peravest into an industry-standard real estate investment platform.

**Timeline:** 12 weeks (3 months)  
**Team:** 2-3 developers, 1 designer, 1 QA  
**Methodology:** Agile (2-week sprints)

---

## Phase 1: Critical Operations (Week 1-2) 🔴

### 1.1 Withdrawal Management

#### Database Schema
```sql
-- Already exists in: database/migrations/008_key_features_schema.sql
-- Table: withdrawals
-- Status flow: pending → approved/rejected → completed
```

#### Components to Create
```
src/components/admin/WithdrawalApproval.tsx
src/components/admin/WithdrawalModal.tsx
src/services/withdrawalAdminService.ts
```

#### Features
- [ ] Approve withdrawal button
- [ ] Reject withdrawal with reason modal
- [ ] Process payment integration
- [ ] Withdrawal history table
- [ ] Bulk approval checkbox
- [ ] Email notification trigger

#### Code Reference
```typescript
// src/services/withdrawalAdminService.ts
export const withdrawalAdminService = {
  async approveWithdrawal(id: number, adminId: number) {
    const { data, error } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq('id', id);
    return { data, error };
  },
  
  async rejectWithdrawal(id: number, adminId: number, reason: string) {
    const { data, error } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'rejected',
        rejected_by: adminId,
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', id);
    return { data, error };
  }
};
```

#### Existing Files to Modify
- `src/components/admin/AdminWithdrawals.tsx` - Add action buttons
- `src/services/adminDashboardService.ts` - Add withdrawal methods

---

### 1.2 KYC Verification

#### Database Schema
```sql
-- Already exists in: database/migrations/008_key_features_schema.sql
-- Table: kyc_documents
-- Status: pending → under_review → approved/rejected
```

#### Components to Create
```
src/components/admin/KYCDocumentViewer.tsx
src/components/admin/KYCApprovalModal.tsx
src/services/kycAdminService.ts
```

#### Features
- [ ] Document viewer modal (image/PDF)
- [ ] Approve/Reject buttons
- [ ] Rejection reason textarea
- [ ] Request additional documents
- [ ] Verification history timeline
- [ ] Bulk verification
- [ ] Auto-email on status change

#### Code Reference
```typescript
// src/services/kycAdminService.ts
export const kycAdminService = {
  async approveKYC(id: number, adminId: number) {
    const { data, error } = await supabase
      .from('kyc_documents')
      .update({ 
        status: 'approved',
        verified_by: adminId,
        verified_at: new Date().toISOString()
      })
      .eq('id', id);
    
    // Update user_accounts
    if (!error && data) {
      await supabase
        .from('user_accounts')
        .update({ kyc_verified: true })
        .eq('Id', data.user_id);
    }
    return { data, error };
  }
};
```

#### Existing Files to Modify
- `src/components/admin/AdminKYC.tsx` - Add viewer and actions

---

### 1.3 Property Actions

#### Components to Create
```
src/components/admin/PropertyActions.tsx
src/components/admin/DeletePropertyModal.tsx
src/services/propertyAdminService.ts
```

#### Features
- [ ] Delete property (with confirmation)
- [ ] Publish/Unpublish toggle
- [ ] Archive property
- [ ] Duplicate property
- [ ] Property status badge

#### Code Reference
```typescript
// src/services/propertyAdminService.ts
export const propertyAdminService = {
  async deleteProperty(id: number) {
    const { error } = await supabase
      .from('property')
      .delete()
      .eq('Id', id);
    return { error };
  },
  
  async togglePublish(id: number, status: 'active' | 'inactive') {
    const { data, error } = await supabase
      .from('property')
      .update({ Status: status })
      .eq('Id', id);
    return { data, error };
  }
};
```

#### Existing Files to Modify
- `src/components/admin/AdminPropertyManagement.tsx` - Add action buttons

---

## Phase 2: User & Investment Management (Week 3-4) 🟡

### 2.1 User Management

#### Components to Create
```
src/components/admin/UserDetailModal.tsx
src/components/admin/UserActions.tsx
src/components/admin/UserActivityTimeline.tsx
src/services/userAdminService.ts
```

#### Features
- [ ] User detail modal
- [ ] Suspend/Activate toggle
- [ ] View user investments
- [ ] Activity timeline
- [ ] Manual KYC override
- [ ] Send notification
- [ ] Export user data

#### Code Reference
```typescript
// src/services/userAdminService.ts
export const userAdminService = {
  async suspendUser(userId: number, reason: string) {
    const { data, error } = await supabase
      .from('user_accounts')
      .update({ 
        status: 'suspended',
        suspension_reason: reason,
        suspended_at: new Date().toISOString()
      })
      .eq('Id', userId);
    return { data, error };
  },
  
  async getUserInvestments(userId: number) {
    const { data, error } = await supabase
      .from('invest_now')
      .select('*, investment(*), property(*)')
      .eq('Usa_Id', userId);
    return { data, error };
  }
};
```

#### Existing Files to Modify
- `src/components/admin/AdminUserManagement.tsx` - Add actions

---

### 2.2 Investment Management

#### Components to Create
```
src/components/admin/InvestmentDetailModal.tsx
src/components/admin/InvestmentActions.tsx
src/services/investmentAdminService.ts
```

#### Features
- [ ] Investment detail modal
- [ ] Cancel investment
- [ ] Refund investment
- [ ] Status tracking
- [ ] Interest adjustment
- [ ] Add notes/comments

#### Code Reference
```typescript
// src/services/investmentAdminService.ts
export const investmentAdminService = {
  async cancelInvestment(id: number, refundAmount: number) {
    // Update investment status
    await supabase
      .from('invest_now')
      .update({ status: 'cancelled' })
      .eq('Id_invest', id);
    
    // Process refund
    await supabase
      .from('withdrawals')
      .insert({
        user_id: userId,
        amount: refundAmount,
        status: 'approved',
        transaction_reference: `REFUND-${id}`
      });
  }
};
```

---

## Phase 3: Financial Management (Week 5-6) 💰

### 3.1 Revenue Dashboard

#### Components to Create
```
src/components/admin/RevenueDashboard.tsx
src/components/admin/RevenueChart.tsx
src/services/revenueService.ts
```

#### Features
- [ ] Total revenue chart
- [ ] Revenue by product
- [ ] Monthly/Quarterly/Yearly views
- [ ] Revenue forecasting
- [ ] Profit margin calculator

#### Database Schema
```sql
-- Create new migration: 009_financial_tracking.sql
CREATE TABLE revenue_tracking (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  product_type VARCHAR(50),
  amount DECIMAL(15,2),
  commission DECIMAL(15,2),
  net_revenue DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Phase 4: Analytics & Reporting (Week 7-8) 📊

### 4.1 Advanced Analytics

#### Components to Create
```
src/components/admin/AnalyticsDashboard.tsx
src/components/admin/UserGrowthChart.tsx
src/components/admin/InvestmentTrendsChart.tsx
```

#### Libraries to Install
```bash
npm install recharts date-fns
npm install @types/recharts --save-dev
```

---

## Phase 5: Content & Settings (Week 9-10) ⚙️

### 5.1 Content Management

#### Components to Create
```
src/components/admin/BlogManager.tsx
src/components/admin/FAQManager.tsx
src/components/admin/TestimonialManager.tsx
```

#### Database Schema
```sql
-- Create new migration: 010_content_management.sql
CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  content TEXT,
  author_id INTEGER,
  status VARCHAR(20),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Phase 6: Advanced Features (Week 11-12) 🚀

### 6.1 Automation

#### Components to Create
```
src/services/automationService.ts
src/workers/autoApprovalWorker.ts
```

#### Features
- [ ] Auto-approve KYC (AI-based)
- [ ] Auto-process withdrawals
- [ ] Auto-send reminders
- [ ] Auto-generate reports

---

## File Structure

```
Peravest/
├── src/
│   ├── components/
│   │   └── admin/
│   │       ├── AdminDashboard.tsx ✅
│   │       ├── AdminPropertyManagement.tsx ✅
│   │       ├── AdminUserManagement.tsx ✅
│   │       ├── AdminWithdrawals.tsx ✅
│   │       ├── AdminKYC.tsx ✅
│   │       ├── WithdrawalApproval.tsx ❌
│   │       ├── KYCDocumentViewer.tsx ❌
│   │       ├── UserDetailModal.tsx ❌
│   │       └── RevenueDashboard.tsx ❌
│   ├── services/
│   │   ├── adminDashboardService.ts ✅
│   │   ├── withdrawalAdminService.ts ❌
│   │   ├── kycAdminService.ts ❌
│   │   ├── userAdminService.ts ❌
│   │   └── revenueService.ts ❌
│   └── database/
│       └── migrations/
│           ├── 008_key_features_schema.sql ✅
│           ├── 009_financial_tracking.sql ❌
│           └── 010_content_management.sql ❌
```

---

## Testing Strategy

### Unit Tests
```typescript
// __tests__/services/withdrawalAdminService.test.ts
describe('withdrawalAdminService', () => {
  it('should approve withdrawal', async () => {
    const result = await withdrawalAdminService.approveWithdrawal(1, 1);
    expect(result.error).toBeNull();
  });
});
```

### Integration Tests
```typescript
// __tests__/integration/withdrawal-flow.test.ts
describe('Withdrawal Approval Flow', () => {
  it('should complete full approval workflow', async () => {
    // Test end-to-end flow
  });
});
```

---

## Deployment Checklist

- [ ] Run database migrations
- [ ] Update environment variables
- [ ] Test on staging
- [ ] Run security audit
- [ ] Update documentation
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Verify email notifications

---

## Success Metrics

**Phase 1:**
- ✅ 100% withdrawal approval within 24 hours
- ✅ 100% KYC verification within 48 hours
- ✅ 0 property management errors

**Phase 2:**
- ✅ 50% reduction in support tickets
- ✅ 100% investment tracking accuracy

**Phase 3:**
- ✅ Real-time financial visibility
- ✅ Automated monthly reports

---

## Next Steps

1. Review this plan
2. Prioritize phases
3. Assign resources
4. Set specific dates
5. Begin Phase 1

**Ready to start implementation?**
