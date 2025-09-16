import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../integrations/supabase/client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { format } from 'date-fns';
import { ArrowUpCircle, ArrowDownCircle, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Transaction } from '../../types/finance';

export interface TransactionsTableProps {
  societyId: string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
}

export function TransactionsTable({ societyId, onEdit, onDelete }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<{
    type: 'all' | 'income' | 'expense';
    category: string;
    search: string;
  }>({
    type: 'all',
    category: 'all',
    search: '',
  });

  // Set up real-time subscription to transactions
  useEffect(() => {
    if (!societyId) return;

    // Initial fetch
    fetchTransactions();

    // Subscribe to changes in the transactions table
    const subscription = supabase
      .channel('transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `society_id=eq.${societyId}`
        },
        (payload) => {
          console.log('Transaction change detected:', payload);
          fetchTransactions(); // Refresh the table when any change occurs
        }
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [societyId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build the query with explicit relationship to profiles
      let query = supabase
        .from('transactions')
        .select(`
          *,
          profiles:created_by!inner(
            id,
            full_name
          )
        `, { count: 'exact' })
        .eq('society_id', societyId)
        .order('created_at', { ascending: false });

      // Apply filters with type safety
      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform the data to match our Transaction type
      const typedData = (data || []).map(transaction => {
        // Safely extract the full_name from the profiles object
        let profiles = transaction.profiles;
        let fullName = 'System';
        
        if (profiles) {
          if (typeof profiles === 'object') {
            // Handle case where profiles is an object
            fullName = (profiles as any).full_name || 'System';
          } else if (typeof profiles === 'string') {
            // Handle case where profiles is a string (unlikely but possible)
            fullName = profiles;
          }
        }
        
        return {
          ...transaction,
          profiles: {
            full_name: fullName
          }
        };
      });

      setTransactions(typedData);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (societyId) {
      fetchTransactions();
    }
  }, [societyId, page, pageSize, filters]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1); // Reset to first page when changing page size
  };

  const handleFilterChange = <K extends keyof typeof filters>(
    key: K,
    value: typeof filters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="Search by description..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="max-w-md"
        />
        <Select
          value={filters.type}
          onValueChange={(value: 'all' | 'income' | 'expense') => handleFilterChange('type', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.category}
          onValueChange={(value: string) => handleFilterChange('category', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="utilities">Utilities</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <div className="rounded-md border
      ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Added By</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.description}
                    {transaction.reference && (
                      <div className="text-xs text-muted-foreground">Ref: {transaction.reference}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {transaction.category || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {transaction.type === 'income' ? (
                        <>
                          <ArrowUpCircle className="h-4 w-4 text-green-500" />
                          <span>Income</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownCircle className="h-4 w-4 text-red-500" />
                          <span>Expense</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'expense' ? '-' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    {transaction.profiles?.full_name || 'System'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(transaction)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(transaction.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(page * pageSize, totalCount)}
            </span>{' '}
            of <span className="font-medium">{totalCount}</span> transactions
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {page} of {totalPages || 1}
          </div>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(totalPages)}
            disabled={page >= totalPages}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
