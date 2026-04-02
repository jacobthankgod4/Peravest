# Admin Registration Guide

## Overview
Secure admin account creation with secret code verification.

## Access Admin Registration
Navigate to: `/admin/register`

## Registration Process

### 1. Required Information
- Full Name
- Email Address
- Password (minimum 8 characters)
- Confirm Password
- Admin Access Code

### 2. Admin Secret Code
The admin secret code is configured in `.env`:
```
REACT_APP_ADMIN_SECRET_CODE=PERAVEST_ADMIN_2024
```

**IMPORTANT**: Change this code in production!

### 3. Security Features
✅ Secret code verification prevents unauthorized admin creation
✅ Password strength validation (min 8 characters)
✅ Password confirmation matching
✅ Automatic User_Type set to 'admin' in database
✅ Registration logged in admin_audit_log
✅ Supabase Auth integration

### 4. After Registration
- User is redirected to login page
- Must login with created credentials
- Automatically has admin privileges
- Can access `/admin/dashboard`

## Setup Instructions

### Step 1: Set Environment Variable
Add to your `.env` file:
```bash
REACT_APP_ADMIN_SECRET_CODE=your_secure_code_here
```

### Step 2: Share Secret Code
Securely share the admin code with authorized personnel only.

### Step 3: First Admin Registration
1. Navigate to `http://localhost:3000/admin/register`
2. Fill in all required fields
3. Enter the admin secret code
4. Submit form
5. Login at `/login`
6. Access dashboard at `/admin/dashboard`

## Security Best Practices

### Production Deployment
1. **Change the default admin code** before deploying
2. Use a strong, random code (e.g., `openssl rand -base64 32`)
3. Store code securely (password manager, secrets vault)
4. Rotate code periodically
5. Limit admin registrations to trusted personnel

### Code Rotation
To change the admin code:
1. Update `REACT_APP_ADMIN_SECRET_CODE` in `.env`
2. Rebuild application: `npm run build`
3. Notify authorized personnel of new code

### Monitoring
Check admin registrations in audit log:
```sql
SELECT * FROM admin_audit_log 
WHERE action = 'ADMIN_REGISTERED' 
ORDER BY created_at DESC;
```

## Troubleshooting

### "Invalid admin access code"
- Verify code matches `.env` configuration
- Check for typos or extra spaces
- Ensure `.env` file is loaded (restart dev server)

### "Registration failed"
- Check Supabase connection
- Verify user_accounts table exists
- Check email isn't already registered

### Can't access admin dashboard after registration
- Ensure you logged in after registration
- Check User_Type is 'admin' in database:
  ```sql
  SELECT "Email", "User_Type" FROM user_accounts WHERE "Email" = 'your@email.com';
  ```

## Alternative: Manual Admin Creation

If you prefer to create admins manually:
```sql
-- First, create user via Supabase Auth dashboard
-- Then update their account:
UPDATE user_accounts 
SET "User_Type" = 'admin' 
WHERE "Email" = 'admin@example.com';
```
