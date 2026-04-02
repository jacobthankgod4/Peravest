# Supabase Database Setup

## 1. Create Supabase Project
- Go to https://supabase.com
- Create new project
- Copy URL and anon key to `.env`

## 2. Create Properties Table

```sql
CREATE TABLE properties (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT,
  images TEXT[] DEFAULT '{}',
  video TEXT,
  description TEXT,
  price BIGINT NOT NULL,
  area INTEGER,
  bedroom INTEGER,
  bathroom INTEGER,
  built_year TEXT,
  amenities TEXT,
  status TEXT NOT NULL DEFAULT 'investment',
  share_cost BIGINT NOT NULL,
  expected_investment BIGINT NOT NULL,
  current_investment BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON properties
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert" ON properties
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON properties
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON properties
  FOR DELETE USING (auth.role() = 'authenticated');
```

## 3. Update .env

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Data Flow

```
Admin → AddProperty Form → supabase.from('properties').insert()
                                    ↓
                            PostgreSQL Database
                                    ↓
Home Page → supabase.from('properties').select() → Display
```

## Features

✅ Real PostgreSQL database
✅ Multi-user support
✅ Real-time updates (optional)
✅ File storage for images
✅ Row-level security
✅ Automatic backups
✅ Free tier: 500MB database, 1GB file storage

## Production Ready

- Admin creates properties → Saved to Supabase
- Users see properties → Fetched from Supabase
- Data persists across all devices
- Scalable to millions of records
