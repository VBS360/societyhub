import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SYSTEM_PERMISSIONS = [
  { id: 'manage_societies', label: 'Manage Societies' },
  { id: 'manage_system_settings', label: 'Manage System Settings' },
  { id: 'manage_members', label: 'Manage Members' },
  { id: 'manage_roles', label: 'Manage Roles' },
  { id: 'manage_announcements', label: 'Manage Announcements' },
  { id: 'manage_events', label: 'Manage Events' },
  { id: 'manage_finances', label: 'Manage Finances' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'manage_visitors', label: 'Manage Visitors' },
  { id: 'view_announcements', label: 'View Announcements' },
  { id: 'book_amenities', label: 'Book Amenities' },
  { id: 'view_public_info', label: 'View Public Information' },
];

export const PermissionManagement = ({ roleId, societyId }: { roleId: string; societyId: string }) => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchRolePermissions = async () => {
    if (!roleId) return;
    
    try {
      const { data, error } = await supabase
        .from('society_role_permissions')
        .select('permission')
        .eq('role_id', roleId);

      if (error) throw error;

      const rolePermissions = data.map(p => p.permission);
      const permissionsMap = {} as Record<string, boolean>;
      
      SYSTEM_PERMISSIONS.forEach(perm => {
        permissionsMap[perm.id] = rolePermissions.includes(perm.id);
      });
      
      setPermissions(permissionsMap);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast.error('Failed to load permissions');
    }
  };

  const handlePermissionChange = async (permissionId: string, isChecked: boolean) => {
    try {
      setIsLoading(true);
      
      if (isChecked) {
        // Add permission
        const { error } = await supabase
          .from('society_role_permissions')
          .insert([{ role_id: roleId, permission: permissionId }]);
          
        if (error) throw error;
      } else {
        // Remove permission
        const { error } = await supabase
          .from('society_role_permissions')
          .delete()
          .eq('role_id', roleId)
          .eq('permission', permissionId);
          
        if (error) throw error;
      }
      
      // Update local state
      setPermissions(prev => ({
        ...prev,
        [permissionId]: isChecked
      }));
      
      toast.success('Permissions updated successfully');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roleId) {
      fetchRolePermissions();
    } else {
      // Initialize with all false if no role selected
      const initialPermissions = {} as Record<string, boolean>;
      SYSTEM_PERMISSIONS.forEach(perm => {
        initialPermissions[perm.id] = false;
      });
      setPermissions(initialPermissions);
    }
  }, [roleId]);

  if (!societyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a society to manage permissions.</p>
        </CardContent>
      </Card>
    );
  }

  if (!roleId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a role to manage its permissions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {SYSTEM_PERMISSIONS.map((permission) => (
            <div key={permission.id} className="flex items-center space-x-2">
              <Checkbox
                id={permission.id}
                checked={permissions[permission.id] || false}
                onCheckedChange={(checked) => 
                  handlePermissionChange(permission.id, checked as boolean)
                }
                disabled={isLoading}
              />
              <Label htmlFor={permission.id} className="text-sm font-medium leading-none">
                {permission.label}
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
