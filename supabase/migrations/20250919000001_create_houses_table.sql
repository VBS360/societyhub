-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create houses table
CREATE TABLE IF NOT EXISTS public.houses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  unit VARCHAR(20) NOT NULL,
  block VARCHAR(10),
  floor VARCHAR(10),
  owner_name VARCHAR(255),
  contact_number VARCHAR(20),
  email VARCHAR(255),
  area_sqft NUMERIC(10, 2),
  is_rented BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_house_per_society UNIQUE (society_id, unit, block)
);

-- Add RLS policies for houses
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;

-- Enable read access for society members
CREATE POLICY "Enable read access for society members"
ON public.houses
FOR SELECT
TO authenticated
USING (auth.uid() = ANY(
  SELECT user_id FROM profiles 
  WHERE society_id = houses.society_id
));

-- Enable insert for society admins and committee members
CREATE POLICY "Enable insert for society admins and committee members"
ON public.houses
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND society_id = houses.society_id
    AND (role = 'society_admin' OR role = 'committee_member')
  )
);

-- Enable update for society admins and committee members
CREATE POLICY "Enable update for society admins and committee members"
ON public.houses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND society_id = houses.society_id
    AND (role = 'society_admin' OR role = 'committee_member')
  )
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column
CREATE TRIGGER update_houses_updated_at
BEFORE UPDATE ON public.houses
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_houses_society_id ON public.houses(society_id);
CREATE INDEX IF NOT EXISTS idx_houses_unit ON public.houses(unit);
CREATE INDEX IF NOT EXISTS idx_houses_block ON public.houses(block);
