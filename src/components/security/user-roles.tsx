import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const UserRoles = ({ societyId }: { societyId: string }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    if (!societyId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch users in this society
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, role_id, society_roles(name)')
        .eq('society_id', societyId)
        .order('created_at', { ascending: true });

      if (usersError) throw usersError;

      // Fetch available roles for this society
      const { data: rolesData, error: rolesError } = await supabase
        .from('society_roles')
        .select('*')
        .eq('society_id', societyId)
        .order('name', { ascending: true });

      if (rolesError) throw rolesError;

      setUsers(usersData || []);
      setRoles(rolesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, roleId: string | null) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role_id: roleId,
          // If role_id is being set, update the role to society_member
          ...(roleId ? { role: 'society_member' as const } : {})
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                role_id: roleId,
                role: roleId ? 'society_member' : user.role
              } 
            : user
        )
      );
      
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (societyId) {
      fetchData();
    }
  }, [societyId]);

  if (!societyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a society to manage user roles.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>User Roles</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Custom Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'No name'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role_id || ''}
                      onValueChange={(value) => 
                        updateUserRole(user.id, value || null)
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="No custom role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No custom role</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    No users found in this society.
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
