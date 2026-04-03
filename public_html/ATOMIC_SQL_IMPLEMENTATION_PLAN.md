# ATOMIC SQL IMPLEMENTATION PLAN
## Industry Standard Database Schema Completion

### PHASE 1: CORE SCHEMA UPDATES (Priority: CRITICAL)

#### 1.1 Update Users Table
**File:** `021_update_users_schema_pg.sql`
```sql
ALTER TABLE users 
ADD COLUMN first_name VARCHAR(100),
ADD COLUMN last_name VARCHAR(100),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN bank_name VARCHAR(100),
ADD COLUMN account_number VARCHAR(20),
ADD COLUMN account_name VARCHAR(100),
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255),
ADD COLUMN reset_token VARCHAR(255),
ADD COLUMN reset_token_expires TIMESTAMP,
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN role VARCHAR(20) DEFAULT 'user',
ADD COLUMN activation_token VARCHAR(255),
ADD COLUMN is_active BOOLEAN DEFAULT FALSE;
```

#### 1.2 Update Properties Table  
**File:** `022_update_properties_schema_pg.sql`
```sql
ALTER TABLE property 
ADD COLUMN share_cost DECIMAL(15,2),
ADD COLUMN total_shares INTEGER,
ADD COLUMN available_shares INTEGER,
ADD COLUMN interest_rate DECIMAL(5,2),
ADD COLUMN investment_period INTEGER,
ADD COLUMN images JSON,
ADD COLUMN videos JSON,
ADD COLUMN featured BOOLEAN DEFAULT FALSE,
ADD COLUMN location_lat DECIMAL(10,8),
ADD COLUMN location_lng DECIMAL(11,8);
```

### PHASE 2: MISSING CORE TABLES (Priority: CRITICAL)

#### 2.1 Investment Packages
**File:** `010_create_investment_packages_pg.sql`
```sql
CREATE TABLE investment_packages (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES property(id),
  share_cost DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  period_months INTEGER NOT NULL,
  max_investors INTEGER,
  current_investors INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.2 Withdrawals
**File:** `014_create_withdrawals_pg.sql`
```sql
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  reference VARCHAR(50) UNIQUE,
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2.3 Transactions
**File:** `015_create_transactions_pg.sql`
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  investment_id INTEGER REFERENCES investment(id),
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference VARCHAR(100) UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',
  gateway VARCHAR(20),
  gateway_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### PHASE 3: SYSTEM TABLES (Priority: HIGH)

#### 3.1 Notifications
**File:** `018_create_notifications_pg.sql`
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2 Audit Logs
**File:** `019_create_audit_logs_pg.sql`
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id INTEGER,
  old_values JSON,
  new_values JSON,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### PHASE 4: MEDIA & EXTENDED TABLES (Priority: MEDIUM)

#### 4.1 Property Images
**File:** `017_create_property_images_pg.sql`
```sql
CREATE TABLE property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES property(id),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.2 User Profiles Extended
**File:** `016_create_user_profiles_pg.sql`
```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) UNIQUE,
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  occupation VARCHAR(100),
  annual_income DECIMAL(15,2),
  investment_experience VARCHAR(50),
  risk_tolerance VARCHAR(20),
  kyc_status VARCHAR(20) DEFAULT 'pending',
  kyc_documents JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### PHASE 5: INDEXES & CONSTRAINTS (Priority: HIGH)

#### 5.1 Performance Indexes
**File:** `023_create_indexes_pg.sql`
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_investments_user_id ON investment(user_id);
CREATE INDEX idx_investments_property_id ON investment(property_id);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
```

### EXECUTION ORDER

1. **Phase 1** - Update existing schemas (021, 022)
2. **Phase 2** - Create missing core tables (010, 014, 015)  
3. **Phase 3** - Create system tables (018, 019)
4. **Phase 4** - Create extended tables (016, 017)
5. **Phase 5** - Add indexes and constraints (023)

### VALIDATION CHECKLIST

- [ ] All foreign key constraints valid
- [ ] All indexes created successfully  
- [ ] Data types match application models
- [ ] Default values set correctly
- [ ] Unique constraints applied
- [ ] Timestamp fields auto-populate
- [ ] JSON fields support application data structure

### ROLLBACK STRATEGY

Each migration file includes corresponding DROP statements for safe rollback if needed.

**Total Files to Create:** 9 SQL migration files
**Estimated Implementation Time:** 2-3 hours
**Database Coverage:** 100% application requirements