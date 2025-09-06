import { MessageSquare, Plus, Calendar, Pin, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAnnouncements } from '@/hooks/useAnnouncements';

const mockAnnouncements = [
  {
    id: '1',
    title: 'Annual General Meeting - 2024',
    content: 'We are pleased to announce the Annual General Meeting for 2024 will be held on January 30th at 6:00 PM in the community hall. All residents are requested to attend this important meeting where we will discuss the society\'s annual budget, upcoming maintenance projects, and elect new committee members.',
    isUrgent: true,
    isPinned: true,
    createdBy: 'John Smith',
    createdAt: '2024-01-15T10:00:00Z',
    expiresAt: '2024-01-30T18:00:00Z',
    attachments: ['AGM_Agenda.pdf', 'Budget_2024.xlsx']
  },
  {
    id: '2',
    title: 'Water Supply Maintenance',
    content: 'The water supply will be temporarily suspended tomorrow (January 16th) from 10:00 AM to 4:00 PM for routine maintenance of the overhead tanks. Please store adequate water for your daily needs.',
    isUrgent: true,
    isPinned: false,
    createdBy: 'Sarah Johnson',
    createdAt: '2024-01-15T08:30:00Z',
    expiresAt: '2024-01-16T16:00:00Z',
    attachments: []
  },
  {
    id: '3',
    title: 'New Gym Equipment Installation',
    content: 'We are excited to announce that new gym equipment has been installed in our fitness center. The gym will be closed for two days (January 17-18) for equipment setup and safety inspections. It will reopen on January 19th with extended hours.',
    isUrgent: false,
    isPinned: true,
    createdBy: 'Mike Wilson',
    createdAt: '2024-01-14T16:20:00Z',
    expiresAt: '2024-01-25T23:59:00Z',
    attachments: ['Gym_Rules.pdf']
  },
  {
    id: '4',
    title: 'Parking Guidelines Update',
    content: 'Effective immediately, all vehicles must display the society parking stickers. Visitor parking is limited to 4 hours. Please ensure compliance to avoid towing.',
    isUrgent: false,
    isPinned: false,
    createdBy: 'Emily Davis',
    createdAt: '2024-01-13T14:15:00Z',
    expiresAt: null,
    attachments: ['Parking_Guidelines.pdf']
  },
  {
    id: '5',
    title: 'Festival Celebration - Makar Sankranti',
    content: 'Join us for Makar Sankranti celebrations on January 14th at 4:00 PM in the society garden. There will be kite flying competitions, traditional food stalls, and cultural performances. All families are welcome!',
    isUrgent: false,
    isPinned: false,
    createdBy: 'Cultural Committee',
    createdAt: '2024-01-10T12:00:00Z',
    expiresAt: '2024-01-14T20:00:00Z',
    attachments: ['Event_Schedule.pdf']
  }
];

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const isExpiringSoon = (expiresAt: string | null) => {
  if (!expiresAt) return false;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
};

const Announcements = () => {
  const { announcements, stats, loading, error } = useAnnouncements();

  if (loading) return <AppLayout><div className="p-6">Loading...</div></AppLayout>;
  if (error) return <AppLayout><div className="p-6 text-red-600">Error: {error}</div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
            <p className="text-muted-foreground">
              Important notices and updates for the society
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.total}
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Announcements</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {stats.urgent}
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400">Urgent</p>
                </div>
                <Clock className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {announcements.filter(a => a.is_urgent).length}
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Active</p>
                </div>
                <Pin className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {stats.expiringSoon}
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Expiring Soon</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      {announcement.is_urgent && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          URGENT
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{announcement.profiles?.full_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {announcement.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {announcement.content}
                </p>
                
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Announcements;