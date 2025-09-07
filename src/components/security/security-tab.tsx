import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleManagement } from './role-management';
import { PermissionManagement } from './permission-management';
import { UserRoles } from './user-roles';

type SecurityTabProps = {
  societyId: string;
};

export const SecurityTab = ({ societyId }: SecurityTabProps) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="users">User Access</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <RoleManagement 
            societyId={societyId} 
            onRoleSelect={setSelectedRoleId} 
          />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionManagement 
            societyId={societyId} 
            roleId={selectedRoleId} 
          />
        </TabsContent>

        <TabsContent value="users">
          <UserRoles societyId={societyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
