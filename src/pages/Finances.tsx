import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, IndianRupee, CreditCard, Receipt, Calendar, Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { Transaction as TransactionType } from '@/types/finance';
import { TransactionsTable } from '@/components/finances/TransactionsTable';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AddTransactionDialog, type TransactionData } from '@/components/finances/AddTransactionDialog';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFinances } from '@/hooks/useFinances';

interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: number | string;
  expense_date: string;
  isTransaction?: boolean;
  [key: string]: any;
}

type Transaction = TransactionType;

const mockFinancials = {
  totalBalance: 285000,
  monthlyIncome: 45000,
  monthlyExpenses: 32000,
  pendingDues: 15000,
  recentTransactions: [
    {
      id: '1',
      type: 'income',
      amount: 5000,
      description: 'Maintenance Fee - Unit A-101',
      date: '2024-01-15',
      category: 'Maintenance'
    },
    // ... other mock data
  ],
  monthlyExpenseBreakdown: [
    { category: 'Security', amount: 25000, percentage: 35 },
    { category: 'Maintenance', amount: 18000, percentage: 25 },
    { category: 'Utilities', amount: 15000, percentage: 21 },
    { category: 'Cleaning', amount: 8000, percentage: 11 },
    { category: 'Administration', amount: 6000, percentage: 8 }
  ]
};

