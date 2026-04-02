-- Migration: Create property images table (PostgreSQL)
CREATE TABLE IF NOT EXISTS property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_property_images_property FOREIGN KEY (property_id) REFERENCES property("Id") ON DELETE CASCADE,
  CONSTRAINT chk_file_size CHECK (file_size > 0),
  CONSTRAINT chk_mime_type CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/gif'))
);

CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON property_images(is_primary);
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_images_primary_unique ON property_images(property_id) WHERE is_primary = TRUE;