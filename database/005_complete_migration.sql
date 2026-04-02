-- Peravest Database Schema Migration - Complete

ALTER TABLE public.property ADD COLUMN "User_Id" INT;
ALTER TABLE public.property ADD COLUMN "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.property ADD COLUMN "deleted_at" TIMESTAMP;
ALTER TABLE public.property ADD COLUMN "is_deleted" BOOLEAN DEFAULT FALSE;
ALTER TABLE public.property ALTER COLUMN "Area" TYPE NUMERIC(10,2) USING CAST(COALESCE(NULLIF(regexp_replace("Area", '[^0-9.]', '', 'g'), ''), '0') AS NUMERIC);
CREATE INDEX IF NOT EXISTS property_user_idx ON public.property ("User_Id");
CREATE INDEX IF NOT EXISTS property_deleted_idx ON public.property ("is_deleted");
CREATE INDEX IF NOT EXISTS property_type_idx ON public.property ("Type");
CREATE INDEX IF NOT EXISTS property_city_idx ON public.property ("City");
CREATE INDEX IF NOT EXISTS property_state_idx ON public.property ("State");
CREATE INDEX IF NOT EXISTS property_status_idx ON public.property ("Status");
CREATE INDEX IF NOT EXISTS property_created_idx ON public.property ("created_at");
CREATE TABLE IF NOT EXISTS public.investment_package ("Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, "Property_Id" INT NOT NULL UNIQUE REFERENCES public.property("Id") ON DELETE CASCADE, "Share_Cost" NUMERIC(20,2) NOT NULL DEFAULT 5000, "Interest_Rate" NUMERIC(5,2) NOT NULL DEFAULT 25, "Period_Months" INT NOT NULL DEFAULT 6, "Max_Investors" INT NOT NULL DEFAULT 100, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS investment_package_property_idx ON public.investment_package ("Property_Id");
CREATE TABLE IF NOT EXISTS public.investment ("Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE, "User_Id" INT NOT NULL, "Amount" NUMERIC(20,2) NOT NULL, "Shares" INT NOT NULL, "Status" VARCHAR(32) NOT NULL DEFAULT 'active', "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS investment_property_idx ON public.investment ("Property_Id");
CREATE INDEX IF NOT EXISTS investment_user_idx ON public.investment ("User_Id");
CREATE INDEX IF NOT EXISTS investment_status_idx ON public.investment ("Status");
CREATE TABLE IF NOT EXISTS public.property_image ("Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE, "Image_Url" TEXT NOT NULL, "Display_Order" INT DEFAULT 0, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS property_image_property_idx ON public.property_image ("Property_Id");
