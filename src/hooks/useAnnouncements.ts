import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Announcement {
  is_pinned: unknown;
  id: string;
  title: string;
  content: string;
  is_urgent: boolean;
  created_by: string;
  society_id: string;
  expires_at?: string;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string };
}

interface UseAnnouncementsResult {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    urgent: number;
    expiringSoon: number;
  };
}

const isExpiringSoon = (expiresAt: string | null) => {
  if (!expiresAt) return false;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
};

export function useAnnouncements() {
  const [data, setData] = useState<UseAnnouncementsResult>({
    announcements: [],
    loading: true,
    error: null,
    stats: {
      total: 0,
      urgent: 0,
      expiringSoon: 0
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

    const fetchAnnouncements = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const { data: announcements, error } = await supabase
          .from('announcements')
          .select(`
            *,
            profiles!announcements_created_by_fkey(full_name)
          `)
          .eq('society_id', profile.society_id)
          .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        const announcementsData = announcements || [];

        const stats = {
          total: announcementsData.length,
          urgent: announcementsData.filter(a => a.is_urgent).length,
          expiringSoon: announcementsData.filter(a => a.expires_at && isExpiringSoon(a.expires_at)).length
        };

        setData({
          announcements: announcementsData,
          loading: false,
          error: null,
          stats
        });
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch announcements'
        }));
      }
    };

    fetchAnnouncements();

    // Real-time subscription
    const subscription = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
          filter: `society_id=eq.${profile.society_id}`
        },
        () => fetchAnnouncements()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.society_id]);

  return data;
}