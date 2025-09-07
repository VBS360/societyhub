import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export const useSuperAdmin = (redirectTo = '/dashboard') => {
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        const hasSuperAdmin = profile?.role === 'super_admin';
        setIsSuperAdmin(hasSuperAdmin);
        
        if (!hasSuperAdmin) {
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('Error checking super admin status:', error);
        router.push(redirectTo);
      } finally {
        setIsLoading(false);
      }
    };

    checkSuperAdmin();
  }, [router, redirectTo]);

  return { isSuperAdmin, isLoading };
};
