import React, { useState } from 'react';
import { Plus, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddMemberDialogProps {
  onMemberAdded?: () => void;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ onMemberAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    unit_number: '',
    role: 'resident',
    is_owner: true,
    emergency_contact: '',
    vehicle_details: '',
    family_members: ['']
  });
  
  const { profile } = useAuth();
  const { toast } = useToast();

  const canAddMembers = profile?.role && ['super_admin', 'society_admin'].includes(profile.role);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFamilyMemberChange = (index: number, value: string) => {
    const updatedFamilyMembers = [...formData.family_members];
    updatedFamilyMembers[index] = value;
    setFormData(prev => ({ ...prev, family_members: updatedFamilyMembers }));
  };

  const addFamilyMember = () => {
    setFormData(prev => ({ 
      ...prev, 
      family_members: [...prev.family_members, ''] 
    }));
  };

  const removeFamilyMember = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      family_members: prev.family_members.filter((_, i) => i !== index) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.society_id) {
      toast({
        title: "Error",
        description: "No society associated with your account",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          ...formData,
          role: formData.role as any,
          society_id: profile.society_id,
          user_id: crypto.randomUUID(), // Temporary UUID for admin-created profiles
          family_members: formData.family_members.filter(member => member.trim() !== ''),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added successfully",
      });

      setFormData({
        full_name: '',
        email: '',
        phone: '',
        unit_number: '',
        role: 'resident',
        is_owner: true,
        emergency_contact: '',
        vehicle_details: '',
        family_members: ['']
      });
      
      setIsOpen(false);
      onMemberAdded?.();
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!canAddMembers) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-primary/80">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_number">Unit Number</Label>
              <Input
                id="unit_number"
                value={formData.unit_number}
                onChange={(e) => handleInputChange('unit_number', e.target.value)}
              />
            </div>
          </div>

          {/* Role and Ownership */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="committee_member">Committee Member</SelectItem>
                  <SelectItem value="society_admin">Society Admin</SelectItem>
                  {profile?.role === 'super_admin' && (
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ownership Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_owner}
                  onCheckedChange={(checked) => handleInputChange('is_owner', checked)}
                />
                <span className="text-sm">{formData.is_owner ? 'Owner' : 'Tenant'}</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Emergency Contact</Label>
            <Input
              id="emergency_contact"
              value={formData.emergency_contact}
              onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
              placeholder="Emergency contact number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle_details">Vehicle Details</Label>
            <Textarea
              id="vehicle_details"
              value={formData.vehicle_details}
              onChange={(e) => handleInputChange('vehicle_details', e.target.value)}
              placeholder="Car model, registration number, parking slot, etc."
              rows={3}
            />
          </div>

          {/* Family Members */}
          <div className="space-y-2">
            <Label>Family Members</Label>
            {formData.family_members.map((member, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={member}
                  onChange={(e) => handleFamilyMemberChange(index, e.target.value)}
                  placeholder={`Family member ${index + 1}`}
                />
                {formData.family_members.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFamilyMember(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFamilyMember}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Family Member
            </Button>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Member'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;