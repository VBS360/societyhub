import { Calendar, MapPin, Users, Clock, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMemo, useState } from 'react';
import { MonthCalendar } from '@/components/events/MonthCalendar';
import { useEvents } from '@/hooks/useEvents';

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
  const { events, stats, loading, error } = useEvents();

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center text-red-600">Error loading events: {error}</div>
        </div>
      </AppLayout>
    );
  }

  const eventsForCalendar = useMemo(
    () => events.map(({ id, title, event_date }) => ({ id, title, eventDate: event_date })),
    [events]
  );

  const filteredEvents = useMemo(() => {
    if (!selectedDate) return events;
    return events.filter((e) => {
      const d = new Date(e.event_date);
      return (
        d.getFullYear() === selectedDate.getFullYear() &&
        d.getMonth() === selectedDate.getMonth() &&
        d.getDate() === selectedDate.getDate()
      );
    });
  }, [selectedDate, events]);

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
          {filteredEvents.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No events found.</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="text-xs bg-primary/10 text-primary">
                        General
                      </Badge>
                      <Badge className={`text-xs ${
                        new Date(event.event_date) > new Date() 
                          ? statusColors.upcoming 
                          : statusColors.completed
                      }`}>
                        {new Date(event.event_date) > new Date() ? 'UPCOMING' : 'COMPLETED'}
                      </Badge>
                      {event.requires_rsvp && (
                        <Badge variant="outline" className="text-xs">
                          RSVP Required
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {event.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'E'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {event.description || 'No description available.'}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.max_attendees ? `Max ${event.max_attendees} attendees` : 'Open to all'}
                    </span>
                  </div>
                </div>

                {event.max_attendees && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Capacity</span>
                      <span>0/{event.max_attendees}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300"
                        style={{ width: '0%' }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">
                    By {event.profiles?.full_name || 'Event Organizer'}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {new Date(event.event_date) > new Date() && event.requires_rsvp && (
                      <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80">
                        RSVP
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Events;