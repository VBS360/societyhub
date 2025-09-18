import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

// Define valid status types
type VisitorStatus = 'pending' | 'approved' | 'checked_in' | 'checked_out' | 'rejected';

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
  status: VisitorStatus;
  security_notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: { 
    full_name: string; 
    unit_number: string;
  };
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

  const fetchVisitors = async () => {
    if (!profile?.society_id) {
      console.log('No society_id in profile');
      setData(prev => ({ ...prev, loading: false, error: 'No society associated' }));
      return;
    }

    try {
      console.log('Fetching visitors for society:', profile.society_id);
      setData(prev => ({ ...prev, loading: true, error: null }));

      const { data: visitors, error, status, statusText } = await supabase
        .from('visitors')
        .select(`
          *,
          profiles!visitors_host_profile_id_fkey(full_name, unit_number)
        `)
        .eq('society_id', profile.society_id)
        .order('created_at', { ascending: false })
        .limit(50);

      console.log('Visitors fetch response:', { 
        status, 
        statusText, 
        count: visitors?.length,
        sample: visitors?.[0]
      });
      
      if (error) {
        console.error('Error fetching visitors:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      const visitorsData = visitors || [];

      // Map status for compatibility
      const mappedVisitors = visitorsData.map(visitor => {
        // Convert string dates to Date objects for consistent comparison
        const entryTime = visitor.entry_time ? new Date(visitor.entry_time) : null;
        const exitTime = visitor.exit_time ? new Date(visitor.exit_time) : null;
        
        // Determine status based on entry and exit times
        let status: VisitorStatus = 'pending';
        
        if (entryTime && !exitTime) {
          status = 'checked_in';
        } else if (exitTime) {
          status = 'checked_out';
        } else if (visitor.status && ['pending', 'approved', 'rejected'].includes(visitor.status)) {
          status = visitor.status as VisitorStatus;
        }
        
        return {
          ...visitor,
          status,
          entry_time: entryTime?.toISOString(),
          exit_time: exitTime?.toISOString()
        };
      });

      const stats = {
        total: mappedVisitors.length,
        pending: mappedVisitors.filter(v => v.status === 'pending').length,
        inProgress: mappedVisitors.filter(v => v.status === 'checked_in').length,
        completed: mappedVisitors.filter(v => v.status === 'checked_out' || v.status === 'rejected').length
      };

      console.log('Setting visitors data:', { 
        count: mappedVisitors.length,
        stats,
        firstVisitor: mappedVisitors[0]
      });

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

  useEffect(() => {
    if (!profile?.society_id) return;
    
    // Initial fetch
    fetchVisitors();

    // Set up real-time subscription
    const channel = supabase
      .channel('visitors_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitors',
          filter: `society_id=eq.${profile.society_id}`
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          fetchVisitors();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Subscription error:', err);
          return;
        }
        console.log('Subscription status:', status);
      });

    // Cleanup
    return () => {
      console.log('Cleaning up visitors subscription');
      supabase.removeChannel(channel);
    };
  }, [profile?.society_id]);  // Only re-run if society_id changes

  return data;
}