import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleManagement } from '@/components/security/role-management';
import { PermissionManagement } from '@/components/security/permission-management';
import { UserRoles } from '@/components/security/user-roles';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export default function SecurityPage() {
  const { profile, loading } = useAuth();
  const { toast } = useToast();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Show loading state (handled by AppLayout)
  if (loading) {
    return null; // AppLayout will handle the loading state
  }

  if (!profile || !['super_admin', 'society_admin', 'committee_member'].includes(profile.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">You don't have permission to access this section.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Security Management</h1>
        <p className="text-muted-foreground mt-2">Manage roles, permissions, and user access</p>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="users">User Access</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <RoleManagement 
            societyId={profile.society_id} 
            onRoleSelect={setSelectedRoleId} 
          />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionManagement 
            societyId={profile.society_id}
            roleId={selectedRoleId}
          />
        </TabsContent>

        <TabsContent value="users">
          <UserRoles societyId={profile.society_id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
