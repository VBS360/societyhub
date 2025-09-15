import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Role = {
  id: string;
  name: string;
  description: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  society_id: string;
};

type RoleManagementProps = {
  societyId: string;
  onRoleSelect: (roleId: string) => void;
};

export const RoleManagement = ({ societyId, onRoleSelect }: RoleManagementProps) => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [newRoleName, setNewRoleName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('society_roles')
        .select('*')
        .eq('society_id', societyId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const rolesData = data || [];
      setRoles(rolesData);
      
      // Select the first role by default if none selected
      if (rolesData.length > 0 && !selectedRoleId) {
        const firstRoleId = rolesData[0].id;
        setSelectedRoleId(firstRoleId);
        onRoleSelect(firstRoleId);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    }
  };

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('society_roles')
        .insert({
          society_id: societyId, 
          name: newRoleName.trim(),
          description: `Custom role: ${newRoleName}`
        } as any)
        .select()
        .single();

      if (error) throw error;
      
      setNewRoleName('');
      await fetchRoles();
      
      // Select the newly created role
      if (data) {
        setSelectedRoleId((data as any).id);
        onRoleSelect((data as any).id);
      }
      
      toast.success('Role created successfully');
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRole = (roleId: string) => {
    navigate(`/security/roles/${roleId}/edit`);
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) return;
    
    try {
      // Use the correct delete method signature for Supabase
      const { error } = await supabase
        .from('society_roles')
        .delete({ returnType: 'minimal' } as any)
        .eq('id', roleId);

      if (error) throw error;
      
      await fetchRoles();
      toast.success('Role deleted successfully');
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role. Make sure no users are assigned to it.');
    }
  };

  useEffect(() => {
    if (societyId) {
      fetchRoles();
    }
  }, [societyId]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Manage Roles</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={createRole} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="New role name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="max-w-sm"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !newRoleName.trim()}>
            {isLoading ? 'Creating...' : 'Create Role'}
          </Button>
        </form>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow 
                  key={role.id} 
                  className={`cursor-pointer hover:bg-muted/50 ${selectedRoleId === role.id ? 'bg-muted' : ''}`}
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    onRoleSelect(role.id);
                  }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {role.name}
                      {role.is_default && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedRoleId === role.id ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoleId(role.id);
                          onRoleSelect(role.id);
                        }}
                      >
                        {selectedRoleId === role.id ? 'Selected' : 'Select'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRole(role.id);
                        }}
                        disabled={role.is_default}
                        title={role.is_default ? 'Default roles cannot be deleted' : 'Delete role'}
                        className="text-destructive hover:text-destructive"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {roles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                    No roles found. Create your first role above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
