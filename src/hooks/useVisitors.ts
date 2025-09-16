import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone?: string;
  purpose: string;
  host_profile_id: string;
  society_id: string;
  visit_date: string;
  entry_time?: string;
  exit_time?: string;
  status: string;
  security_notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; unit_number: string };
}

interface UseVisitorsResult {
  visitors: Visitor[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export function useVisitors() {
  const [data, setData] = useState<UseVisitorsResult>({
    visitors: [],
    loading: true,
    error: null,
    stats: {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0
    }
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

    const fetchVisitors = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const { data: visitors, error } = await supabase
          .from('visitors')
          .select(`
            *,
            profiles!visitors_host_profile_id_fkey(full_name, unit_number)
          `)
          .eq('society_id', profile.society_id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const visitorsData = visitors || [];

        // Map status for compatibility
        const mappedVisitors = visitorsData.map(visitor => ({
          ...visitor,
          status: visitor.entry_time && !visitor.exit_time ? 'in_progress' :
                 visitor.exit_time ? 'completed' : 
                 visitor.status
        }));

        const stats = {
          total: mappedVisitors.length,
          pending: mappedVisitors.filter(v => v.status === 'pending').length,
          inProgress: mappedVisitors.filter(v => v.status === 'in_progress').length,
          completed: mappedVisitors.filter(v => v.status === 'completed').length
        };

        setData({
          visitors: mappedVisitors,
          loading: false,
          error: null,
          stats
        });
      } catch (error) {
        console.error('Error fetching visitors:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch visitors'
        }));
      }
    };

    fetchVisitors();

    // Real-time subscription
    const subscription = supabase
      .channel('visitors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitors',
          filter: `society_id=eq.${profile.society_id}`
        },
        () => fetchVisitors()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.society_id]);

  return data;
}