import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface DashboardStats {
  totalMembers?: number;
  pendingDues?: string;
  openComplaints?: number;
  collectionRate?: string;
  myDues?: string;
  myComplaints?: number;
  upcomingEvents?: number;
  loading: boolean;
  error: string | null;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({ loading: true, error: null });
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.society_id) {
      setStats({ loading: false, error: 'No society associated' });
      return;
    }

    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        const isAdmin = ['super_admin', 'society_admin', 'committee_member'].includes(profile.role);

        if (isAdmin) {
          // Admin stats
          const [membersResult, feesResult, complaintsResult, eventsResult] = await Promise.all([
            // Total members in society
            supabase
              .from('profiles')
              .select('id', { count: 'exact' })
              .eq('society_id', profile.society_id)
              .eq('is_active', true),
            
            // Pending maintenance fees
            supabase
              .from('maintenance_fees')
              .select('amount')
              .eq('society_id', profile.society_id)
              .eq('status', 'pending'),
            
            // Open complaints
            supabase
              .from('complaints')
              .select('id', { count: 'exact' })
              .eq('society_id', profile.society_id)
              .in('status', ['open', 'in_progress']),
            
            // Upcoming events
            supabase
              .from('events')
              .select('id', { count: 'exact' })
              .eq('society_id', profile.society_id)
              .gte('event_date', new Date().toISOString())
          ]);

          const totalDues = feesResult.data?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
          const totalPaid = await supabase
            .from('maintenance_fees')
            .select('amount')
            .eq('society_id', profile.society_id)
            .eq('status', 'paid');

          const totalPaidAmount = totalPaid.data?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
          const collectionRate = totalDues + totalPaidAmount > 0 
            ? Math.round((totalPaidAmount / (totalDues + totalPaidAmount)) * 100)
            : 0;

          setStats({
            totalMembers: membersResult.count || 0,
            pendingDues: `₹${totalDues.toLocaleString()}`,
            openComplaints: complaintsResult.count || 0,
            collectionRate: `${collectionRate}%`,
            upcomingEvents: eventsResult.count || 0,
            loading: false,
            error: null
          });
        } else {
          // Resident stats
          const [feesResult, complaintsResult, eventsResult] = await Promise.all([
            // My pending dues
            supabase
              .from('maintenance_fees')
              .select('amount')
              .eq('profile_id', profile.id)
              .eq('status', 'pending'),
            
            // My complaints
            supabase
              .from('complaints')
              .select('id', { count: 'exact' })
              .eq('profile_id', profile.id)
              .in('status', ['open', 'in_progress']),
            
            // Upcoming events
            supabase
              .from('events')
              .select('id', { count: 'exact' })
              .eq('society_id', profile.society_id)
              .gte('event_date', new Date().toISOString())
          ]);

          const myDues = feesResult.data?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;

          setStats({
            myDues: `₹${myDues.toLocaleString()}`,
            myComplaints: complaintsResult.count || 0,
            upcomingEvents: eventsResult.count || 0,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch stats'
        });
      }
    };

    fetchStats();
  }, [profile?.society_id, profile?.role, profile?.id]);

  return stats;
}