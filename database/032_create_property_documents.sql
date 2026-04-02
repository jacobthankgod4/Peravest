-- Migration: Create property_documents table
-- Stores documents like floor plans, title deeds, valuation reports, etc.

CREATE TABLE IF NOT EXISTS public.property_documents (
  "Id" SERIAL PRIMARY KEY,
  "Property_Id" INT NOT NULL REFERENCES public.property("Id") ON DELETE CASCADE,
  "Document_Name" VARCHAR(255) NOT NULL,
  "Document_Type" VARCHAR(100) NOT NULL, -- 'Floor Plan', 'Title Deed', 'Valuation Report', 'Survey Plan', 'Other'
  "Document_Url" TEXT NOT NULL,
  "File_Size" BIGINT, -- in bytes
  "Upload_Date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "Display_Order" INT DEFAULT 0,
  "Is_Public" BOOLEAN DEFAULT TRUE, -- whether visible to all or only investors
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_documents_property_id ON public.property_documents("Property_Id");
CREATE INDEX IF NOT EXISTS idx_property_documents_type ON public.property_documents("Document_Type");
