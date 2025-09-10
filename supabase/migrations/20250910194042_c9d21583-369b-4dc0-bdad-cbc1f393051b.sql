-- Create society_roles table for role-based permissions
CREATE TABLE public.society_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    society_id uuid NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    permissions text[] DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(society_id, name)
);

-- Enable RLS
ALTER TABLE public.society_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Society members can view roles" ON public.society_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.society_id = society_roles.society_id
        )
    );

CREATE POLICY "Admins can manage roles" ON public.society_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() 
                AND p.society_id = society_roles.society_id 
                AND p.role IN ('super_admin', 'society_admin', 'committee_member')
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER update_society_roles_updated_at
    BEFORE UPDATE ON public.society_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add role_id column to profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role_id') THEN
        ALTER TABLE public.profiles ADD COLUMN role_id uuid REFERENCES public.society_roles(id);
    END IF;
END $$;

-- Create default roles for existing societies
INSERT INTO public.society_roles (society_id, name, description, is_default, permissions)
SELECT 
    s.id,
    'Resident',
    'Standard resident with basic permissions',
    true,
    '{"view_announcements", "book_amenities", "submit_complaints"}'
FROM public.societies s
WHERE NOT EXISTS (
    SELECT 1 FROM public.society_roles sr 
    WHERE sr.society_id = s.id AND sr.name = 'Resident'
);

INSERT INTO public.society_roles (society_id, name, description, is_default, permissions)
SELECT 
    s.id,
    'Committee Member',
    'Committee member with extended permissions',
    false,
    '{"view_announcements", "book_amenities", "submit_complaints", "create_announcements", "manage_events", "view_finances"}'
FROM public.societies s
WHERE NOT EXISTS (
    SELECT 1 FROM public.society_roles sr 
    WHERE sr.society_id = s.id AND sr.name = 'Committee Member'
);

INSERT INTO public.society_roles (society_id, name, description, is_default, permissions)
SELECT 
    s.id,
    'Society Admin',
    'Administrator with full society management permissions',
    false,
    '{"view_announcements", "book_amenities", "submit_complaints", "create_announcements", "manage_events", "view_finances", "manage_members", "manage_finances", "manage_amenities"}'
FROM public.societies s
WHERE NOT EXISTS (
    SELECT 1 FROM public.society_roles sr 
    WHERE sr.society_id = s.id AND sr.name = 'Society Admin'
);