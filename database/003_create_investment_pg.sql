-- Postgres migration: create `investment` table
CREATE TABLE IF NOT EXISTS public.investment (
  "Id_in" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "interest" NUMERIC(8,2) DEFAULT 0.00,
  "share_cost" NUMERIC(20,2) DEFAULT 0.00,
  "expected_inv" NUMERIC(20,2) DEFAULT 0.00,
  "current_inv" NUMERIC(20,2) DEFAULT 0.00,
  "property_id" INT,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS investment_property_idx ON public.investment ("property_id");
