-- Postgres migration: create `property` table
CREATE TABLE IF NOT EXISTS public.property (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Title" VARCHAR(255) NOT NULL,
  "Type" VARCHAR(64),
  "Status" VARCHAR(64) NOT NULL DEFAULT 'active',
  "Address" VARCHAR(255),
  "City" VARCHAR(128),
  "State" VARCHAR(128),
  "Zip_Code" VARCHAR(32),
  "Description" TEXT,
  "Price" NUMERIC(20,2) DEFAULT 0.00,
  "Area" VARCHAR(64),
  "Ammenities" TEXT,
  "Bedroom" INT,
  "Bathroom" INT,
  "Built_Year" INT,
  "Images" TEXT,
  "Video" VARCHAR(255),
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS property_status_idx ON public.property ("Status");
