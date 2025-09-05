import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MaintenanceFee {
  id: string;
  amount: number;
  due_date: string;
  payment_date?: string;
  status: string;
  description?: string;
  profile_id: string;
  society_id: string;
  profiles?: { full_name: string; unit_number: string };
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
  description?: string;
  vendor_name?: string;
  created_by: string;
  society_id: string;
  profiles?: { full_name: string };
}

interface UseFinancesResult {
  maintenanceFees: MaintenanceFee[];
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  stats: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    pendingDues: number;
  };
}

export function useFinances() {
  const [data, setData] = useState<UseFinancesResult>({
    maintenanceFees: [],
    expenses: [],
    loading: true,
    error: null,
    stats: {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      pendingDues: 0
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

    const fetchFinancialData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));

        const currentMonth = new Date();
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        // Fetch maintenance fees
        const { data: maintenanceFees, error: feesError } = await supabase
          .from('maintenance_fees')
          .select(`
            *,
            profiles!maintenance_fees_profile_id_fkey(full_name, unit_number)
          `)
          .eq('society_id', profile.society_id)
          .order('due_date', { ascending: false })
          .limit(50);

        if (feesError) throw feesError;

        // Fetch expenses for current month
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select(`
            *,
            profiles!expenses_created_by_fkey(full_name)
          `)
          .eq('society_id', profile.society_id)
          .gte('expense_date', firstDayOfMonth.toISOString().split('T')[0])
          .lte('expense_date', lastDayOfMonth.toISOString().split('T')[0])
          .order('expense_date', { ascending: false });

        if (expensesError) throw expensesError;

        const feesData = maintenanceFees || [];
        const expensesData = expenses || [];

        // Calculate stats
        const monthlyIncome = feesData
          .filter(fee => {
            if (!fee.payment_date) return false;
            const paymentDate = new Date(fee.payment_date);
            return paymentDate >= firstDayOfMonth && paymentDate <= lastDayOfMonth && fee.status === 'paid';
          })
          .reduce((sum, fee) => sum + Number(fee.amount), 0);

        const monthlyExpenses = expensesData
          .reduce((sum, expense) => sum + Number(expense.amount), 0);

        const pendingDues = feesData
          .filter(fee => fee.status === 'pending')
          .reduce((sum, fee) => sum + Number(fee.amount), 0);

        const totalBalance = monthlyIncome - monthlyExpenses; // Simplified calculation

        setData({
          maintenanceFees: feesData,
          expenses: expensesData,
          loading: false,
          error: null,
          stats: {
            totalBalance,
            monthlyIncome,
            monthlyExpenses,
            pendingDues
          }
        });
      } catch (error) {
        console.error('Error fetching financial data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch financial data'
        }));
      }
    };

    fetchFinancialData();

    // Real-time subscriptions
    const feesChannel = supabase
      .channel('maintenance-fees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_fees',
          filter: `society_id=eq.${profile.society_id}`
        },
        () => fetchFinancialData()
      )
      .subscribe();

    const expensesChannel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `society_id=eq.${profile.society_id}`
        },
        () => fetchFinancialData()
      )
      .subscribe();

    return () => {
      feesChannel.unsubscribe();
      expensesChannel.unsubscribe();
    };
  }, [profile?.society_id]);

  return data;
}