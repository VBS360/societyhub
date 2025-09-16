import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  profile_id: string;
  society_id: string;
  assigned_to?: string;
  resolution_notes?: string;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; unit_number: string };
}

interface UseMaintenanceResult {
  requests: MaintenanceRequest[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export function useMaintenance() {
  const [data, setData] = useState<UseMaintenanceResult>({
    requests: [],
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

    const fetchRequests = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const { data: requests, error } = await supabase
          .from('complaints')
          .select(`
            *,
            profiles!complaints_profile_id_fkey(full_name, unit_number)
          `)
          .eq('society_id', profile.society_id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const requestsData = requests || [];

        const stats = {
          total: requestsData.length,
          pending: requestsData.filter(r => r.status === 'open').length,
          inProgress: requestsData.filter(r => r.status === 'in_progress').length,
          completed: requestsData.filter(r => ['resolved', 'closed'].includes(r.status)).length
        };

        setData({
          requests: requestsData.map(req => ({
            ...req,
            // Map complaint fields to maintenance request fields for compatibility
            title: req.title,
            description: req.description,
            category: req.category,
            priority: req.priority,
            status: req.status === 'resolved' || req.status === 'closed' ? 'completed' : 
                   req.status === 'in_progress' ? 'in_progress' : 'pending'
          })),
          loading: false,
          error: null,
          stats
        });
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch maintenance requests'
        }));
      }
    };

    fetchRequests();

    // Real-time subscription
    const subscription = supabase
      .channel('complaints-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'complaints',
          filter: `society_id=eq.${profile.society_id}`
        },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.society_id]);

  return data;
}