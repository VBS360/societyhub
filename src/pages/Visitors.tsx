import { Shield, Clock, CheckCircle, XCircle, Plus, Filter, Phone, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// AppLayout is now provided by the ProtectedRoute wrapper
import { useVisitors } from '@/hooks/useVisitors';

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
  const { visitors, loading, error } = useVisitors();
  
  if (loading) {
    return null; // AppLayout will handle the loading state
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
        <Button className="bg-gradient-to-r from-primary to-primary/80">
          <Plus className="h-4 w-4 mr-2" />
          Add Visitor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {visitors.filter(visitor => visitor.status === 'pending').length}
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {visitors.filter(visitor => visitor.status === 'in_progress').length}
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400">In Progress</p>
              </div>
              <User className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {visitors.filter(visitor => visitor.status === 'completed').length}
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">Completed</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input 
            placeholder="Search visitors by name, phone, or purpose..." 
            className="pl-4"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Visitors List */}
      <div className="space-y-4">
        {visitors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No visitors found.</p>
            </CardContent>
          </Card>
        ) : (
          visitors.map((visitor) => (
          <Card key={visitor.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                          {visitor.visitor_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{visitor.visitor_name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{visitor.visitor_phone}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-xs ${statusColors[visitor.status]}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(visitor.status)}
                        {visitor.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Purpose:</span>
                      <p className="font-medium mt-1">{visitor.purpose}</p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Host:</span>
                      <p className="font-medium mt-1">
                        {visitor.profiles?.full_name || 'Unknown Host'}
                      </p>
                      <p className="text-xs text-muted-foreground">{visitor.profiles?.unit_number || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Entry/Exit Time:</span>
                      <p className="font-medium mt-1">
                        {formatTime(visitor.entry_time)} - {formatTime(visitor.exit_time)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Duration: {calculateDuration(visitor.entry_time, visitor.exit_time)}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Visit Date:</span>
                      <p className="font-medium mt-1">
                        {new Date(visitor.visit_date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  
                  {visitor.security_notes && (
                    <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Security Notes: </span>
                      <span className="text-sm text-muted-foreground">{visitor.security_notes}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {visitor.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                        Reject
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        Approve
                      </Button>
                    </>
                  )}
                  {visitor.status === 'in_progress' && (
                    <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80">
                      Mark Exit
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>
    </div>
  );
};

export default Visitors;