-- Create role_permissions table
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role public.user_role NOT NULL,
  permission TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, permission)
);

-- Create society_roles table for custom roles
CREATE TABLE public.society_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(society_id, name)
);

-- Create society_role_permissions table
CREATE TABLE public.society_role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.society_roles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission)
);

-- Add role_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role_id UUID REFERENCES public.society_roles(id) ON DELETE SET NULL;

-- Create default permissions for system roles
INSERT INTO public.role_permissions (role, permission, description) VALUES
('super_admin', 'manage_societies', 'Can create and manage societies'),
('super_admin', 'manage_system_settings', 'Can manage system-wide settings'),
('society_admin', 'manage_members', 'Can add/remove society members'),
('society_admin', 'manage_roles', 'Can manage roles and permissions'),
('society_admin', 'manage_announcements', 'Can create and manage announcements'),
('society_admin', 'manage_events', 'Can create and manage events'),
('society_admin', 'manage_finances', 'Can manage financial records'),
('committee_member', 'view_reports', 'Can view society reports'),
('committee_member', 'manage_visitors', 'Can manage visitor entries'),
('resident', 'view_announcements', 'Can view society announcements'),
('resident', 'book_amenities', 'Can book society amenities'),
('guest', 'view_public_info', 'Can view public society information');

-- Create default society roles
INSERT INTO public.society_roles (society_id, name, description, is_default) VALUES
('00000000-0000-0000-0000-000000000000', 'Secretary', 'Society secretary with administrative privileges', true),
('00000000-0000-0000-0000-000000000000', 'Treasurer', 'Manages society finances', true),
('00000000-0000-0000-0000-000000000000', 'Member', 'Regular society member', true);

-- Set up RLS for new tables
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for role_permissions
CREATE POLICY "Everyone can view role permissions" ON public.role_permissions
  FOR SELECT USING (true);

-- RLS policies for society_roles
CREATE POLICY "Society members can view their society's roles" ON public.society_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid()
      AND p.society_id = society_roles.society_id
    )
  );

CREATE POLICY "Society admins can manage roles" ON public.society_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid()
      AND p.society_id = society_roles.society_id
      AND p.role IN ('super_admin', 'society_admin')
    )
  );

-- RLS policies for society_role_permissions
CREATE POLICY "Society members can view role permissions" ON public.society_role_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.society_roles sr ON p.society_id = sr.society_id
      WHERE p.user_id = auth.uid()
      AND sr.id = society_role_permissions.role_id
    )
  );

CREATE POLICY "Society admins can manage role permissions" ON public.society_role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.society_roles sr ON p.society_id = sr.society_id
      WHERE p.user_id = auth.uid()
      AND sr.id = society_role_permissions.role_id
      AND p.role IN ('super_admin', 'society_admin')
    )
  );

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  has_perm BOOLEAN;
BEGIN
  -- Check system role permissions
  SELECT EXISTS (
    SELECT 1 FROM public.role_permissions rp
    JOIN public.profiles p ON rp.role = p.role
    WHERE p.user_id = auth.uid()
    AND rp.permission = permission_name
  ) INTO has_perm;
  
  IF has_perm THEN
    RETURN true;
  END IF;
  
  -- Check society role permissions
  SELECT EXISTS (
    SELECT 1 FROM public.society_role_permissions srp
    JOIN public.profiles p ON srp.role_id = p.role_id
    WHERE p.user_id = auth.uid()
    AND srp.permission = permission_name
  ) INTO has_perm;
  
  RETURN COALESCE(has_perm, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
