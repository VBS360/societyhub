import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddTransactionForm } from './AddTransactionForm';

export interface TransactionData {
  id?: string;
  amount: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  paymentMethod: string;
  reference?: string;
  date: Date;
}

interface AddTransactionDialogProps {
  societyId: string;
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: TransactionData | null;
}

export function AddTransactionDialog({ 
  societyId, 
  onSuccess, 
  open: externalOpen, 
  onOpenChange: setExternalOpen,
  initialData 
}: AddTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isControlled = externalOpen !== undefined && setExternalOpen !== undefined;
  const open = isControlled ? externalOpen : isOpen;
  const setOpen = isControlled ? setExternalOpen : setIsOpen;

  const handleSuccess = () => {
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <span className="mr-2">+</span> Add Transaction
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogDescription>
            {initialData?.id 
              ? 'Update the transaction details.'
              : 'Add a new income or expense to the society\'s financial records.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddTransactionForm 
            societyId={societyId} 
            onSuccess={handleSuccess}
            initialData={initialData}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
