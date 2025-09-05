import React, { useState } from 'react';
import { Shield, Users, Plus, Edit, Trash2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useMembers';

const AVAILABLE_PERMISSIONS = [
  { id: 'view_members', label: 'View Members', category: 'Members' },
  { id: 'edit_members', label: 'Edit Members', category: 'Members' },
  { id: 'delete_members', label: 'Delete Members', category: 'Members' },
  { id: 'view_finances', label: 'View Finances', category: 'Finance' },
  { id: 'edit_finances', label: 'Edit Finances', category: 'Finance' },
  { id: 'view_maintenance', label: 'View Maintenance', category: 'Maintenance' },
  { id: 'edit_maintenance', label: 'Edit Maintenance', category: 'Maintenance' },
  { id: 'view_announcements', label: 'View Announcements', category: 'Announcements' },
  { id: 'create_announcements', label: 'Create Announcements', category: 'Announcements' },
  { id: 'edit_announcements', label: 'Edit Announcements', category: 'Announcements' },
  { id: 'delete_announcements', label: 'Delete Announcements', category: 'Announcements' },
  { id: 'view_events', label: 'View Events', category: 'Events' },
  { id: 'create_events', label: 'Create Events', category: 'Events' },
  { id: 'edit_events', label: 'Edit Events', category: 'Events' },
  { id: 'view_visitors', label: 'View Visitors', category: 'Visitors' },
  { id: 'manage_visitors', label: 'Manage Visitors', category: 'Visitors' },
  { id: 'view_amenities', label: 'View Amenities', category: 'Amenities' },
  { id: 'book_amenities', label: 'Book Amenities', category: 'Amenities' },
  { id: 'manage_amenities', label: 'Manage Amenities', category: 'Amenities' }
];

const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: AVAILABLE_PERMISSIONS.map(p => p.id),
  society_admin: AVAILABLE_PERMISSIONS.filter(p => 
    !['delete_members', 'delete_announcements'].includes(p.id)
  ).map(p => p.id),
  committee_member: [
    'view_members', 'view_finances', 'view_maintenance', 'edit_maintenance',
    'view_announcements', 'create_announcements', 'view_events', 'create_events',
    'view_visitors', 'manage_visitors', 'view_amenities', 'manage_amenities'
  ],
  resident: [
    'view_announcements', 'view_events', 'view_amenities', 'book_amenities'
  ],
  guest: [
    'view_announcements', 'view_events'
  ]
};

interface RoleManagementProps {
  canManageRoles: boolean;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ canManageRoles }) => {
  const { profile } = useAuth();
  const { members } = useMembers();
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!canManageRoles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Management
            <Badge variant="outline" className="text-xs">Admin Only</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You don't have permission to manage roles and permissions.</p>
        </CardContent>
      </Card>
    );
  }

  const handleRoleUpdate = async (memberId: string, newRole: string, permissions: string[]) => {
    // This would integrate with Supabase to update roles
    console.log('Updating role for member:', memberId, 'to:', newRole, 'with permissions:', permissions);
    // Implementation would go here
  };

  const membersByRole = members.reduce((acc, member) => {
    const role = member.role || 'resident';
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {} as Record<string, typeof members>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role & Permission Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(membersByRole).map(([role, roleMembers]) => (
            <Card key={role} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold capitalize">{role.replace('_', ' ')}</h4>
                  <Badge variant="outline">{roleMembers.length}</Badge>
                </div>
                <div className="space-y-1">
                  {roleMembers.slice(0, 3).map(member => (
                    <div key={member.id} className="text-sm text-muted-foreground">
                      {member.full_name}
                    </div>
                  ))}
                  {roleMembers.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{roleMembers.length - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Assign Role Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Assign Roles & Permissions
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assign Roles & Permissions</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Member Selection */}
              <div className="space-y-2">
                <Label>Select Member</Label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="">Choose a member...</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} ({member.unit_number}) - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMember && (
                <>
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="resident">Resident</option>
                      <option value="committee_member">Committee Member</option>
                      <option value="society_admin">Society Admin</option>
                      {profile?.role === 'super_admin' && (
                        <option value="super_admin">Super Admin</option>
                      )}
                    </select>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-4">
                    <Label>Custom Permissions</Label>
                    {Object.entries(
                      AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
                        if (!acc[perm.category]) acc[perm.category] = [];
                        acc[perm.category].push(perm);
                        return acc;
                      }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>)
                    ).map(([category, permissions]) => (
                      <div key={category}>
                        <h4 className="font-medium mb-2">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                          {permissions.map(permission => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox id={permission.id} />
                              <Label htmlFor={permission.id} className="text-sm">
                                {permission.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Role Templates */}
        <div className="space-y-3">
          <h4 className="font-semibold">Role Templates</h4>
          <div className="space-y-2">
            {Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([role, permissions]) => (
              <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h5 className="font-medium capitalize">{role.replace('_', ' ')}</h5>
                  <p className="text-sm text-muted-foreground">
                    {permissions.length} permissions
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {membersByRole[role]?.length || 0} members
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleManagement;