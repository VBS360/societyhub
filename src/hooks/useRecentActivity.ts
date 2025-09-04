import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ActivityItem {
  id: string;
  type: 'payment' | 'complaint' | 'announcement' | 'event' | 'member' | 'visitor';
  title: string;
  description: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'urgent' | 'resolved';
  user?: {
    name: string;
    unit: string;
  };
}

interface UseRecentActivityResult {
  activities: ActivityItem[];
  loading: boolean;
  error: string | null;
}

export function useRecentActivity() {
  const [data, setData] = useState<UseRecentActivityResult>({
    activities: [],
    loading: true,
    error: null
  });
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.society_id) {
      setData({ activities: [], loading: false, error: 'No society associated' });
      return;
    }

    const fetchRecentActivity = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const isAdmin = ['super_admin', 'society_admin', 'committee_member'].includes(profile.role);
        const activities: ActivityItem[] = [];

        if (isAdmin) {
          // Fetch recent activities for admins
          const [complaints, payments, visitors, announcements] = await Promise.all([
            // Recent complaints
            supabase
              .from('complaints')
              .select(`
                id, title, description, status, created_at,
                profiles!profile_id(full_name, unit_number)
              `)
              .eq('society_id', profile.society_id)
              .order('created_at', { ascending: false })
              .limit(3),

            // Recent payments
            supabase
              .from('maintenance_fees')
              .select(`
                id, amount, status, payment_date, created_at,
                profiles!profile_id(full_name, unit_number)
              `)
              .eq('society_id', profile.society_id)
              .order('created_at', { ascending: false })
              .limit(3),

            // Recent visitors
            supabase
              .from('visitors')
              .select(`
                id, visitor_name, purpose, status, created_at,
                profiles!host_profile_id(full_name, unit_number)
              `)
              .eq('society_id', profile.society_id)
              .order('created_at', { ascending: false })
              .limit(2),

            // Recent announcements
            supabase
              .from('announcements')
              .select(`
                id, title, content, created_at,
                profiles!created_by(full_name, unit_number)
              `)
              .eq('society_id', profile.society_id)
              .order('created_at', { ascending: false })
              .limit(2)
          ]);

          // Process complaints
          complaints.data?.forEach(complaint => {
            activities.push({
              id: complaint.id,
              type: 'complaint',
              title: complaint.title,
              description: complaint.description,
              timestamp: formatTimestamp(complaint.created_at),
              status: complaint.status as any,
              user: {
                name: complaint.profiles.full_name,
                unit: complaint.profiles.unit_number || 'N/A'
              }
            });
          });

          // Process payments
          payments.data?.forEach(payment => {
            activities.push({
              id: payment.id,
              type: 'payment',
              title: 'Payment Received',
              description: `Maintenance fee of ₹${Number(payment.amount).toLocaleString()}`,
              timestamp: formatTimestamp(payment.payment_date || payment.created_at),
              status: payment.status === 'paid' ? 'completed' : 'pending',
              user: {
                name: payment.profiles.full_name,
                unit: payment.profiles.unit_number || 'N/A'
              }
            });
          });

          // Process visitors
          visitors.data?.forEach(visitor => {
            activities.push({
              id: visitor.id,
              type: 'visitor',
              title: 'Visitor Request',
              description: `${visitor.visitor_name} - ${visitor.purpose}`,
              timestamp: formatTimestamp(visitor.created_at),
              status: visitor.status as any,
              user: {
                name: visitor.profiles.full_name,
                unit: visitor.profiles.unit_number || 'N/A'
              }
            });
          });

          // Process announcements
          announcements.data?.forEach(announcement => {
            activities.push({
              id: announcement.id,
              type: 'announcement',
              title: announcement.title,
              description: announcement.content.substring(0, 100) + '...',
              timestamp: formatTimestamp(announcement.created_at),
              user: {
                name: announcement.profiles.full_name,
                unit: 'Admin'
              }
            });
          });

        } else {
          // Fetch activities for residents (their own data)
          const [myComplaints, myPayments] = await Promise.all([
            supabase
              .from('complaints')
              .select('id, title, description, status, created_at')
              .eq('profile_id', profile.id)
              .order('created_at', { ascending: false })
              .limit(3),

            supabase
              .from('maintenance_fees')
              .select('id, amount, status, due_date, created_at')
              .eq('profile_id', profile.id)
              .order('created_at', { ascending: false })
              .limit(3)
          ]);

          // Process resident's complaints
          myComplaints.data?.forEach(complaint => {
            activities.push({
              id: complaint.id,
              type: 'complaint',
              title: complaint.title,
              description: complaint.description,
              timestamp: formatTimestamp(complaint.created_at),
              status: complaint.status as any
            });
          });

          // Process resident's payments
          myPayments.data?.forEach(payment => {
            activities.push({
              id: payment.id,
              type: 'payment',
              title: payment.status === 'paid' ? 'Payment Completed' : 'Payment Due',
              description: `Maintenance fee of ₹${Number(payment.amount).toLocaleString()}`,
              timestamp: formatTimestamp(payment.created_at),
              status: payment.status === 'paid' ? 'completed' : 'pending'
            });
          });
        }

        // Sort all activities by timestamp (most recent first)
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setData({
          activities: activities.slice(0, 8), // Limit to 8 most recent
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setData({
          activities: [],
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch activities'
        });
      }
    };

    fetchRecentActivity();

    // Set up real-time subscriptions for activity updates
    const subscriptions = [
      supabase
        .channel('complaints-activity')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, fetchRecentActivity)
        .subscribe(),
      
      supabase
        .channel('payments-activity')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_fees' }, fetchRecentActivity)
        .subscribe(),
      
      supabase
        .channel('visitors-activity')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'visitors' }, fetchRecentActivity)
        .subscribe()
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [profile?.society_id, profile?.role, profile?.id]);

  return data;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}