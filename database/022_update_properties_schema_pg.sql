-- Migration: Update properties schema (PostgreSQL)
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

CREATE INDEX IF NOT EXISTS idx_property_featured ON property(featured);
CREATE INDEX IF NOT EXISTS idx_property_location ON property(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_property_share_cost ON property(share_cost);