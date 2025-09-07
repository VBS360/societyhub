import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Check if the current user has a specific permission
 */
export const checkPermission = async (permission: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc<boolean>('has_permission', {
      permission_name: permission
    });
    
    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error('Error in checkPermission:', error);
    return false;
  }
};

/**
 * Get the current user's role
 */
export const getUserRole = async (): Promise<string | null> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      console.error('Error getting user role:', error);
      return null;
    }
    
    return (data as { role: string })?.role || null;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
};
