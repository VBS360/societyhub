import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddMemberForm from './AddMemberForm';

interface AddMemberDialogProps {
  onMemberAdded?: () => void;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ onMemberAdded }) => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const canAddMembers = profile?.role && ['super_admin', 'society_admin'].includes(profile.role);

  const handleMemberAdded = () => {
    setIsOpen(false);
    if (onMemberAdded) {
      onMemberAdded();
    }
  };

  if (!canAddMembers) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new member to your society.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 pt-4">
          <AddMemberForm 
            onSuccess={handleMemberAdded}
            societyId={profile?.society_id || ''}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
