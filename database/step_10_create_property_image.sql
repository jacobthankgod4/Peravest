-- Step 10: Create property_image table
CREATE TABLE IF NOT EXISTS public.property_image (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "Image_Url" TEXT NOT NULL,
  "Display_Order" INT DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS property_image_property_idx ON public.property_image ("Property_Id");
