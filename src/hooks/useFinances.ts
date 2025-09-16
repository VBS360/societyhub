import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './useAuth';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Transaction } from '@/types/finance';

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

// Transaction type is now imported from @/types/finance

interface TransactionWithProfile extends Omit<Transaction, 'profiles'> {
  profiles: { full_name: string } | null;
}

interface UseFinancesResult {
  maintenanceFees: MaintenanceFee[];
  expenses: Expense[];
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  stats: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    pendingDues: number;
  };
  refresh: () => Promise<void>;
}

export function useFinances() {
  const [data, setData] = useState<Omit<UseFinancesResult, 'refresh'>>({
    maintenanceFees: [],
    expenses: [],
    transactions: [],
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

  const fetchFinancialData = useCallback(async () => {
    if (!profile?.society_id) {
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'No society associated' 
      }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      const currentMonth = new Date();
      const firstDayOfMonth = startOfMonth(currentMonth);
      const lastDayOfMonth = endOfMonth(currentMonth);
      
      console.log('Current Month Date Range:', {
        currentMonth: currentMonth.toISOString(),
        firstDayOfMonth: firstDayOfMonth.toISOString(),
        lastDayOfMonth: lastDayOfMonth.toISOString()
      });

      // Fetch all transactions for the society (with date range filtering in the query)
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:created_by (full_name)
        `)
        .eq('society_id', profile.society_id)
        .gte('transaction_date', firstDayOfMonth.toISOString().split('T')[0])
        .lte('transaction_date', lastDayOfMonth.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false }) as unknown as {
          data: TransactionWithProfile[] | null;
          error: any;
        };
      
      console.log('Fetched transactions for period:', {
        from: firstDayOfMonth.toISOString().split('T')[0],
        to: lastDayOfMonth.toISOString().split('T')[0],
        count: transactions?.length || 0,
        transactions: transactions?.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          date: t.transaction_date,
          description: t.description
        }))
      });

      if (transactionsError) throw transactionsError;

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
      const transactionsData = transactions || [];

      // Calculate income from transactions (with debug logging)
      const incomeTransactions = transactionsData.filter(tx => {
        const isIncome = tx.type === 'income';
        const amount = Number(tx.amount);
        const isValidAmount = !isNaN(amount) && amount > 0;
        
        if (!isIncome) return false;
        
        const txDate = new Date(tx.transaction_date);
        const isInDateRange = txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
        
        console.log('Processing income transaction:', {
          id: tx.id,
          type: tx.type,
          originalAmount: tx.amount,
          parsedAmount: amount,
          isValidAmount,
          date: tx.transaction_date,
          description: tx.description,
          isInDateRange
        });
        
        return isInDateRange && isValidAmount;
      });
      
      console.log('Valid income transactions found:', incomeTransactions.length);
      
      const transactionIncome = incomeTransactions.reduce((sum, tx) => {
        const amount = Number(tx.amount);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      // Calculate expenses from transactions (with debug logging)
      const expenseTransactions = transactionsData.filter(tx => {
        const isExpense = tx.type === 'expense';
        const amount = Math.abs(Number(tx.amount));
        const isValidAmount = !isNaN(amount) && amount > 0;
        
        if (!isExpense) return false;
        
        const txDate = new Date(tx.transaction_date);
        const isInDateRange = txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
        
        console.log('Processing expense transaction:', {
          id: tx.id,
          type: tx.type,
          originalAmount: tx.amount,
          parsedAmount: amount,
          isValidAmount,
          date: tx.transaction_date,
          description: tx.description,
          isInDateRange
        });
        
        return isInDateRange && isValidAmount;
      });
      
      console.log('Valid expense transactions found:', expenseTransactions.length);
      
      const transactionExpenses = expenseTransactions.reduce((sum, tx) => {
        const amount = Math.abs(Number(tx.amount));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      // Calculate maintenance fees paid this month
      const maintenanceIncome = feesData
        .filter(fee => {
          if (fee.status !== 'paid' || !fee.payment_date) {
            console.log('Skipping fee - not paid or no payment date:', {
              id: fee.id,
              status: fee.status,
              hasPaymentDate: !!fee.payment_date
            });
            return false;
          }
          
          const paymentDate = new Date(fee.payment_date);
          const isInRange = paymentDate >= firstDayOfMonth && paymentDate <= lastDayOfMonth;
          
          console.log('Processing maintenance fee:', {
            id: fee.id,
            amount: fee.amount,
            payment_date: fee.payment_date,
            status: fee.status,
            isInRange,
            firstDay: firstDayOfMonth.toISOString().split('T')[0],
            lastDay: lastDayOfMonth.toISOString().split('T')[0]
          });
          
          return isInRange;
        })
        .reduce((sum, fee) => {
          const amount = Number(fee.amount) || 0;
          console.log('Adding maintenance fee to income:', fee.id, amount);
          return sum + amount;
        }, 0);

      console.log('Date Range:', {
        firstDayOfMonth: firstDayOfMonth.toISOString(),
        lastDayOfMonth: lastDayOfMonth.toISOString()
      });
      console.log('Maintenance Income:', maintenanceIncome);
      console.log('Transaction Income:', transactionIncome);
      
      // Calculate expenses from expenses table
      const expensesTotal = expensesData
        .filter(exp => {
          const expDate = new Date(exp.expense_date);
          const isInDateRange = expDate >= firstDayOfMonth && expDate <= lastDayOfMonth;
          const amount = Math.abs(Number(exp.amount));
          const isValidAmount = !isNaN(amount) && amount > 0;
          
          console.log('Processing expense:', {
            id: exp.id,
            amount: exp.amount,
            parsedAmount: amount,
            date: exp.expense_date,
            description: exp.title,
            isInDateRange,
            isValidAmount
          });
          
          return isInDateRange && isValidAmount;
        })
        .reduce((sum, exp) => sum + Math.abs(Number(exp.amount)), 0);
      
      // Calculate all income and expenses
      const monthlyIncome = maintenanceIncome + transactionIncome;
      const monthlyExpenses = expensesTotal + transactionExpenses;
      
      // Calculate pending dues (all unpaid maintenance fees)
      const pendingDues = feesData
        .filter(fee => fee.status === 'pending')
        .reduce((sum, fee) => sum + Math.abs(Number(fee.amount)), 0);
      
      // Calculate net change from transactions (income - expenses)
      const netTransactionChange = transactionsData.reduce((sum, tx) => {
        const amount = Number(tx.amount) || 0;
        return tx.type === 'income' ? sum + amount : sum - amount;
      }, 0);
      
      // Calculate total balance (all income - all expenses)
      const totalBalance = monthlyIncome - monthlyExpenses;
      
      // Log final calculations
      console.log('Financial Summary:', {
        maintenanceIncome,
        transactionIncome,
        monthlyIncome,
        expensesTotal,
        transactionExpenses,
        monthlyExpenses,
        netTransactionChange,
        totalBalance,
        pendingDues,
        transactionCount: transactionsData.length,
        expenseCount: expensesData.length
      });

      setData({
        maintenanceFees: feesData,
        expenses: expensesData,
        transactions: transactionsData,
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
  }, [profile?.society_id]);

  useEffect(() => {
    fetchFinancialData();

    // Real-time subscriptions
    if (!profile?.society_id) return;
    
    const channels = [
      { table: 'maintenance_fees', channelName: 'maintenance-fees-changes' },
      { table: 'expenses', channelName: 'expenses-changes' },
      { table: 'transactions', channelName: 'transactions-changes' }
    ];

    const subscriptions = channels.map(({ table, channelName }) => {
      return supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `society_id=eq.${profile.society_id}`
          },
          () => fetchFinancialData()
        )
        .subscribe();
    });

    return () => {
      subscriptions.forEach(channel => channel.unsubscribe());
    };
  }, [profile?.society_id]);

  // Add a no-op refresh function if not initialized yet
  const refresh = useCallback(async () => {
    if (profile?.society_id) {
      await fetchFinancialData();
    }
  }, [profile?.society_id, fetchFinancialData]);

  return { ...data, refresh };
}