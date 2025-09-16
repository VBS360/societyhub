-- Create a function to get the current user's society ID
CREATE OR REPLACE FUNCTION public.get_user_society_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT society_id 
  FROM public.profiles 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_society_id() TO authenticated;
