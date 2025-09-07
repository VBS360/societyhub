-- Set vatsal793@gmail.com as super admin
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID for vatsal793@gmail.com
  SELECT id INTO user_id FROM auth.users WHERE email = 'vatsal793@gmail.com';
  
  IF user_id IS NOT NULL THEN
    -- Update the user's role in the profiles table
    UPDATE public.profiles 
    SET role = 'super_admin' 
    WHERE user_id = user_id;
    
    RAISE NOTICE 'Successfully set vatsal793@gmail.com as super admin';
  ELSE
    RAISE NOTICE 'User vatsal793@gmail.com not found';
  END IF;
END $$;
