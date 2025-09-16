import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  created_by: string;
  society_id: string;
  max_attendees?: number;
  requires_rsvp: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string };
}

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    upcoming: number;
    completed: number;
    totalAttendees: number;
  };
}

export function useEvents() {
  const [data, setData] = useState<UseEventsResult>({
    events: [],
    loading: true,
    error: null,
    stats: {
      total: 0,
      upcoming: 0,
      completed: 0,
      totalAttendees: 0
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

    const fetchEvents = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const { data: events, error } = await supabase
          .from('events')
          .select(`
            *,
            profiles!events_created_by_fkey(full_name)
          `)
          .eq('society_id', profile.society_id)
          .order('event_date', { ascending: true });

        if (error) throw error;

        const eventsData = events || [];
        const now = new Date();

        const stats = {
          total: eventsData.length,
          upcoming: eventsData.filter(e => new Date(e.event_date) > now).length,
          completed: eventsData.filter(e => new Date(e.event_date) <= now).length,
          totalAttendees: 0 // This would need event_rsvps join to calculate properly
        };

        setData({
          events: eventsData,
          loading: false,
          error: null,
          stats
        });
      } catch (error) {
        console.error('Error fetching events:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch events'
        }));
      }
    };

    fetchEvents();

    // Real-time subscription
    const subscription = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `society_id=eq.${profile.society_id}`
        },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.society_id]);

  return data;
}