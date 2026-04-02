# Vercel Deployment Guide

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Environment variables configured

## Deployment Steps

### 1. Connect Repository to Vercel
1. Go to https://vercel.com/new
2. Import the GitHub repository
3. Select "Other" as the framework

### 2. Configure Build Settings
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3. Set Environment Variables
In Vercel Project Settings → Environment Variables, add:

**Frontend Variables:**
- `VITE_API_URL` - Your API endpoint (e.g., `https://your-domain.vercel.app/api`)
- `VITE_APP_NAME` - `Peravest`
- `VITE_APP_VERSION` - `1.0.0`
- `VITE_PAYSTACK_PUBLIC_KEY` - Your Paystack public key

**Backend Variables:**
- `DATABASE_URL` - Your database connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PAYSTACK_SECRET_KEY` - Your Paystack secret key
- `NODE_ENV` - `production`

### 4. Deploy
Click "Deploy" - Vercel will automatically:
1. Build the React frontend
2. Deploy serverless backend functions
3. Set up API routes at `/api/*`

## Project Structure for Vercel

```
/
├── src/                    # React frontend
├── backend/               # Node.js backend
├── api/                   # Vercel serverless functions
├── public/                # Static assets
├── package.json           # Frontend dependencies
├── vercel.json           # Vercel configuration
└── vite.config.ts        # Vite build config
```

## API Routes
- Frontend: `https://your-domain.vercel.app`
- Backend API: `https://your-domain.vercel.app/api/*`

## Database Setup
1. Create a PostgreSQL database (Supabase, Railway, or similar)
2. Run migrations from `database/` folder
3. Set `DATABASE_URL` environment variable

## Troubleshooting

### Build Fails
- Check `npm run build` works locally
- Verify all dependencies in `package.json`

### API Not Working
- Check `VITE_API_URL` matches your Vercel domain
- Verify backend environment variables are set
- Check `api/index.js` is properly configured

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure database is accessible from Vercel
- Check firewall/security group settings

## Local Development

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start frontend (port 5173)
npm run dev

# Start backend (port 3000) - in another terminal
cd backend && npm start
```

## Production Monitoring
- Monitor Vercel deployments at https://vercel.com/dashboard
- Check function logs in Vercel dashboard
- Set up error tracking (Sentry, LogRocket, etc.)
