import React, { useState, useEffect } from 'react';
import { Building, Plus, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Society {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  registration_number?: string;
}

interface SocietyManagementProps {
  canManageSociety: boolean;
}

const SocietyManagement: React.FC<SocietyManagementProps> = ({ canManageSociety }) => {
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [newSocietyData, setNewSocietyData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    registration_number: ''
  });
  
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();

  const canCreateSociety = profile?.role === 'super_admin';
  const hasNoSociety = !profile?.society_id;

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      setLoading(true);
      let query = supabase.from('societies').select('*');
      
      // If user has a society, only show that one, otherwise show all for super admins
      if (profile?.society_id) {
        query = query.eq('id', profile.society_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSocieties(data || []);
    } catch (error: any) {
      console.error('Error fetching societies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch societies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSociety = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateSociety) return;

    try {
      const { data, error } = await supabase
        .from('societies')
        .insert(newSocietyData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Society created successfully",
      });

      setNewSocietyData({
        name: '',
        address: '',
        phone: '',
        email: '',
        registration_number: ''
      });
      setIsCreateDialogOpen(false);
      fetchSocieties();
    } catch (error: any) {
      console.error('Error creating society:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create society",
        variant: "destructive",
      });
    }
  };

  const handleAssignSociety = async (societyId: string) => {
    try {
      const { error } = await updateProfile({ society_id: societyId });
      if (error) throw error;

      toast({
        title: "Success",
        description: "Society assigned successfully",
      });
      setIsAssignDialogOpen(false);
    } catch (error: any) {
      console.error('Error assigning society:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign society",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSociety = async (societyId: string, updates: Partial<Society>) => {
    try {
      const { error } = await supabase
        .from('societies')
        .update(updates)
        .eq('id', societyId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Society updated successfully",
      });
      fetchSocieties();
    } catch (error: any) {
      console.error('Error updating society:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update society",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Society Assignment for users without society */}
      {hasNoSociety && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Building className="h-5 w-5" />
              Society Assignment Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              You need to be assigned to a society to access the application features.
            </p>
            <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-orange-300 text-orange-800 hover:bg-orange-100">
                  Select Society
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Society</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Select the society you belong to from the list below:
                  </p>
                  {societies.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      No societies available. Please contact an administrator.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {societies.map((society) => (
                        <Card key={society.id} className="cursor-pointer hover:bg-muted/50">
                          <CardContent className="p-4" onClick={() => handleAssignSociety(society.id)}>
                            <h4 className="font-semibold">{society.name}</h4>
                            <p className="text-sm text-muted-foreground">{society.address}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Create New Society (Super Admin only) */}
      {canCreateSociety && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Create New Society
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Super Admin</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Society
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Society</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSociety} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Society Name *</Label>
                      <Input
                        id="name"
                        value={newSocietyData.name}
                        onChange={(e) => setNewSocietyData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registration_number">Registration Number</Label>
                      <Input
                        id="registration_number"
                        value={newSocietyData.registration_number}
                        onChange={(e) => setNewSocietyData(prev => ({ ...prev, registration_number: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      value={newSocietyData.address}
                      onChange={(e) => setNewSocietyData(prev => ({ ...prev, address: e.target.value }))}
                      required
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={newSocietyData.phone}
                        onChange={(e) => setNewSocietyData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newSocietyData.email}
                        onChange={(e) => setNewSocietyData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Create Society
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Existing Society Settings */}
      {canManageSociety && societies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Society Settings
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Admin Only</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {societies.map((society) => (
              <SocietyEditForm
                key={society.id}
                society={society}
                onUpdate={(updates) => handleUpdateSociety(society.id, updates)}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface SocietyEditFormProps {
  society: Society;
  onUpdate: (updates: Partial<Society>) => void;
}

const SocietyEditForm: React.FC<SocietyEditFormProps> = ({ society, onUpdate }) => {
  const [formData, setFormData] = useState(society);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="society-name">Society Name</Label>
          <Input
            id="society-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registration-number">Registration Number</Label>
          <Input
            id="registration-number"
            value={formData.registration_number || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="society-address">Society Address</Label>
        <Textarea
          id="society-address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="society-phone">Society Phone</Label>
          <Input
            id="society-phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="society-email">Society Email</Label>
          <Input
            id="society-email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </div>
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Update Society Settings
          </>
        )}
      </Button>
    </form>
  );
};

export default SocietyManagement;
