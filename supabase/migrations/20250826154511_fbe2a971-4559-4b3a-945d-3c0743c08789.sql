-- Fix critical security vulnerabilities

-- 1. Add trigger to prevent privilege escalation on profiles table
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 2. Fix cross-society INSERT vulnerabilities

-- Fix announcements INSERT policy
DROP POLICY IF EXISTS "Admins can create announcements" ON public.announcements;
CREATE POLICY "Admins can create announcements" 
ON public.announcements 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.society_id = announcements.society_id
      AND p.role IN ('super_admin', 'society_admin', 'committee_member')
      AND p.id = announcements.created_by
  )
);

-- Fix events INSERT policy
DROP POLICY IF EXISTS "Admins can create events" ON public.events;
CREATE POLICY "Admins can create events" 
ON public.events 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.society_id = events.society_id
      AND p.role IN ('super_admin', 'society_admin', 'committee_member')
      AND p.id = events.created_by
  )
);

-- Fix expenses INSERT policy
DROP POLICY IF EXISTS "Admins can create expenses" ON public.expenses;
CREATE POLICY "Admins can create expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.society_id = expenses.society_id
      AND p.role IN ('super_admin', 'society_admin', 'committee_member')
      AND p.id = expenses.created_by
  )
);

-- Fix complaints INSERT policy
DROP POLICY IF EXISTS "Users can create complaints" ON public.complaints;
CREATE POLICY "Users can create complaints" 
ON public.complaints 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.society_id = complaints.society_id
      AND p.id = complaints.profile_id
  )
);

-- Fix visitors INSERT policy
DROP POLICY IF EXISTS "Users can create visitor entries for themselves" ON public.visitors;
CREATE POLICY "Users can create visitor entries for themselves" 
ON public.visitors 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.society_id = visitors.society_id
      AND p.id = visitors.host_profile_id
  )
);

-- Fix amenity_bookings INSERT policy
DROP POLICY IF EXISTS "Users can create their own bookings" ON public.amenity_bookings;
CREATE POLICY "Users can create their own bookings" 
ON public.amenity_bookings 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN amenities a ON a.id = amenity_bookings.amenity_id
    WHERE p.user_id = auth.uid()
      AND p.society_id = a.society_id
      AND p.id = amenity_bookings.profile_id
  )
);

-- Fix event_rsvps INSERT policy
DROP POLICY IF EXISTS "Users can create their own RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can create their own RSVPs" 
ON public.event_rsvps 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN events e ON e.id = event_rsvps.event_id
    WHERE p.user_id = auth.uid()
      AND p.society_id = e.society_id
      AND p.id = event_rsvps.profile_id
  )
);

-- 3. Fix maintenance_fees visibility - restrict to user's own fees + admin access
DROP POLICY IF EXISTS "Society members can view maintenance fees" ON public.maintenance_fees;

CREATE POLICY "Users can view their own maintenance fees" 
ON public.maintenance_fees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.id = maintenance_fees.profile_id
  )
);

CREATE POLICY "Admins can view all maintenance fees in society" 
ON public.maintenance_fees 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.society_id = maintenance_fees.society_id
      AND p.role IN ('super_admin', 'society_admin', 'committee_member')
  )
);

-- 4. Restrict visitors security_notes to admins only
-- Note: This requires application-level handling since we can't restrict columns in RLS
-- We'll need to handle this in the frontend by filtering sensitive fields for non-admins