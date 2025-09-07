-- Function to set a user as super admin
CREATE OR REPLACE FUNCTION public.set_super_admin(user_email TEXT)
RETURNS JSONB AS $$
DECLARE
  user_id UUID;
  profile_record RECORD;
  result JSONB;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email 
  LIMIT 1;

  IF user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found',
      'email', user_email
    );
  END IF;

  -- Check if profile exists
  SELECT * INTO profile_record 
  FROM public.profiles 
  WHERE user_id = set_super_admin.user_id;

  IF profile_record IS NULL THEN
    -- Create a new profile if it doesn't exist
    INSERT INTO public.profiles (
      user_id, 
      email, 
      full_name, 
      role,
      created_at, 
      updated_at
    ) VALUES (
      set_super_admin.user_id,
      user_email,
      user_email, -- Using email as full_name initially
      'super_admin',
      NOW(),
      NOW()
    );
  ELSE
    -- Update existing profile to super_admin
    UPDATE public.profiles
    SET 
      role = 'super_admin',
      updated_at = NOW()
    WHERE user_id = set_super_admin.user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'User set as super admin successfully',
    'user_id', user_id,
    'email', user_email
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM,
    'email', user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile for the new user
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name,
    role,
    created_at, 
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'guest', -- Default role
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.set_super_admin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
