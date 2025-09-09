-- Add role_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role_id UUID REFERENCES public.society_roles(id) ON DELETE SET NULL;

-- Create an index on role_id for better performance
CREATE INDEX idx_profiles_role_id ON public.profiles(role_id);

-- Update existing profiles to have a default role
-- First, ensure there's at least one role for each society
INSERT INTO public.society_roles (society_id, name, description, is_default, created_at, updated_at)
SELECT DISTINCT ON (society_id) 
    society_id,
    'Resident' as name,
    'Default resident role' as description,
    true as is_default,
    NOW() as created_at,
    NOW() as updated_at
FROM 
    public.profiles p
WHERE 
    NOT EXISTS (
        SELECT 1 
        FROM public.society_roles sr 
        WHERE sr.society_id = p.society_id
    );

-- Now update existing profiles to have a role_id
UPDATE public.profiles p
SET role_id = (
    SELECT id 
    FROM public.society_roles sr 
    WHERE sr.society_id = p.society_id 
    AND sr.is_default = true
    LIMIT 1
)
WHERE p.role_id IS NULL;
