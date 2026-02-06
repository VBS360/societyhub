-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create house_documents table
CREATE TABLE IF NOT EXISTS public.house_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  house_id UUID NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  category TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified')),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for house_documents
ALTER TABLE public.house_documents ENABLE ROW LEVEL SECURITY;

-- Enable RLS for house_documents
CREATE POLICY "Enable read access for society members"
ON public.house_documents
FOR SELECT
TO authenticated
USING (auth.uid() = ANY(
  SELECT user_id FROM profiles 
  WHERE society_id = house_documents.society_id
));

-- Enable insert for society admins and committee members
CREATE POLICY "Enable insert for society admins and committee members"
ON public.house_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND society_id = house_documents.society_id
    AND (role = 'society_admin' OR role = 'committee_member')
  )
);

-- Enable update for society admins and committee members
CREATE POLICY "Enable update for society admins and committee members"
ON public.house_documents
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND society_id = house_documents.society_id
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
CREATE TRIGGER update_house_documents_updated_at
BEFORE UPDATE ON public.house_documents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_house_documents_society_id ON public.house_documents(society_id);
CREATE INDEX IF NOT EXISTS idx_house_documents_house_id ON public.house_documents(house_id);
CREATE INDEX IF NOT EXISTS idx_house_documents_status ON public.house_documents(status);
