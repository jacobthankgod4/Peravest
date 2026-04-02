-- Add indexes to new tables

CREATE INDEX IF NOT EXISTS investment_package_property_idx ON public.investment_package ("Property_Id");
CREATE INDEX IF NOT EXISTS investment_property_idx ON public.investment ("Property_Id");
CREATE INDEX IF NOT EXISTS investment_user_idx ON public.investment ("User_Id");
CREATE INDEX IF NOT EXISTS investment_status_idx ON public.investment ("Status");
CREATE INDEX IF NOT EXISTS property_image_property_idx ON public.property_image ("Property_Id");
