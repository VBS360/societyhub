import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

// Form validation schema using Zod
const formSchema = z.object({
  type: z.enum(['income', 'expense']).default('expense'),
  amount: z.string().min(1, 'Amount is required').refine((val) => !isNaN(Number(val)), {
    message: 'Amount must be a number',
  }),
  date: z.date().default(() => new Date()),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  reference: z.string().optional(),
});

const INCOME_CATEGORIES = [
  { value: 'maintenance', label: 'Maintenance Fee' },
  { value: 'parking', label: 'Parking Fee' },
  { value: 'donation', label: 'Donation' },
  { value: 'other_income', label: 'Other Income' },
];

const EXPENSE_CATEGORIES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'security', label: 'Security' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'repairs', label: 'Repairs' },
  { value: 'admin', label: 'Administration' },
  { value: 'other', label: 'Other' },
];

type FormValues = z.infer<typeof formSchema>;

const transactionCategories = [
  { value: 'maintenance', label: 'Maintenance Fee' },
  { value: 'parking', label: 'Parking Fee' },
  { value: 'security', label: 'Security' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'repairs', label: 'Repairs' },
  { value: 'admin', label: 'Administration' },
  { value: 'other', label: 'Other' },
];

const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Other' },
];

interface AddTransactionFormProps {
  onSuccess: () => void;
  societyId: string;
  initialData?: {
    id?: string;
    amount: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    paymentMethod: string;
    reference?: string;
    date: Date;
  } | null;
}

export function AddTransactionForm({ onSuccess, societyId, initialData }: AddTransactionFormProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, control, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      type: 'expense',
      date: new Date(),
      category: '',
      paymentMethod: '',
      description: '',
      amount: '',
      reference: '',
    },
  });

  const dateValue = watch('date');

  const onSubmit = async (formData: FormValues) => {
    if (!user || !profile) {
      toast({
        title: 'Error',
        description: 'You must be logged in to manage transactions',
        variant: 'destructive',
      });
      return;
    }

    // Check if user has permission to create/update transactions
    const allowedRoles = ['super_admin', 'society_admin', 'committee_member'];
    if (!allowedRoles.includes(profile.role)) {
      toast({
        title: 'Permission Denied',
        description: 'Only administrators and committee members can manage transactions',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const transactionDate = formData.date ? new Date(formData.date) : new Date();
      const amount = parseFloat(formData.amount) || 0;
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }
      
      const isUpdate = !!initialData?.id;
      
      // Prepare the transaction data according to the database schema
      const transactionData = {
        type: formData.type,
        amount: formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        category: formData.category || 'other',
        description: formData.description || 'No description provided',
        payment_method: formData.paymentMethod,
        reference: formData.reference || null,
        transaction_date: transactionDate.toISOString().split('T')[0],
        society_id: societyId,
        updated_at: new Date().toISOString(),
      };

      console.log('Prepared transaction data:', JSON.stringify(transactionData, null, 2));

      let result;
      if (isUpdate) {
        // Update existing transaction
        const { data, error } = await supabase
          .from('transactions')
          .update({
            ...transactionData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', initialData.id)
          .select();
        
        if (error) throw error;
        result = data?.[0];
      } else {
        // Create new transaction
        const { data, error } = await supabase
          .from('transactions')
          .insert([
            {
              ...transactionData,
              created_by: profile.id,
              approved_by: profile.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ])
          .select();
        
        if (error) throw error;
        result = data?.[0];
      }

      toast({
        title: 'Success',
        description: `Transaction ${isUpdate ? 'updated' : 'added'} successfully`,
      });
      
      reset();
      onSuccess();
    } catch (error) {
      console.error('Error adding transaction:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: 'Error',
        description: `Failed to add transaction: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Transaction Type Toggle */}
      <div className="flex justify-center mb-6">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Tabs 
              value={field.value} 
              onValueChange={field.onChange}
              className="w-full max-w-md"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="expense" className="flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4" />
                  <span>Expense</span>
                </TabsTrigger>
                <TabsTrigger value="income" className="flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4" />
                  <span>Income</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            {...register('amount')}
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && (
            <p className="text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => field.onChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        {/* Category - Dynamic based on transaction type */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => {
              const categories = watch('type') === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
              // Reset category if it's not in the current category list
              if (field.value && !categories.some(cat => cat.value === field.value)) {
                field.onChange(categories[0]?.value || '');
              }
              
              return (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }}
          />
          {errors.category && (
            <p className="text-sm font-medium text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.paymentMethod && (
            <p className="text-sm text-red-500">{errors.paymentMethod.message}</p>
          )}
        </div>

        {/* Reference */}
        <div className="space-y-2">
          <Label htmlFor="reference">Vendor/Reference (Optional)</Label>
          <Input
            id="reference"
            placeholder="Vendor name or reference number"
            {...register('reference')}
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Title/Description</Label>
        <Input
          id="description"
          placeholder="Enter a title or description for this transaction"
          {...register('description')}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Notes */}

      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className={cn(
            'transition-colors',
            watch('type') === 'income' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-primary hover:bg-primary/90'
          )}
        >
          {isSubmitting 
            ? 'Saving...' 
            : watch('type') === 'income' 
              ? 'Record Income' 
              : 'Record Expense'}
        </Button>
      </div>
    </form>
  );
}
