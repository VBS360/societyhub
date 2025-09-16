import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Amenity {
  id: string;
  name: string;
  description?: string;
  booking_fee: number;
  max_hours: number;
  advance_booking_days: number;
  is_active: boolean;
  society_id: string;
  created_at: string;
  updated_at: string;
}

interface AmenityBooking {
  id: string;
  amenity_id: string;
  profile_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  status: string;
  payment_status: string;
  created_at: string;
  amenities?: { name: string };
  profiles?: { full_name: string; unit_number: string };
}

interface UseAmenitiesResult {
  amenities: Amenity[];
  bookings: AmenityBooking[];
  loading: boolean;
  error: string | null;
  stats: {
    totalAmenities: number;
    activeAmenities: number;
    totalBookings: number;
    pendingBookings: number;
  };
}

export function useAmenities() {
  const [data, setData] = useState<UseAmenitiesResult>({
    amenities: [],
    bookings: [],
    loading: true,
    error: null,
    stats: {
      totalAmenities: 0,
      activeAmenities: 0,
      totalBookings: 0,
      pendingBookings: 0
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

    const fetchData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch amenities
        const { data: amenities, error: amenitiesError } = await supabase
          .from('amenities')
          .select('*')
          .eq('society_id', profile.society_id)
          .order('name');

        if (amenitiesError) throw amenitiesError;

        // Fetch bookings with related data
        const { data: bookings, error: bookingsError } = await supabase
          .from('amenity_bookings')
          .select(`
            *,
            amenities!inner(name, society_id),
            profiles!inner(full_name, unit_number)
          `)
          .eq('amenities.society_id', profile.society_id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (bookingsError) throw bookingsError;

        const amenitiesData = amenities || [];
        const bookingsData = bookings || [];

        const stats = {
          totalAmenities: amenitiesData.length,
          activeAmenities: amenitiesData.filter(a => a.is_active).length,
          totalBookings: bookingsData.length,
          pendingBookings: bookingsData.filter(b => b.status === 'pending').length
        };

        setData({
          amenities: amenitiesData,
          bookings: bookingsData,
          loading: false,
          error: null,
          stats
        });
      } catch (error) {
        console.error('Error fetching amenities:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch amenities'
        }));
      }
    };

    fetchData();

    // Real-time subscriptions
    const amenitiesChannel = supabase
      .channel('amenities-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'amenities',
          filter: `society_id=eq.${profile.society_id}`
        },
        () => fetchData()
      )
      .subscribe();

    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'amenity_bookings'
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      amenitiesChannel.unsubscribe();
      bookingsChannel.unsubscribe();
    };
  }, [profile?.society_id]);

  return data;
}