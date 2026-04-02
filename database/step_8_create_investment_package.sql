-- Step 8: Create investment_package table
CREATE TABLE IF NOT EXISTS public.investment_package (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL UNIQUE REFERENCES public.property("Id") ON DELETE CASCADE,
  "Share_Cost" NUMERIC(20,2) NOT NULL DEFAULT 5000,
  "Interest_Rate" NUMERIC(5,2) NOT NULL DEFAULT 25,
  "Period_Months" INT NOT NULL DEFAULT 6,
  "Max_Investors" INT NOT NULL DEFAULT 100,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS investment_package_property_idx ON public.investment_package ("Property_Id");
