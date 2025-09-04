import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Member {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  unit_number?: string;
  role: string;
  is_owner?: boolean;
  family_members?: string[];
  created_at: string;
  is_active: boolean;
}

interface UseMembersResult {
  members: Member[];
  loading: boolean;
  error: string | null;
  totalMembers: number;
  owners: number;
  tenants: number;
  totalResidents: number;
}

export function useMembers() {
  const [data, setData] = useState<UseMembersResult>({
    members: [],
    loading: true,
    error: null,
    totalMembers: 0,
    owners: 0,
    tenants: 0,
    totalResidents: 0
  });
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.society_id) {
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'No society associated' 
      }));
      return;
    }

    const fetchMembers = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const { data: members, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('society_id', profile.society_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const membersData = members || [];
        const owners = membersData.filter(m => m.is_owner === true).length;
        const tenants = membersData.filter(m => m.is_owner === false).length;
        const totalResidents = membersData.reduce((sum, m) => 
          sum + (m.family_members?.length || 1), 0
        );

        setData({
          members: membersData,
          loading: false,
          error: null,
          totalMembers: membersData.length,
          owners,
          tenants,
          totalResidents
        });
      } catch (error) {
        console.error('Error fetching members:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch members'
        }));
      }
    };

    fetchMembers();

    // Real-time subscription for members updates
    const subscription = supabase
      .channel('members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `society_id=eq.${profile.society_id}`
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.society_id]);

  return data;
}