import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';
import { Database } from '@/types/database.types';

type House = Database['public']['Tables']['houses']['Row'];

export function useHouses() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHouses = useCallback(async () => {
    if (!profile?.society_id) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('houses')
        .select('*')
        .eq('society_id', profile.society_id)
        .order('block', { ascending: true })
        .order('unit', { ascending: true });

      if (fetchError) throw fetchError;
      setHouses(data || []);
    } catch (err) {
      console.error('Error fetching houses:', err);
      setError('Failed to fetch houses');
      toast({
        title: 'Error',
        description: 'Failed to fetch houses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [profile?.society_id, toast]);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  const addHouse = async (houseData: Omit<House, 'id' | 'created_at' | 'updated_at' | 'society_id'>) => {
    if (!profile?.society_id) {
      throw new Error('No society ID found');
    }

    try {
      const { data, error } = await supabase
        .from('houses')
        .insert({ ...houseData, society_id: profile.society_id })
        .select()
        .single();

      if (error) throw error;
      await fetchHouses();
      return data;
    } catch (err) {
      console.error('Error adding house:', err);
      throw err;
    }
  };

  const updateHouse = async (id: string, updates: Partial<Omit<House, 'id' | 'society_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('houses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchHouses();
      return data;
    } catch (err) {
      console.error('Error updating house:', err);
      throw err;
    }
  };

  const deleteHouse = async (id: string) => {
    try {
      const { error } = await supabase
        .from('houses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchHouses();
    } catch (err) {
      console.error('Error deleting house:', err);
      throw err;
    }
  };

  return {
    houses,
    loading,
    error,
    addHouse,
    updateHouse,
    deleteHouse,
    refresh: fetchHouses,
  };
}