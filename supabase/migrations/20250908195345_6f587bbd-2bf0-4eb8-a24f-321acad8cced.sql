-- Fix the prevent_role_escalation function to allow self-assignment to society
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow users to self-assign to a society if they don't have one yet
  -- This handles the case where OLD.society_id is NULL and they're assigning themselves
  IF OLD.society_id IS NULL AND NEW.society_id IS NOT NULL AND NEW.user_id = auth.uid() THEN
    -- Allow self-assignment but prevent role escalation
    IF OLD.role IS DISTINCT FROM NEW.role AND NEW.role != 'resident' THEN
      RAISE EXCEPTION 'Cannot escalate role during self-assignment';
    END IF;
    RETURN NEW;
  END IF;

  -- For all other changes to role, society_id, or is_active
  IF OLD.role IS DISTINCT FROM NEW.role OR 
     OLD.society_id IS DISTINCT FROM NEW.society_id OR
     OLD.is_active IS DISTINCT FROM NEW.is_active THEN
    
    -- Check if user is admin in the relevant society (OLD or NEW)
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND (p.society_id = COALESCE(OLD.society_id, NEW.society_id))
        AND p.role IN ('super_admin', 'society_admin', 'committee_member')
    ) THEN
      RAISE EXCEPTION 'Only admins can modify role, society_id, or is_active status';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;