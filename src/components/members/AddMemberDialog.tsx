import React, { useState, useEffect } from 'react';
import { Plus, Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/types/database.types';
import { SocietyRole } from '@/types/society-roles';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define the role type for the form
interface FormRole extends Omit<SocietyRole, 'permissions'> {
  permissions: string[];
}

type Profile = Database['public']['Tables']['profiles']['Insert'];

// Extend the Supabase types to include society_roles
type SupabaseClient = typeof supabase;

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    from(relation: 'society_roles'): {
      delete: any;
      select: (columns?: string) => any;
      eq: (column: string, value: any) => any;
      order: (column: string, options: { ascending: boolean }) => any;
      insert: (values: any, options?: { returning?: 'minimal' | 'representation' }) => any;
      single: () => any;
    };
  }
}

interface AddMemberDialogProps {
  onMemberAdded?: () => void;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ onMemberAdded }) => {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<FormRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<FormRole | null>(null);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  // Define form data type that extends the Profile type with our custom fields
  type FormDataType = Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'is_active' | 'role_id'> & {
    role_id: string; // Override to make it non-nullable in the form
    role_name?: string; // For display purposes only, not stored in the database
    family_members: string[]; // Override to make it non-nullable in the form
    send_invite: boolean;
    user_id?: string; // Will be set when creating the user
  };

  const [formData, setFormData] = useState<FormDataType>(() => ({
    full_name: '',
    email: '',
    phone: '',
    unit_number: '',
    role_id: '',
    role: 'resident', // Default role
    role_name: '', // For display purposes
    is_owner: false,
    emergency_contact: '',
    vehicle_details: '',
    family_members: [''],
    society_id: profile?.society_id || '',
    send_invite: true,
    user_id: '' // Will be set when creating the user
  }));
  const { toast } = useToast();

  const canAddMembers = profile?.role && ['super_admin', 'society_admin'].includes(profile.role);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!profile?.society_id) {
        console.log('No society_id found in profile');
        return;
      }
      
      setLoadingRoles(true);
      try {
        // First, check if the table exists by querying a single row
        const { error: checkError } = await supabase
          .from('society_roles')
          .select('id')
          .limit(1);
          
        if (checkError) {
          console.warn('Error accessing society_roles table:', checkError);
          // Continue anyway as it might be a permissions issue rather than a missing table
        }
        
        const { data, error } = await supabase
          .from('society_roles')
          .select('*')
          .eq('society_id', profile.society_id)
          .order('name', { ascending: true });

        if (error) {
          console.error('Supabase query error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Fetched roles:', data);
        
        const rolesData = (data || []).map(role => ({
          ...role,
          permissions: role.permissions || []
        })) as FormRole[];
        
        setRoles(rolesData);
        
        // Set default role if available
        if (rolesData.length > 0) {
          const defaultRole = rolesData.find(role => role.is_default) || rolesData[0];
          setSelectedRole(defaultRole);
          setFormData(prev => ({
            ...prev,
            role_id: defaultRole.id,
            role_name: defaultRole.name,
            society_id: profile?.society_id || ''
          }));
        } else {
          console.warn('No roles found for society:', profile.society_id);
        }
      } catch (error) {
        console.error('Error in fetchRoles:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load roles. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoadingRoles(false);
      }
    };

    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen, profile?.society_id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.society_id || !formData.role_id) {
      toast({
        title: "Error",
        description: "Please select a role for the member",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Create auth user
      const password = Math.random().toString(36).slice(-10);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: password,
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            role: 'resident',
            role_id: formData.role_id,
            society_id: profile.society_id
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Create profile with role information
      const profileData = {
        id: authData.user.id,
        user_id: authData.user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        unit_number: formData.unit_number || null,
        role: 'resident' as const,
        role_id: formData.role_id || null,
        is_owner: formData.is_owner,
        emergency_contact: formData.emergency_contact || null,
        vehicle_details: formData.vehicle_details || null,
        society_id: profile.society_id,
        family_members: formData.family_members.filter(member => member.trim() !== ''),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 3. Save profile to database
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData);

      if (profileError) throw profileError;

      // 4. Send welcome email if enabled
      if (formData.send_invite) {
        try {
          const { error: inviteError } = await supabase.functions.invoke('send-invite-email', {
            body: {
              email: formData.email,
              password: password,
              redirectTo: `${window.location.origin}/auth/reset-password`
            }
          });

          if (inviteError) {
            console.error('Error sending invite email:', inviteError);
            // Don't fail the whole operation if email fails
          }
        } catch (emailError) {
          console.error('Error in email function:', emailError);
        }
      }

      toast({
        title: "Success",
        description: `Member added successfully${formData.send_invite ? ' and invite sent' : ''}`,
      });

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        unit_number: '',
        role_id: selectedRole?.id || '',
        role: 'resident',
        role_name: '',
        is_owner: false,
        emergency_contact: '',
        vehicle_details: '',
        family_members: [''],
        society_id: profile.society_id,
        send_invite: true,
        user_id: ''
      });
      
      setIsOpen(false);
      onMemberAdded?.();
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add member. Please try again.",
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Add a new member to your society. They will receive an email with login instructions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <ScrollArea className="h-[calc(80vh-200px)] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_number">Unit Number</Label>
                  <Input
                    id="unit_number"
                    value={formData.unit_number}
                    onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                    placeholder="e.g., A101"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role *</Label>
                {loadingRoles ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Loading roles...</span>
                  </div>
                ) : (
                  <Select
                    value={formData.role_id}
                    onValueChange={(value) => {
                      const role = roles.find(r => r.id === value);
                      setSelectedRole(role || null);
                      setFormData({
                        ...formData,
                        role_id: value,
                        role_name: role?.name || ''
                      });
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          <div className="flex items-center gap-2">
                            <span>{role.name}</span>
                            {role.is_default && (
                              <Badge variant="outline" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedRole && (
                <div className="space-y-2">
                  <Label>Role Permissions</Label>
                  <div className="border rounded-md p-3 bg-muted/30">
                    {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedRole.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No specific permissions assigned to this role</p>
                    )}
                  </div>
                  {selectedRole.description && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedRole.description}</p>
                  )}
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_owner">Property Owner</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.is_owner 
                        ? 'This member is a property owner' 
                        : 'This member is a tenant/occupant'}
                    </p>
                  </div>
                  <Switch 
                    id="is_owner" 
                    checked={formData.is_owner}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_owner: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="space-y-0.5">
                    <Label htmlFor="send_invite">Send Invitation</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.send_invite 
                        ? 'An invitation email will be sent' 
                        : 'No email will be sent'}
                    </p>
                  </div>
                  <Switch 
                    id="send_invite" 
                    checked={formData.send_invite}
                    onCheckedChange={(checked) => setFormData({ ...formData, send_invite: checked })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Name and phone number"
                />
              </div>

              <div className="space-y-2">
                <Label>Vehicle Details</Label>
                <Textarea
                  value={formData.vehicle_details}
                  onChange={(e) => setFormData({ ...formData, vehicle_details: e.target.value })}
                  placeholder="Vehicle number, make, model, etc."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Family Members</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        family_members: [...formData.family_members, ''],
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Family Member
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.family_members.map((member, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={member}
                        onChange={(e) => {
                          const newMembers = [...formData.family_members];
                          newMembers[index] = e.target.value;
                          setFormData({ ...formData, family_members: newMembers });
                        }}
                        placeholder={`Family member ${index + 1} name`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newMembers = [...formData.family_members];
                          newMembers.splice(index, 1);
                          setFormData({ ...formData, family_members: newMembers });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingRoles}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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