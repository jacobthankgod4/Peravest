-- Postgres migration: add foreign key constraints (safe, idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_investment_property'
  ) THEN
    ALTER TABLE public.investment
      ADD CONSTRAINT fk_investment_property FOREIGN KEY ("property_id") REFERENCES public.property ("Id") ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_invest_now_user'
  ) THEN
    ALTER TABLE public.invest_now
      ADD CONSTRAINT fk_invest_now_user FOREIGN KEY ("Usa_Id") REFERENCES public.users ("Id") ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_invest_now_package'
  ) THEN
    ALTER TABLE public.invest_now
      ADD CONSTRAINT fk_invest_now_package FOREIGN KEY ("package_id") REFERENCES public.investment ("Id_in") ON DELETE SET NULL;
  END IF;
END$$;
