import { Search, Filter, Plus, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMembers } from '@/hooks/useMembers';
import AddMemberDialog from '@/components/members/AddMemberDialog';
import { useState } from 'react';


const roleColors = {
  resident: 'bg-secondary text-secondary-foreground',
  committee_member: 'bg-accent text-accent-foreground',
  society_admin: 'bg-primary text-primary-foreground',
  super_admin: 'bg-destructive text-destructive-foreground',
};

const roleLabels = {
  resident: 'Resident',
  committee_member: 'Committee',
  society_admin: 'Admin',
  super_admin: 'Super Admin',
};

const Members = () => {
  const { members, loading, error, totalMembers, owners, tenants, totalResidents } = useMembers();
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Members</h1>
            <p className="text-muted-foreground">
              Manage society members and their information
            </p>
          </div>
          <AddMemberDialog onMemberAdded={() => window.location.reload()} />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search members by name, unit, or email..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalMembers}
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Members</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : owners}
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">Owners</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : tenants}
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Tenants</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalResidents}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-400">Total Residents</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Members Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members
              .filter(member => 
                searchQuery === '' || 
                member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (member.unit_number && member.unit_number.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((member) => (
                <Card key={member.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                            {member.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{member.full_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {member.unit_number || 'N/A'}
                            </Badge>
                            <Badge className={`text-xs ${roleColors[member.role] || roleColors.resident}`}>
                              {roleLabels[member.role] || 'Resident'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{member.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm">
                          <span className="font-medium">{member.is_owner ? 'Owner' : 'Tenant'}</span>
                          <span className="text-muted-foreground"> • {member.family_members?.length || 1} members</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            }
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && members.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No members found in this society.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Members;