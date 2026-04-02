-- Postgres migration: create `invest_now` table
CREATE TABLE IF NOT EXISTS public.invest_now (
  "Id_invest" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Usa_Id" INT NOT NULL,
  "proptee_id" INT,
  "package_id" INT,
  "start_date" TIMESTAMP,
  "period" INT,
  "interest" NUMERIC(8,2) DEFAULT 0.00,
  "share_cost" NUMERIC(20,2) DEFAULT 0.00,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS invest_now_user_idx ON public.invest_now ("Usa_Id");
CREATE INDEX IF NOT EXISTS invest_now_package_idx ON public.invest_now ("package_id");
