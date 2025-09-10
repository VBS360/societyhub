import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PermissionManagementProps {
  societyId: string | null;
  roleId: string;
}

export function PermissionManagement({ societyId, roleId }: PermissionManagementProps) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (roleId && societyId) {
      fetchRolePermissions();
    }
  }, [roleId, societyId]);

  const fetchRolePermissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('society_roles')
        .select('permissions')
        .eq('id', roleId)
        .single();

      if (error) throw error;

      setPermissions(data?.permissions || []);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load permissions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!roleId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a role to view its permissions</p>
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
        {loading ? (
          <p>Loading permissions...</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {permissions.length > 0 ? (
                permissions.map((permission) => (
                  <Badge key={permission} variant="secondary">
                    {permission.replace(/_/g, ' ')}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No permissions assigned to this role</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}