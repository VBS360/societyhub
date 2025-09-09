const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    // Check if society_roles table exists
    const { data: rolesTable, error: rolesError } = await supabase
      .from('society_roles')
      .select('*')
      .limit(1);

    if (rolesError) {
      console.error('society_roles table does not exist or cannot be accessed:', rolesError);
      console.log('\nYou need to run the following SQL to create the required tables:');
      console.log(`
-- Create role_permissions table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, permission)
);

-- Create society_roles table for custom roles
CREATE TABLE IF NOT EXISTS public.society_roles (
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
CREATE TABLE IF NOT EXISTS public.society_role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.society_roles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission)
);

-- Add role_id to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'role_id') THEN
    ALTER TABLE public.profiles 
    ADD COLUMN role_id UUID REFERENCES public.society_roles(id) ON DELETE SET NULL;
  END IF;
END $$;
      `);
    } else {
      console.log('society_roles table exists and is accessible');
      
      // Check if we have any roles
      const { data: roles, error: fetchError } = await supabase
        .from('society_roles')
        .select('*');
      
      if (fetchError) {
        console.error('Error fetching roles:', fetchError);
      } else {
        console.log(`Found ${roles.length} roles in the database`);
        if (roles.length > 0) {
          console.log('Sample role:', {
            id: roles[0].id,
            name: roles[0].name,
            society_id: roles[0].society_id,
            is_default: roles[0].is_default
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();
