import { Shield, Clock, CheckCircle, XCircle, Plus, Filter, Phone, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppLayout } from '@/components/layout/AppLayout';

const mockVisitors = [
  {
    id: '1',
    visitorName: 'Rajesh Kumar',
    visitorPhone: '+91 9876543210',
    purpose: 'Delivery - Amazon Package',
    hostName: 'John Doe',
    hostUnit: 'A-101',
    visitDate: '2024-01-15',
    entryTime: '2024-01-15T10:30:00Z',
    exitTime: '2024-01-15T10:45:00Z',
    status: 'completed',
    securityNotes: 'Package delivered successfully'
  },
  {
    id: '2',
    visitorName: 'Dr. Priya Sharma',
    visitorPhone: '+91 9876543211',
    purpose: 'Medical Visit - Home Consultation',
    hostName: 'Sarah Johnson',
    hostUnit: 'B-205',
    visitDate: '2024-01-15',
    entryTime: '2024-01-15T15:00:00Z',
    exitTime: null,
    status: 'in_progress',
    securityNotes: 'Doctor visit verified with host'
  },
  {
    id: '3',
    visitorName: 'Amit Verma',
    visitorPhone: '+91 9876543212',
    purpose: 'Social Visit - Friend',
    hostName: 'Mike Wilson',
    hostUnit: 'C-302',
    visitDate: '2024-01-15',
    entryTime: null,
    exitTime: null,
    status: 'pending',
    securityNotes: 'Waiting for host approval'
  },
  {
    id: '4',
    visitorName: 'Cleaning Service Team',
    visitorPhone: '+91 9876543213',
    purpose: 'House Cleaning Service',
    hostName: 'Emily Davis',
    hostUnit: 'A-505',
    visitDate: '2024-01-15',
    entryTime: '2024-01-15T09:00:00Z',
    exitTime: '2024-01-15T12:00:00Z',
    status: 'completed',
    securityNotes: 'Regular cleaning service'
  },
  {
    id: '5',
    visitorName: 'Ravi Technician',
    visitorPhone: '+91 9876543214',
    purpose: 'AC Repair Service',
    hostName: 'Robert Brown',
    hostUnit: 'B-108',
    visitDate: '2024-01-15',
    entryTime: '2024-01-15T14:00:00Z',
    exitTime: null,
    status: 'in_progress',
    securityNotes: 'AC repair in progress'
  },
  {
    id: '6',
    visitorName: 'Maya Gupta',
    visitorPhone: '+91 9876543215',
    purpose: 'Social Visit - Relative',
    hostName: 'John Doe',
    hostUnit: 'A-101',
    visitDate: '2024-01-14',
    entryTime: '2024-01-14T18:00:00Z',
    exitTime: '2024-01-14T22:30:00Z',
    status: 'completed',
    securityNotes: 'Family visit'
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'in_progress':
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
  const stats = {
    total: mockVisitors.length,
    pending: mockVisitors.filter(v => v.status === 'pending').length,
    inProgress: mockVisitors.filter(v => v.status === 'in_progress').length,
    completed: mockVisitors.filter(v => v.status === 'completed').length,
  };

  return (
    <AppLayout>
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
                    {stats.total}
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
                    {stats.pending}
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
                    {stats.inProgress}
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
                    {stats.completed}
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
          {mockVisitors.map((visitor) => (
            <Card key={visitor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                            {visitor.visitorName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{visitor.visitorName}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{visitor.visitorPhone}</span>
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
                          {visitor.hostName}
                        </p>
                        <p className="text-xs text-muted-foreground">{visitor.hostUnit}</p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Entry/Exit Time:</span>
                        <p className="font-medium mt-1">
                          {formatTime(visitor.entryTime)} - {formatTime(visitor.exitTime)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Duration: {calculateDuration(visitor.entryTime, visitor.exitTime)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Visit Date:</span>
                        <p className="font-medium mt-1">
                          {new Date(visitor.visitDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    
                    {visitor.securityNotes && (
                      <div className="mt-3 p-2 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Security Notes: </span>
                        <span className="text-sm text-muted-foreground">{visitor.securityNotes}</span>
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
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Visitors;