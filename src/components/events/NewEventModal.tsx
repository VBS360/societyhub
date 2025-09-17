import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { NewEventForm } from './NewEventForm';

export function NewEventModal({ open, onOpenChange, onSuccess }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 p-6 border-r border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-xl mb-6">Create Event</DialogTitle>
            </DialogHeader>
            <nav className="space-y-1">
              <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">
                Event Details
              </button>
              <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-md">
                Ticket Types
              </button>
              <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-md">
                Publish
              </button>
            </nav>
          </div>

          {/* Main Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <NewEventForm onSuccess={handleSuccess} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
