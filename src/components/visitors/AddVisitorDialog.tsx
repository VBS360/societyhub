import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VisitorForm } from './VisitorForm';

export function AddVisitorDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-primary/80">
          <Plus className="h-4 w-4 mr-2" />
          Add Visitor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Visitor</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <VisitorForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
