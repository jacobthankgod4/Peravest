# Property Investment Platform - Backend

A Node.js/Express backend for a property investment platform with user authentication, property management, and investment tracking.

## Features

- User authentication (register, login, email verification)
- Property listing and management
- Investment processing with Paystack integration
- Admin dashboard for user and property management
- Email notifications
- JWT-based authentication
- PostgreSQL database integration

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Database setup:**
   - Install PostgreSQL
   - Create a database named `property_investment`
   - Run the database schema (see Database Schema section)

3. **Environment configuration:**
   - Copy `.env.example` to `.env`
   - Update all environment variables with your actual values

4. **Start the server:**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    expected_return DECIMAL(5,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    images JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    payment_reference VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify/:token` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get single property

### Investments
- `POST /api/investments` - Create investment
- `POST /api/investments/verify` - Verify payment
- `GET /api/investments/user` - Get user investments

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/investments` - Get user investments

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/properties` - Get all properties
- `POST /api/admin/properties` - Create property
- `PUT /api/admin/properties/:id` - Update property
- `DELETE /api/admin/properties/:id` - Delete property
- `GET /api/admin/investments` - Get all investments
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/stats` - Get dashboard stats

## Environment Variables

See `.env.example` for all required environment variables.

## Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **nodemailer** - Email service
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **axios** - HTTP client for Paystack integration

## License

MIT