-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20),
  "subject" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "read" BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS contact_messages_email_idx ON public.contact_messages ("email");
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages ("created_at");
CREATE INDEX IF NOT EXISTS contact_messages_read_idx ON public.contact_messages ("read");
