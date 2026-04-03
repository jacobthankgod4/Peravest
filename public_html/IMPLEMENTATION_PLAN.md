# ATOMIC IMPLEMENTATION PLAN
## PHP to React + Node.js Migration

---

# PHASE 1: BACKEND API DEVELOPMENT

## 1.1 Project Setup & Infrastructure
### 1.1.1 Initialize Node.js Backend
- [ ] Create `backend/` directory
- [ ] Initialize `package.json` with Express.js
- [ ] Set up TypeScript configuration
- [ ] Configure environment variables (.env)
- [ ] Set up folder structure: `/routes`, `/controllers`, `/models`, `/middleware`

### 1.1.2 Database Connection Setup
- [ ] Install database driver (MySQL/PostgreSQL)
- [ ] Create database connection pool
- [ ] Set up migration system (Knex.js/Prisma)
- [ ] Create database schema from existing PHP structure

## 1.2 Core API Endpoints
### 1.2.1 Property Management APIs
- [ ] `GET /api/properties` - List all properties
- [ ] `GET /api/properties/:id` - Get property details
- [ ] `GET /api/properties/search` - Search properties
- [ ] `POST /api/properties` - Create property (admin)
- [ ] `PUT /api/properties/:id` - Update property (admin)

### 1.2.2 User Management APIs
- [ ] `POST /api/users/register` - User registration
- [ ] `POST /api/users/login` - User login
- [ ] `GET /api/users/profile` - Get user profile
- [ ] `PUT /api/users/profile` - Update user profile
- [ ] `POST /api/users/forgot-password` - Password reset request
- [ ] `POST /api/users/reset-password` - Password reset

### 1.2.3 Investment APIs
- [ ] `GET /api/investments` - User investments
- [ ] `POST /api/investments` - Create investment
- [ ] `GET /api/investments/:id` - Investment details
- [ ] `PUT /api/investments/:id/status` - Update investment status

### 1.2.4 Payment APIs
- [ ] `POST /api/payments/initialize` - Initialize Paystack payment
- [ ] `POST /api/payments/verify` - Verify payment
- [ ] `GET /api/payments/history` - Payment history

---

# PHASE 2: AUTHENTICATION SYSTEM

## 2.1 JWT Implementation
### 2.1.1 JWT Setup
- [ ] Install `jsonwebtoken` and `bcryptjs`
- [ ] Create JWT utility functions (sign, verify, refresh)
- [ ] Set up JWT middleware for protected routes
- [ ] Configure token expiration (15min access, 7d refresh)

### 2.1.2 Authentication Middleware
- [ ] Create `authMiddleware.js` for token validation
- [ ] Create `roleMiddleware.js` for admin/user roles
- [ ] Implement rate limiting for auth endpoints
- [ ] Add CORS configuration

### 2.1.3 Session Migration
- [ ] Replace PHP `$_SESSION['user_id']` with JWT payload
- [ ] Replace PHP `$_SESSION['admin_id']` with JWT roles
- [ ] Update all session checks to JWT validation

---

# PHASE 3: STATE MANAGEMENT

## 3.1 Context API Setup (Minimal Approach)
### 3.1.1 Authentication Context
- [ ] Create `AuthContext` for user state
- [ ] Implement `useAuth` hook
- [ ] Add login/logout/register actions
- [ ] Handle token refresh logic

### 3.1.2 Investment Context
- [ ] Create `InvestmentContext` for investment data
- [ ] Implement `useInvestment` hook
- [ ] Add investment CRUD operations
- [ ] Handle investment calculations (ROI, VAT)

### 3.1.3 Property Context
- [ ] Create `PropertyContext` for property data
- [ ] Implement `useProperties` hook
- [ ] Add property filtering and search
- [ ] Handle property loading states

---

# PHASE 4: PAYMENT INTEGRATION

## 4.1 Paystack SDK Configuration
### 4.1.1 Backend Integration
- [ ] Install Paystack Node.js SDK
- [ ] Configure Paystack secret key
- [ ] Create payment initialization endpoint
- [ ] Create payment verification endpoint

