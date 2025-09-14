-- Create family_members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  date_of_birth TIMESTAMPTZ NOT NULL,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(vehicle_number, society_id)
);

-- Create member_documents table
CREATE TABLE IF NOT EXISTS public.member_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_documents ENABLE ROW LEVEL SECURITY;

-- Create function to delete family members
CREATE OR REPLACE FUNCTION public.delete_family_members(p_member_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM public.family_members WHERE member_id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to insert multiple family members
CREATE OR REPLACE FUNCTION public.insert_family_members(members JSONB[])
RETURNS void AS $$
BEGIN
  INSERT INTO public.family_members (
    member_id, name, relation, date_of_birth, society_id
  )
  SELECT 
    (member->>'member_id')::UUID,
    member->>'name',
    member->>'relation',
    (member->>'date_of_birth')::TIMESTAMPTZ,
    (member->>'society_id')::UUID
  FROM unnest(members) AS member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete vehicles
CREATE OR REPLACE FUNCTION public.delete_vehicles(p_member_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM public.vehicles WHERE member_id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to insert multiple vehicles
CREATE OR REPLACE FUNCTION public.insert_vehicles(vehicles JSONB[])
RETURNS void AS $$
BEGIN
  INSERT INTO public.vehicles (
    member_id, vehicle_number, society_id
  )
  SELECT 
    (vehicle->>'member_id')::UUID,
    vehicle->>'vehicle_number',
    (vehicle->>'society_id')::UUID
  FROM unnest(vehicles) AS vehicle;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to delete member documents
CREATE OR REPLACE FUNCTION public.delete_member_documents(p_member_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM public.member_documents WHERE member_id = p_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to insert a member document
CREATE OR REPLACE FUNCTION public.insert_member_document(document JSONB)
RETURNS void AS $$
BEGIN
  INSERT INTO public.member_documents (
    member_id, file_name, file_path, file_url, file_type, file_size, society_id
  ) VALUES (
    (document->>'member_id')::UUID,
    document->>'file_name',
    document->>'file_path',
    document->>'file_url',
    document->>'file_type',
    (document->>'file_size')::INTEGER,
    (document->>'society_id')::UUID
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for family_members
CREATE POLICY "Enable read access for authenticated users" 
ON public.family_members 
FOR SELECT 
TO authenticated 
USING (auth.uid() = member_id OR auth.uid() IN (
  SELECT id FROM public.profiles 
  WHERE society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid())
  AND role IN ('super_admin', 'society_admin')
));

CREATE POLICY "Enable insert for authenticated users" 
ON public.family_members 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = member_id OR auth.uid() IN (
  SELECT id FROM public.profiles 
  WHERE society_id = (SELECT society_id FROM public.profiles WHERE id = member_id)
  AND role IN ('super_admin', 'society_admin')
));

-- Create policies for vehicles
CREATE POLICY "Enable read access for authenticated users" 
ON public.vehicles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = member_id OR auth.uid() IN (
  SELECT id FROM public.profiles 
  WHERE society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid())
  AND role IN ('super_admin', 'society_admin')
));

CREATE POLICY "Enable insert for authenticated users" 
ON public.vehicles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = member_id OR auth.uid() IN (
  SELECT id FROM public.profiles 
  WHERE society_id = (SELECT society_id FROM public.profiles WHERE id = member_id)
  AND role IN ('super_admin', 'society_admin')
));

-- Create policies for member_documents
CREATE POLICY "Enable read access for authenticated users" 
ON public.member_documents 
FOR SELECT 
TO authenticated 
USING (auth.uid() = member_id OR auth.uid() IN (
  SELECT id FROM public.profiles 
  WHERE society_id = (SELECT society_id FROM public.profiles WHERE id = auth.uid())
  AND role IN ('super_admin', 'society_admin')
));

CREATE POLICY "Enable insert for authenticated users" 
ON public.member_documents 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = member_id OR auth.uid() IN (
  SELECT id FROM public.profiles 
  WHERE society_id = (SELECT society_id FROM public.profiles WHERE id = member_id)
  AND role IN ('super_admin', 'society_admin')
));
