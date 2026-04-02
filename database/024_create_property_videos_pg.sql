-- Migration: Create property_videos table (PostgreSQL)
CREATE TABLE IF NOT EXISTS property_videos (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  video_type VARCHAR(20) DEFAULT 'mp4',
  title VARCHAR(200),
  description TEXT,
  duration INTEGER,
  file_size BIGINT,
  thumbnail_url VARCHAR(500),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_property_videos_property FOREIGN KEY (property_id) REFERENCES property("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_property_videos_property_id ON property_videos(property_id);
CREATE INDEX IF NOT EXISTS idx_property_videos_is_primary ON property_videos(is_primary);