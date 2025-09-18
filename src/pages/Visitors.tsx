import { Shield, Clock, CheckCircle, XCircle, Filter, Phone, User, Search, Calendar as CalendarIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useVisitors } from '@/hooks/useVisitors';
import { format, subDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { VisitorActions } from '@/components/visitors/VisitorActions';
import { AddVisitorDialog } from '@/components/visitors/AddVisitorDialog';
import { error } from 'console';

// Define the Visitor type locally since it's not exported from useVisitors
interface Visitor {
  id: string;
  visitor_name: string;
  visitor_phone?: string;
  purpose: string;
  host_profile_id: string;
  society_id: string;
  visit_date: string;
  entry_time?: string;
  exit_time?: string;
  status: string;
  security_notes?: string;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; unit_number: string };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'in_progress':
    case 'approved':
      return <Shield className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const formatTime = (timeString: string | null) => {
  if (!timeString) return 'N/A';
  return new Date(timeString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const calculateDuration = (entryTime: string | null, exitTime: string | null) => {
  if (!entryTime || !exitTime) return 'N/A';
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  const durationMs = exit.getTime() - entry.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const Visitors = () => {
  const { visitors = [], loading, error } = useVisitors();
  
  // Function to refresh the visitors list
  const refreshVisitors = () => {
    // The real-time subscription in useVisitors will handle the refresh
    // This is a no-op as the component will re-render when data changes
  };
  
  // Type guard to check if visitor is not null/undefined
  const isValidVisitor = (visitor: Visitor | null | undefined): visitor is Visitor => {
    return !!visitor && !!visitor.id;
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  
  const filteredVisitors = useMemo(() => {
    console.log('Filtering visitors:', { 
      activeTab, 
      dateFilter: dateFilter?.toISOString(),
      searchTerm,
      totalVisitors: visitors.length
    });
    
    return visitors
      .filter(isValidVisitor)
      .filter(visitor => {
        try {
          // Filter by search term
          const matchesSearch = 
            !searchTerm ||
            (visitor.visitor_name && visitor.visitor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (visitor.visitor_phone && visitor.visitor_phone.includes(searchTerm)) ||
            (visitor.profiles?.unit_number && visitor.profiles.unit_number.toLowerCase().includes(searchTerm.toLowerCase()));
          
          // If no date filter is active, just return the search results
          if (activeTab !== 'today' && !dateFilter) {
            console.log('No date filter, matchesSearch:', matchesSearch);
            return matchesSearch;
          }
          
          // Get the visit date from the visitor record
          if (!visitor.visit_date) {
            console.log('No visit date for visitor:', visitor.id);
            return false;
          }
          
          const visitDate = new Date(visitor.visit_date);
          if (isNaN(visitDate.getTime())) {
            console.error('Invalid visit date:', visitor.visit_date);
            return false;
          }
          
          // Get today's date at midnight for comparison
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Get the filter date (either from date picker or today)
          const filterDate = dateFilter ? new Date(dateFilter) : new Date();
          filterDate.setHours(0, 0, 0, 0);
          
          // Create comparison dates (just the date part)
          const visitDateOnly = new Date(visitDate);
          visitDateOnly.setHours(0, 0, 0, 0);
          
          // Check if the visit date matches the filter date
          const isSameDay = visitDateOnly.getTime() === filterDate.getTime();
          
          console.log('Date comparison:', {
            visitorId: visitor.id,
            visitorName: visitor.visitor_name,
            visitDate: visitDate.toISOString(),
            visitDateOnly: visitDateOnly.toISOString(),
            filterDate: filterDate.toISOString(),
            isSameDay,
            matchesSearch
          });
          
          return matchesSearch && isSameDay;
        } catch (error) {
          console.error('Error filtering visitor:', visitor.id, error);
          return false;
        }
      });
  }, [visitors, searchTerm, dateFilter, activeTab]);
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Error loading visitors data: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitors</h1>
          <p className="text-muted-foreground">
            Manage visitor entries and track society security
          </p>
        </div>
        <AddVisitorDialog onSuccess={refreshVisitors} />
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {visitors.length}
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Visitors</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search visitors by name, phone, or purpose..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <Filter className="mr-2 h-4 w-4" />
                Filter by date
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                initialFocus
              />
              {dateFilter && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setDateFilter(undefined)}
                  >
                    Clear date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Visitors List */}
      <Tabs 
        value={activeTab}
        className="space-y-4"
        onValueChange={(value) => {
          console.log('Tab changed to:', value);
          setActiveTab(value);
          if (value === 'today') {
            const today = new Date();
            console.log('Setting date filter to today:', today.toISOString());
            setDateFilter(today);
          } else {
            console.log('Clearing date filter');
            setDateFilter(undefined);
          }
        }}
      >
        <TabsList>
          <TabsTrigger value="all">
            All
          </TabsTrigger>
          <TabsTrigger value="today">
            Today
          </TabsTrigger>
        </TabsList>
        
        <div className="space-y-4">
          {filteredVisitors.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No visitors found matching your criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredVisitors.map((visitor) => (
              <Card key={visitor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                            {visitor.visitor_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-semibold">{visitor.visitor_name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{visitor.visitor_phone || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <VisitorActions 
                        visitor={{
                          id: visitor.id,
                          status: visitor.status,
                          entry_time: visitor.entry_time || null,
                          exit_time: visitor.exit_time || null
                        }} 
                        onStatusChange={refreshVisitors} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Purpose:</span>
                        <p className="font-medium mt-1">{visitor.purpose || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Host:</span>
                        <p className="font-medium mt-1">
                          {visitor.profiles?.full_name || 'N/A'}
                          {visitor.profiles?.unit_number && ` (${visitor.profiles.unit_number})`}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Visit Date:</span>
                        <p className="font-medium mt-1">
                          {visitor.visit_date ? new Date(visitor.visit_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Entry Time:</span>
                        <p className="font-medium mt-1">
                          {visitor.entry_time ? new Date(visitor.entry_time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Exit Time:</span>
                        <p className="font-medium mt-1">
                          {visitor.exit_time ? new Date(visitor.exit_time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'N/A'}
                        </p>
                      </div>
                      
                      {visitor.entry_time && visitor.exit_time && (
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <p className="font-medium mt-1">
                            {calculateDuration(visitor.entry_time, visitor.exit_time)}
                          </p>
                        </div>
                      )}
                      
                      {visitor.security_notes && (
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">Security Notes:</span>
                          <p className="font-medium mt-1">{visitor.security_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Tabs>
</div>
);
};

export default Visitors;