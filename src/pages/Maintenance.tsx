import { Wrench, Clock, CheckCircle, AlertTriangle, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AppLayout } from '@/components/layout/AppLayout';

const mockMaintenanceRequests = [
  {
    id: '1',
    title: 'Elevator Not Working',
    description: 'Main elevator in Block A has stopped working',
    category: 'Elevator',
    priority: 'high',
    status: 'in_progress',
    reportedBy: 'John Doe',
    unit: 'A-101',
    reportedDate: '2024-01-15',
    assignedTo: 'Mike Johnson',
    estimatedCost: 15000
  },
  {
    id: '2',
    title: 'Water Leakage in Parking',
    description: 'Water pipe burst in underground parking area',
    category: 'Plumbing',
    priority: 'urgent',
    status: 'pending',
    reportedBy: 'Sarah Wilson',
    unit: 'B-205',
    reportedDate: '2024-01-14',
    assignedTo: null,
    estimatedCost: 8000
  },
  {
    id: '3',
    title: 'Garden Maintenance',
    description: 'Monthly garden cleaning and plant care required',
    category: 'Landscaping',
    priority: 'low',
    status: 'completed',
    reportedBy: 'Emily Davis',
    unit: 'C-302',
    reportedDate: '2024-01-10',
    assignedTo: 'Green Team',
    estimatedCost: 5000
  },
  {
    id: '4',
    title: 'Security Camera Repair',
    description: 'CCTV camera at main gate needs replacement',
    category: 'Security',
    priority: 'medium',
    status: 'in_progress',
    reportedBy: 'Robert Brown',
    unit: 'A-505',
    reportedDate: '2024-01-12',
    assignedTo: 'Security Team',
    estimatedCost: 12000
  },
  {
    id: '5',
    title: 'Gym Equipment Service',
    description: 'Annual maintenance of gym equipment',
    category: 'Amenities',
    priority: 'medium',
    status: 'scheduled',
    reportedBy: 'Admin',
    unit: 'N/A',
    reportedDate: '2024-01-13',
    assignedTo: 'Fitness Solutions',
    estimatedCost: 20000
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  scheduled: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  urgent: 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-300',
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'in_progress':
      return <Wrench className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'scheduled':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const Maintenance = () => {
  const stats = {
    total: mockMaintenanceRequests.length,
    pending: mockMaintenanceRequests.filter(r => r.status === 'pending').length,
    inProgress: mockMaintenanceRequests.filter(r => r.status === 'in_progress').length,
    completed: mockMaintenanceRequests.filter(r => r.status === 'completed').length,
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
            <p className="text-muted-foreground">
              Track and manage maintenance requests and repairs
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Plus className="h-4 w-4 mr-2" />
            New Request
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
                  <p className="text-sm text-blue-600 dark:text-blue-400">Total Requests</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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
                <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
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
              placeholder="Search maintenance requests..." 
              className="pl-4"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Maintenance Requests List */}
        <div className="space-y-4">
          {mockMaintenanceRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{request.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {request.category}
                          </Badge>
                          <Badge className={`text-xs ${priorityColors[request.priority]}`}>
                            {request.priority.toUpperCase()}
                          </Badge>
                          <Badge className={`text-xs ${statusColors[request.status]}`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              {request.status.replace('_', ' ').toUpperCase()}
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reported by:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {request.reportedBy.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{request.reportedBy}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">{request.unit}</span>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Assigned to:</span>
                        <p className="font-medium mt-1">
                          {request.assignedTo || 'Unassigned'}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Reported Date:</span>
                        <p className="font-medium mt-1">
                          {new Date(request.reportedDate).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Estimated Cost:</span>
                        <p className="font-medium mt-1">
                          ₹{request.estimatedCost.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-primary to-primary/80">
                      Update Status
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

export default Maintenance;