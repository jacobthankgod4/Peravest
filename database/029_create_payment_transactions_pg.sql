-- Postgres migration: create `payment_transactions` table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "UserId" INT NOT NULL,
  "Type" VARCHAR(64) NOT NULL,
  "Amount" NUMERIC(20,2) NOT NULL,
  "PaystackReference" VARCHAR(255) UNIQUE,
  "Status" VARCHAR(64) NOT NULL DEFAULT 'pending',
  "Metadata" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS payment_transactions_user_idx ON public.payment_transactions ("UserId");
CREATE INDEX IF NOT EXISTS payment_transactions_status_idx ON public.payment_transactions ("Status");
CREATE INDEX IF NOT EXISTS payment_transactions_reference_idx ON public.payment_transactions ("PaystackReference");
CREATE INDEX IF NOT EXISTS payment_transactions_type_idx ON public.payment_transactions ("Type");

-- Add foreign key constraint if users table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE public.payment_transactions
    ADD CONSTRAINT fk_payment_transactions_user
    FOREIGN KEY ("UserId") REFERENCES public.users("Id")
    ON DELETE CASCADE;
  END IF;
END $$;