const Finances = () => {
  const { profile } = useAuth();
  const { 
    maintenanceFees, 
    expenses, 
    transactions, 
    loading, 
    error, 
    stats = {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      pendingDues: 0
    }, 
    refresh 
  } = useFinances();
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionData | null>(null);
  const { toast } = useToast();
  
  // Combine expenses and expense transactions for the breakdown
  const allExpenses = useMemo(() => {
    const expenseList = [...(expenses || [])];
    
    // Add expense transactions that don't have a matching expense record
    const expenseTransactions = (transactions || [])
      .filter(tx => tx.type === 'expense' && tx.amount < 0)
      .map(tx => ({
        id: tx.id,
        title: tx.description,
        category: tx.category || 'Uncategorized',
        amount: Math.abs(tx.amount),
        expense_date: tx.date,
        isTransaction: true,
        // Add required properties to match ExpenseItem type
        type: 'expense',
        description: tx.description,
        status: 'completed',
        paymentMethod: tx.paymentMethod || 'other',
        date: tx.date
      } as ExpenseItem));
      
    return [...expenseList, ...expenseTransactions];
  }, [expenses, transactions]);

  // Type guard to check if an object is a valid Transaction
  const isTransaction = (obj: any): obj is Transaction => {
    return (
      obj && 
      typeof obj.id === 'string' &&
      (typeof obj.amount === 'number' || typeof obj.amount === 'string') &&
      (obj.type === 'income' || obj.type === 'expense')
    );
  };

  // Convert any transaction-like object to a Transaction
  const toTransaction = (data: any): Transaction => {
    // Ensure we have a valid date string
    let dateStr: string;
    if (data.date instanceof Date) {
      dateStr = data.date.toISOString();
    } else if (typeof data.date === 'string') {
      dateStr = data.date;
    } else if (data.date && typeof data.date === 'object' && 'toDate' in data.date) {
      // Handle Firestore timestamps if needed
      dateStr = data.date.toDate().toISOString();
    } else {
      dateStr = new Date().toISOString();
    }

    // Ensure amount is a number
    const amount = typeof data.amount === 'number' 
      ? data.amount 
      : parseFloat(data.amount) || 0;

    // Return the transaction with all required fields
    return {
      id: data.id || '',
      amount,
      type: data.type === 'income' ? 'income' : 'expense',
      description: data.description || '',
      date: dateStr,
      status: data.status || 'completed',
      paymentMethod: data.payment_method || data.paymentMethod || 'other',
      payment_method: data.payment_method || data.paymentMethod || 'other',
      category: data.category || '',
      reference: data.reference || null,
      transaction_date: data.transaction_date || dateStr,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      society_id: data.society_id || '',
      created_by: data.created_by || '',
      approved_by: data.approved_by || null,
      receipt_url: data.receipt_url || null,
      profiles: data.profiles || null
    };
  };

  // Convert Transaction to TransactionData for the form
  const transactionToFormData = (transaction: TransactionType): TransactionData => {
    const safeTransaction = isTransaction(transaction) ? transaction : toTransaction(transaction);
    
    // Convert date to a proper Date object
    let transactionDate: Date;
    if (typeof safeTransaction.date === 'string') {
      transactionDate = new Date(safeTransaction.date);
    } else if (typeof safeTransaction.date === 'number') {
      transactionDate = new Date(safeTransaction.date);
    } else if (safeTransaction.date instanceof Date) {
      transactionDate = safeTransaction.date;
    } else {
      transactionDate = new Date();
    }
    
    // Ensure we have all required fields for TransactionData
    return {
      id: safeTransaction.id,
      amount: safeTransaction.amount.toString(),
      type: safeTransaction.type,
      category: safeTransaction.category || 'other', // Default category if not provided
      description: safeTransaction.description || '',
      paymentMethod: safeTransaction.payment_method || 'cash', // Default payment method
      reference: safeTransaction.reference,
      date: transactionDate
    };
  };

  const handleEditTransaction = (transaction: TransactionType) => {
    // Convert the transaction to TransactionData before setting it for editing
    const transactionData = transactionToFormData(transaction);
    setEditingTransaction(transactionData);
    setIsAddDialogOpen(true);
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', transactionId);

        if (error) throw error;

        // Refresh the data
        refresh();

        toast({
          title: 'Success',
          description: 'Transaction deleted successfully',
        });
      } catch (error) {
        console.error('Error deleting transaction:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete transaction',
          variant: 'destructive',
        });
      }
    } else {
      return Promise.reject('Deletion cancelled');
    }
  };

  const handleTransactionSuccess = () => {
    setEditingTransaction(null);
    setIsAddDialogOpen(false);
    refresh();
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Error loading financial data: {error}</div>
      </div>
    );
  }

  const data = {
    totalBalance: stats?.totalBalance || 0,
    monthlyIncome: stats?.monthlyIncome || 0,
    monthlyExpenses: stats?.monthlyExpenses || 0,
    pendingDues: stats?.pendingDues || 0,
    recentTransactions: [],
    monthlyExpenseBreakdown: []
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
          <p className="text-muted-foreground">
            Society financial overview and expense tracking
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Total Balance
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ₹{stats.totalBalance.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              {stats.totalBalance >= 0 ? 'Positive' : 'Negative'} balance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Monthly Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{stats.monthlyIncome.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/50 border-rose-200 dark:border-rose-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-700 dark:text-rose-300">
              Monthly Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ₹{stats.monthlyExpenses.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              -8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Pending Dues
            </CardTitle>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{stats.pendingDues.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {stats.pendingDues > 0 ? 'Overdue' : 'All clear'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <Button 
                size="sm" 
                className="gap-1"
                onClick={() => {
                  setEditingTransaction(null);
                  setIsAddDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions && transactions.length > 0 ? (
                transactions.slice(0, 5).map((tx) => {
                  const transaction = tx as unknown as Transaction;
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' 
                            : 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'
                        }`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpCircle className="h-5 w-5" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                            {transaction.category && ` • ${transaction.category}`}
                          </p>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent transactions
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.society_id ? (
              <TransactionsTable 
                societyId={profile.society_id} 
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No society associated with your account
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {allExpenses && allExpenses.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  // Group all expenses by category and calculate totals
                  const categoryTotals = allExpenses.reduce<Record<string, number>>((acc, expense) => {
                    const amount = typeof expense.amount === 'number' ? expense.amount : Number(expense.amount) || 0;
                    const category = (expense.category?.trim() || 'Uncategorized').toLowerCase();
                    acc[category] = (acc[category] || 0) + amount;
                    return acc;
                  }, {});

                  const totalExpenses = Object.values(categoryTotals).reduce<number>(
                    (sum, amount) => sum + (Number(amount) || 0), 
                    0
                  );

                  // Convert to array, filter out zero amounts, and sort by amount (descending)
                  return Object.entries(categoryTotals)
                    .map(([category, amount]) => ({
                      category,
                      amount,
                      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
                    }))
                    .filter(item => Number(item.amount) > 0)
                    .sort((a, b) => b.amount - a.amount)
                    .map(({ category, amount, percentage }) => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <div className="text-sm font-medium">
                            ₹{amount.toLocaleString('en-IN')}
                            <span className="ml-2 text-muted-foreground">
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          ></div>
                        </div>
                      </div>
                    ));
                })()}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No expense data available for this month
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Transaction Dialog */}
      {profile?.society_id && (
        <AddTransactionDialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) setEditingTransaction(null);
          }}
          societyId={profile.society_id}
          initialData={editingTransaction}
          onSuccess={handleTransactionSuccess}
        />
      )}
    </div>
  );
};

export default Finances;
