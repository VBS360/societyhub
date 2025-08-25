import { Calendar, MapPin, Users, Clock, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMemo, useState } from 'react';
import { MonthCalendar } from '@/components/events/MonthCalendar';

const mockEvents = [
  {
    id: '1',
    title: 'New Year Celebration',
    description: 'Join us for a grand New Year celebration with live music, dance performances, and delicious food. Bring your family and friends for an unforgettable evening!',
    eventDate: '2024-12-31T20:00:00Z',
    location: 'Society Community Hall',
    organizer: 'Cultural Committee',
    maxAttendees: 100,
    currentAttendees: 45,
    requiresRSVP: true,
    category: 'Festival',
    status: 'upcoming',
    images: []
  },
  {
    id: '2',
    title: 'Health & Wellness Workshop',
    description: 'A comprehensive workshop on health and wellness featuring yoga sessions, nutrition guidance, and stress management techniques.',
    eventDate: '2024-01-20T09:00:00Z',
    location: 'Society Gym',
    organizer: 'Health Committee',
    maxAttendees: 30,
    currentAttendees: 18,
    requiresRSVP: true,
    category: 'Health',
    status: 'upcoming',
    images: []
  },
  {
    id: '3',
    title: 'Children\'s Sports Day',
    description: 'Fun-filled sports activities for children including relay races, football, badminton, and prize distribution ceremony.',
    eventDate: '2024-01-25T16:00:00Z',
    location: 'Society Playground',
    organizer: 'Sports Committee',
    maxAttendees: 60,
    currentAttendees: 32,
    requiresRSVP: true,
    category: 'Sports',
    status: 'upcoming',
    images: []
  },
  {
    id: '4',
    title: 'Republic Day Celebration',
    description: 'Celebrate Republic Day with flag hoisting ceremony, cultural programs, and patriotic songs.',
    eventDate: '2024-01-26T08:00:00Z',
    location: 'Society Main Gate',
    organizer: 'Management Committee',
    maxAttendees: null,
    currentAttendees: 78,
    requiresRSVP: false,
    category: 'National',
    status: 'upcoming',
    images: []
  },
  {
    id: '5',
    title: 'Annual Blood Donation Camp',
    description: 'Annual blood donation camp in association with local hospital. Help save lives by donating blood.',
    eventDate: '2024-01-15T10:00:00Z',
    location: 'Society Community Hall',
    organizer: 'Social Service Committee',
    maxAttendees: 50,
    currentAttendees: 23,
    requiresRSVP: true,
    category: 'Social Service',
    status: 'completed',
    images: []
  },
  {
    id: '6',
    title: 'Gardening Workshop',
    description: 'Learn organic gardening techniques, plant care, and sustainable farming methods from expert gardeners.',
    eventDate: '2024-02-05T10:00:00Z',
    location: 'Society Garden',
    organizer: 'Environment Committee',
    maxAttendees: 25,
    currentAttendees: 12,
    requiresRSVP: true,
    category: 'Environment',
    status: 'upcoming',
    images: []
  }
];

const categoryColors = {
  'Festival': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  'Health': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'Sports': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'National': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  'Social Service': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'Environment': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
};

const statusColors = {
  'upcoming': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'completed': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Events = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const stats = {
    total: mockEvents.length,
    upcoming: mockEvents.filter(e => e.status === 'upcoming').length,
    completed: mockEvents.filter(e => e.status === 'completed').length,
    totalAttendees: mockEvents.reduce((sum, e) => sum + e.currentAttendees, 0),
  };

  const eventsForCalendar = useMemo(
    () => mockEvents.map(({ id, title, eventDate }) => ({ id, title, eventDate })),
    []
  );

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return mockEvents;
    return mockEvents.filter((e) => {
      const d = new Date(e.eventDate);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
    });
  }, [selectedDate]);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Society events, celebrations, and community activities
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
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
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Events</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats.upcoming}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">Upcoming</p>
                </div>
                <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.completed}
                  </div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Completed</p>
                </div>
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {stats.totalAttendees}
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Total RSVPs</p>
                </div>
                <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar + Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <MonthCalendar events={eventsForCalendar} selected={selectedDate} onSelect={setSelectedDate} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input 
                  placeholder="Search events by title, category, or organizer..." 
                  className="pl-4"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>

            {selectedDate && (
              <div className="text-sm text-muted-foreground">
                Showing events for {selectedDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                <Button variant="link" className="ml-2 px-1" onClick={() => setSelectedDate(null)}>Clear</Button>
              </div>
            )}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs ${categoryColors[event.category]}`}>
                        {event.category}
                      </Badge>
                      <Badge className={`text-xs ${statusColors[event.status]}`}>
                        {event.status.toUpperCase()}
                      </Badge>
                      {event.requiresRSVP && (
                        <Badge variant="outline" className="text-xs">
                          RSVP Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {event.organizer.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {event.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.currentAttendees} attendees
                      {event.maxAttendees && ` (${event.maxAttendees} max)`}
                    </span>
                  </div>
                </div>

                {event.maxAttendees && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Attendance</span>
                      <span>{event.currentAttendees}/{event.maxAttendees}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
                        style={{ width: `${(event.currentAttendees / event.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    By {event.organizer}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {event.status === 'upcoming' && event.requiresRSVP && (
                      <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80">
                        RSVP
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Events;