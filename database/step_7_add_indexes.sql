-- Step 7: Add indexes to property table
CREATE INDEX IF NOT EXISTS property_user_idx ON public.property ("User_Id");
CREATE INDEX IF NOT EXISTS property_deleted_idx ON public.property ("is_deleted");
CREATE INDEX IF NOT EXISTS property_type_idx ON public.property ("Type");
CREATE INDEX IF NOT EXISTS property_city_idx ON public.property ("City");
CREATE INDEX IF NOT EXISTS property_state_idx ON public.property ("State");
CREATE INDEX IF NOT EXISTS property_status_idx ON public.property ("Status");
CREATE INDEX IF NOT EXISTS property_created_idx ON public.property ("created_at");
