'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MoreVertical, Users, Settings, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Society = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  registration_number: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Array<{ count: number }>;
  member_count?: number;
};

export function SocietiesList() {
  const router = useRouter();
  const { push } = router;
  const [societies, setSocieties] = useState<Society[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSocieties = async () => {
    try {
      setIsLoading(true);
      
      // Fetch societies with member count
      const { data, error } = await supabase
        .from('societies')
        .select(`
          *,
          profiles(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to include member count
      const formattedData = data.map((society: Society) => ({
        ...society,
        member_count: society.profiles?.[0]?.count || 0
      }));

      setSocieties(formattedData);
    } catch (error) {
      console.error('Error fetching societies:', error);
      toast.error('Failed to load societies');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSociety = async (societyId: string) => {
    if (!confirm('Are you sure you want to delete this society? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('societies')
        .delete()
        .eq('id', societyId);

      if (error) throw error;

      toast.success('Society deleted successfully');
      fetchSocieties();
    } catch (error) {
      console.error('Error deleting society:', error);
      toast.error('Failed to delete society. Make sure there are no members or related records.');
    }
  };

  useEffect(() => {
    fetchSocieties();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Societies</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {societies.map((society) => (
                <TableRow key={society.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {society.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{society.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {society.registration_number || 'No registration'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    <div className="line-clamp-1">{society.address}</div>
                    {society.email && (
                      <div className="text-sm text-muted-foreground">{society.email}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      <Users className="h-3 w-3" />
                      {society.member_count} {society.member_count === 1 ? 'member' : 'members'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(society.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => push(`/societies/${society.id}/settings`)}
                          className="cursor-pointer"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Manage</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteSociety(society.id)}
                          className="cursor-pointer text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {societies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No societies found. Create your first society to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
