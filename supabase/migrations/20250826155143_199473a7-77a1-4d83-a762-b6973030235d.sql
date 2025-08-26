-- Security fixes: Part 2 - Critical vulnerabilities
-- This migration addresses the remaining critical security issues

-- 1. Fix function hardening - add proper search_path to security definer functions
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow updates to role only if user is admin in the society
  IF OLD.role IS DISTINCT FROM NEW.role OR 
     OLD.society_id IS DISTINCT FROM NEW.society_id OR
     OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.society_id = OLD.society_id
        AND p.role IN ('super_admin', 'society_admin', 'committee_member')
    ) THEN
      RAISE EXCEPTION 'Only admins can modify role, society_id, or is_active status';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 2. Create function to enforce profile insert safety
CREATE OR REPLACE FUNCTION public.enforce_profile_insert_safety()
RETURNS TRIGGER AS $$
BEGIN
  -- For self-registration, force safe defaults
  IF NEW.user_id = auth.uid() THEN
    -- Force role to resident for self-registration
    IF NEW.role IS DISTINCT FROM 'resident' THEN
      NEW.role := 'resident';
    END IF;
    
    -- Force society_id to NULL for self-registration (admins will assign later)
    IF NEW.society_id IS NOT NULL THEN
      NEW.society_id := NULL;
    END IF;
    
    -- Force is_active to true for self-registration
    NEW.is_active := true;
  ELSE
    -- For admin-created profiles, verify admin permissions
    IF NEW.society_id IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
          AND p.society_id = NEW.society_id
          AND p.role IN ('super_admin', 'society_admin', 'committee_member')
      ) THEN
        RAISE EXCEPTION 'Only admins can create profiles for their society';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 3. Add triggers for profile integrity
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

CREATE TRIGGER enforce_profile_insert_safety_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_insert_safety();

-- 4. Fix profiles INSERT RLS policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Allow self-registration as resident without society
CREATE POLICY "Self-register as resident without society" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'resident' 
  AND society_id IS NULL
  AND is_active = true
);

-- Allow admins to add profiles to their society
CREATE POLICY "Admins can add profiles to their society" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  society_id IS NOT NULL 
  AND is_admin_in_society(society_id)
);

-- 5. Fix visitor data visibility - restrict to hosts and admins only
DROP POLICY IF EXISTS "Society members can view visitors" ON public.visitors;

-- Hosts can view their own visitors
CREATE POLICY "Hosts can view their own visitors" 
ON public.visitors 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.id = visitors.host_profile_id
  )
);

-- Admins can view all visitors in their society
CREATE POLICY "Admins can view all visitors in society" 
ON public.visitors 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.society_id = visitors.society_id
      AND p.role IN ('super_admin', 'society_admin', 'committee_member')
  )
);

-- 6. Fix other security definer functions to have proper search_path
CREATE OR REPLACE FUNCTION public.is_admin_in_society(target_society uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $function$
  select exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.society_id = target_society
      and p.role in ('super_admin','society_admin','committee_member')
  );
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    phone,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New User'),
    NEW.raw_user_meta_data ->> 'phone',
    'resident',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';