### 4.1.2 Frontend Integration
- [ ] Install `react-paystack`
- [ ] Create `PaystackButton` component
- [ ] Handle payment success/failure callbacks
- [ ] Update investment status after payment

### 4.1.3 Payment Flow
- [ ] Replace PHP Paystack integration in `checkout.php`
- [ ] Update payment verification logic
- [ ] Add payment history tracking
- [ ] Implement refund handling

---

# PHASE 5: DATABASE INTEGRATION

## 5.1 API Connection Layer
### 5.1.1 HTTP Client Setup
- [ ] Install and configure Axios
- [ ] Create API base configuration
- [ ] Add request/response interceptors
- [ ] Handle authentication headers

### 5.1.2 API Service Layer
- [ ] Create `authService.js` for authentication APIs
- [ ] Create `propertyService.js` for property APIs
- [ ] Create `investmentService.js` for investment APIs
- [ ] Create `paymentService.js` for payment APIs

### 5.1.3 Data Migration
- [ ] Map existing PHP database queries to API calls
- [ ] Replace direct database access with API calls
- [ ] Update all components to use API services
- [ ] Handle loading and error states

---

# PHASE 6: TESTING & DEPLOYMENT

## 6.1 Testing Setup
### 6.1.1 Backend Testing
- [ ] Install Jest and Supertest
- [ ] Create API endpoint tests
- [ ] Add authentication middleware tests
- [ ] Test database operations

### 6.1.2 Frontend Testing
- [ ] Install React Testing Library
- [ ] Create component unit tests
- [ ] Add integration tests for user flows
- [ ] Test API service functions

### 6.1.3 End-to-End Testing
- [ ] Install Cypress or Playwright
- [ ] Create user registration flow test
- [ ] Create investment flow test
- [ ] Create payment flow test

## 6.2 CI/CD Pipeline
### 6.2.1 GitHub Actions Setup
- [ ] Create `.github/workflows/ci.yml`
- [ ] Add automated testing on PR
- [ ] Add build verification
- [ ] Add deployment automation

### 6.2.2 Deployment Configuration
- [ ] Set up production environment variables
- [ ] Configure database connection for production
- [ ] Set up SSL certificates
- [ ] Configure domain and DNS

---

# IMPLEMENTATION PRIORITY ORDER

## Week 1-2: Foundation
1. **Phase 1.1**: Project setup and database connection
2. **Phase 2.1**: Basic JWT authentication
3. **Phase 1.2.2**: User management APIs

## Week 3-4: Core Features
1. **Phase 1.2.1**: Property management APIs
2. **Phase 3.1**: Context API setup
3. **Phase 5.1**: API integration in React components

## Week 5-6: Advanced Features
1. **Phase 1.2.3**: Investment APIs
2. **Phase 4.1**: Paystack integration
3. **Phase 1.2.4**: Payment APIs

## Week 7-8: Quality & Deployment
1. **Phase 6.1**: Testing implementation
2. **Phase 6.2**: CI/CD setup
3. Final integration and deployment

---

# CRITICAL SUCCESS FACTORS

## Technical Requirements
- [ ] Maintain 100% feature parity with PHP version
- [ ] Ensure zero data loss during migration
- [ ] Implement proper error handling and logging
- [ ] Maintain existing database schema compatibility

## Performance Requirements
- [ ] API response time < 200ms
- [ ] Frontend load time < 3 seconds
- [ ] Handle concurrent users (existing PHP capacity)
- [ ] Implement proper caching strategies

## Security Requirements
- [ ] JWT token security (HTTPS only, secure storage)
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Rate limiting on sensitive endpoints

---

# ROLLBACK STRATEGY

## Phase-by-Phase Rollback
1. **Database**: Keep existing PHP database structure intact
2. **APIs**: Run both PHP and Node.js in parallel during transition
3. **Frontend**: Feature flags to switch between PHP and React components
4. **Payments**: Test payments in sandbox before live migration

## Risk Mitigation
- [ ] Complete backup of existing PHP application
- [ ] Database migration scripts with rollback capability
- [ ] Staged deployment (dev → staging → production)
- [ ] User acceptance testing before full deployment

---

This atomic plan ensures minimal risk while systematically replacing each PHP component with modern React + Node.js equivalents.