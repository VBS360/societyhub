import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, LogIn, LogOut, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface VisitorActionsProps {
  visitor: {
    id: string;
    status: string;
    entry_time: string | null;
    exit_time: string | null;
  };
  onStatusChange: () => void;
}

export function VisitorActions({ visitor, onStatusChange }: VisitorActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  type VisitorStatus = 'pending' | 'approved' | 'checked_in' | 'checked_out' | 'rejected';
  
  // Define the expected shape of the visitor update data
  type VisitorUpdateData = {
    status: VisitorStatus;
    entry_time?: string;
    exit_time?: string;
    updated_at: string;
    // Add other fields that might be required by your database schema
  };
  
  const updateStatus = async (status: VisitorStatus, action: string) => {
    console.log(`Starting ${action} for visitor ${visitor.id}`);
    setIsLoading(action);
    
    try {
      // Create the update object with proper typing
      const updates: Partial<VisitorUpdateData> = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      // Add action-specific fields
      if (action === 'approve') {
        console.log('Approving visitor:', visitor.id);
      } else if (action === 'check-in') {
        updates.entry_time = new Date().toISOString();
        console.log('Checking in visitor:', visitor.id, 'at', updates.entry_time);
      } else if (action === 'check-out') {
        updates.exit_time = new Date().toISOString();
        console.log('Checking out visitor:', visitor.id, 'at', updates.exit_time);
      }

      console.log('Attempting to update visitor with:', updates);
      
      // Make the update request
      const { data, error } = await supabase
        .from('visitors')
        .update(updates)
        .eq('id', visitor.id)
        .select()
        .single();

      console.log('Update response:', { data, error });

      if (error) {
        console.error('Update error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('Successfully updated visitor:', data);

      // Show success message with the action that was performed
      const actionText = action.replace('-', ' ');
      console.log(`Successfully ${actionText} visitor ${visitor.id}`);
      
      toast({
        title: 'Success',
        description: `Visitor ${actionText} successful.`,
      });

      // Call the refresh callback
      console.log('Calling onStatusChange to refresh the list');
      onStatusChange();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error ${action} visitor ${visitor.id}:`, error);
      
      toast({
        title: 'Error',
        description: `Failed to ${action} visitor: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const getActionButton = (status: string, action: string) => {
    const actions = {
      pending: (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => updateStatus('approved' as const, 'approve')}
          disabled={isLoading === 'approve'}
        >
          {isLoading === 'approve' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Approve
        </Button>
      ),
      approved: (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => updateStatus('checked_in' as const, 'check-in')}
          disabled={isLoading === 'check-in'}
        >
          {isLoading === 'check-in' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          Check In
        </Button>
      ),
      checked_in: (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => updateStatus('checked_out' as const, 'check-out')}
          disabled={isLoading === 'check-out'}
        >
          {isLoading === 'check-out' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Check Out
        </Button>
      ),
      rejected: (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => updateStatus('approved', 'approve')}
          disabled={isLoading === 'approve'}
        >
          {isLoading === 'approve' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          Approve
        </Button>
      ),
    };

    return actions[status as keyof typeof actions] || null;
  };

  const getRejectButton = (status: string) => {
    if (status === 'rejected' || status === 'checked_out' || status === 'checked_in') {
      return null;
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
        onClick={() => updateStatus('rejected', 'reject')}
        disabled={isLoading === 'reject'}
      >
        {isLoading === 'reject' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
        Reject
      </Button>
    );
  };

  return (
    <div className="flex items-center gap-2">
      {getActionButton(visitor.status, visitor.status)}
      {getRejectButton(visitor.status)}
    </div>
  );
}
