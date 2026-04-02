-- Postgres migration: create `subscribers` table
CREATE TABLE IF NOT EXISTS public.subscribers (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Subscribers" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_idx ON public.subscribers ("Subscribers");
