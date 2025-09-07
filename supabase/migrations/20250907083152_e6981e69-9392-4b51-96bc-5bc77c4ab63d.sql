-- Add societies management table
CREATE TABLE public.societies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  registration_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE TRIGGER update_societies_updated_at
  BEFORE UPDATE ON public.societies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;

-- Society members can view society data
CREATE POLICY "Society members can view society data" ON public.societies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id::text = auth.uid()::text
      AND p.society_id = societies.id
    )
  );

-- Only super admins can create societies
CREATE POLICY "Super admins can create societies" ON public.societies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      AND p.role = 'super_admin'
    )
  );

-- Admins can update their society
CREATE POLICY "Admins can update society data" ON public.societies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id::text = auth.uid()::text
      AND p.society_id = societies.id
      AND p.role IN ('super_admin', 'society_admin')
    )
  );

-- Insert a default society for testing
INSERT INTO public.societies (name, address, phone, email, registration_number)
VALUES (
  'Green Valley Apartments',
  '123 Green Valley Road, Sector 15, Pune, Maharashtra 411001',
  '+91 20 1234 5678',
  'info@greenvalley.com',
  'REG/2023/001234'
);