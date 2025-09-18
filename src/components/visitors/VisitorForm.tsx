import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const visitorFormSchema = z.object({
  visitor_name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  visitor_phone: z.string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only numbers'),
  purpose: z.string().min(10, {
    message: 'Please provide a detailed purpose (min 10 characters).',
  }),
  visit_date: z.date({
    required_error: 'A visit date is required.',
  }),
  security_notes: z.string().optional(),
});

type VisitorFormValues = z.infer<typeof visitorFormSchema>;

interface VisitorFormProps {
  onSuccess?: () => void;
  initialData?: any;
}

export function VisitorForm({ onSuccess, initialData }: VisitorFormProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VisitorFormValues>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: initialData || {
      visitor_name: '',
      visitor_phone: '',
      purpose: '',
      visit_date: new Date(),
      security_notes: '',
    },
  });

  const onSubmit = async (formData: VisitorFormValues) => {
    if (!profile?.society_id || !profile.id) {
      console.error('Missing society or user profile:', { profile });
      toast({
        title: 'Error',
        description: 'No society or user profile found. Please try logging in again.',
        variant: 'destructive',
      });
      return;
    }

    // Format phone number to ensure it's just digits
    const formattedPhone = formData.visitor_phone.replace(/\D/g, '');
    
    // Double-check phone number format
    if (formattedPhone.length !== 10) {
      console.error('Invalid phone number format:', formData.visitor_phone);
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Prepare the visitor data with all required fields
    const visitorData = {
      visitor_name: formData.visitor_name,
      visitor_phone: formattedPhone,
      purpose: formData.purpose,
      visit_date: formData.visit_date.toISOString(),
      security_notes: formData.security_notes || null,
      society_id: profile.society_id,
      host_profile_id: profile.id,
      status: 'pending' as const, // Ensure status is typed as a literal
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Submitting visitor data:', visitorData);
    
    try {
      const startTime = Date.now();
      console.log('Starting database insert with data:', JSON.stringify(visitorData, null, 2));
      
      // First, check if we can connect to Supabase
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      
      // Try a simple query to test the connection and check RLS
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('id, role_id')
        .eq('id', profile.id)
        .single();
      
      if (testError) {
        console.error('Test query failed:', testError);
        throw new Error(`Database connection test failed: ${testError.message}`);
      }
      
      console.log('Current user role:', testData?.role_id);
      
      console.log('Test query successful, proceeding with insert...');
      
      // Perform the actual insert with explicit RLS headers
      const { data: result, error, status, statusText } = await supabase
        .from('visitors')
        .insert(visitorData)
        .select()
        .single()
        .throwOnError(); // This will throw an error if the request fails
      
      const endTime = Date.now();
      console.log(`Database insert completed in ${endTime - startTime}ms`, { 
        result, 
        error, 
        status,
        statusText,
        visitorData
      });

      if (error) {
        // Safely access error properties with type checking
        let errorMessage: string;
        
        // Check if error is an instance of Error or has a message property
        if (typeof error === 'object' && error !== null) {
          if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
            errorMessage = (error as { message: string }).message;
          } else {
            errorMessage = String(error);
          }
        } else {
          errorMessage = String(error);
        }
        
        // Create a type-safe error details object
        const errorDetails: Record<string, unknown> = {
          message: errorMessage,
          status,
          statusText,
          fullError: error
        };
        
        // Safely extract additional error properties if they exist
        if (typeof error === 'object' && error !== null) {
          const errorObj = error as Record<string, unknown>;
          ['details', 'hint', 'code'].forEach(prop => {
            if (prop in errorObj) {
              errorDetails[prop] = errorObj[prop];
            }
          });
        }
        
        console.error('Database error details:', errorDetails);
        
        // Check for common RLS issues
        if (error && typeof error === 'object' && 'code' in error && (error as { code: unknown }).code === '42501') {
          throw new Error('Permission denied. You may not have the necessary permissions to create a visitor entry.');
        }
        
        throw new Error(errorMessage);
      }
      
      if (!result) {
        throw new Error('No data returned from insert operation');
      }

      console.log('Visitor created successfully:', result);
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Visitor entry created successfully.',
      });

      // Reset the form
      form.reset();
      
      // Call the success callback which should refresh the visitor list
      if (onSuccess) {
        console.log('Calling onSuccess callback to refresh visitor list');
        onSuccess();
      }
    } catch (err) {
      const error = err as Error;
      console.error('Error creating visitor:', {
        error: error.message,
        errorString: error.toString(),
        errorObject: JSON.stringify(error, Object.getOwnPropertyNames(Object.getPrototypeOf(error))),
        stack: error.stack || 'No stack trace'
      });
      
      let errorMessage = 'Failed to create visitor entry. Please try again.';
      
      if (error instanceof Error) {
        if ('code' in error) {
          switch (error.code) {
            case '23505': // Unique violation
              errorMessage = 'A visitor with these details already exists.';
              break;
            case '42501': // Insufficient privileges
              errorMessage = 'You do not have permission to perform this action.';
              break;
            case '23503': // Foreign key violation
              errorMessage = 'Invalid reference. Please check the provided data.';
              break;
          }
        }
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="visitor_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visitor Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visitor_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (10 digits)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="9876543210" 
                    inputMode="numeric"
                    maxLength={10}
                    {...field} 
                    onChange={(e) => {
                      // Only allow numbers and update the field value
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Purpose of Visit</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide details about the purpose of the visit..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visit_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Visit Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="security_notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Security Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special instructions for security..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Visitor'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
