import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  CreditCard, 
  AlertTriangle, 
  MessageSquare, 
  Calendar,
  Users,
  Car
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'payment' | 'complaint' | 'announcement' | 'event' | 'member' | 'visitor';
  title: string;
  description: string;
  timestamp: string;
  status?: 'pending' | 'completed' | 'urgent' | 'resolved';
  user?: {
    name: string;
    unit: string;
  };
}

const activityIcons = {
  payment: CreditCard,
  complaint: AlertTriangle,
  announcement: MessageSquare,
  event: Calendar,
  member: Users,
  visitor: Car,
};

const statusColors = {
  pending: 'bg-warning text-warning-foreground',
  completed: 'bg-success text-success-foreground',
  urgent: 'bg-destructive text-destructive-foreground',
  resolved: 'bg-success text-success-foreground',
};

interface RecentActivityProps {
  userRole: 'super_admin' | 'society_admin' | 'committee_member' | 'resident' | 'guest';
}

export function RecentActivity({ userRole }: RecentActivityProps) {
  const isAdmin = ['super_admin', 'society_admin', 'committee_member'].includes(userRole);

  // Mock data - in real app, this would come from API
  const residentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'payment',
      title: 'Maintenance Payment',
      description: 'Monthly maintenance fee due',
      timestamp: '2 days ago',
      status: 'pending'
    },
    {
      id: '2',
      type: 'complaint',
      title: 'Plumbing Issue',
      description: 'Kitchen sink water leakage reported',
      timestamp: '3 days ago',
      status: 'pending'
    },
    {
      id: '3',
      type: 'announcement',
      title: 'Water Tank Cleaning',
      description: 'Scheduled for tomorrow 10 AM',
      timestamp: '1 week ago'
    }
  ];

  const adminActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'complaint',
      title: 'Emergency Repair Request',
      description: 'Elevator malfunction in Block B',
      timestamp: '2 hours ago',
      status: 'urgent',
      user: { name: 'Rajesh Kumar', unit: 'B-304' }
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      description: 'Maintenance fee for December',
      timestamp: '4 hours ago',
      status: 'completed',
      user: { name: 'Priya Sharma', unit: 'A-201' }
    },
    {
      id: '3',
      type: 'visitor',
      title: 'Visitor Request',
      description: 'Guest entry approval needed',
      timestamp: '6 hours ago',
      status: 'pending',
      user: { name: 'Amit Patel', unit: 'C-105' }
    },
    {
      id: '4',
      type: 'member',
      title: 'New Registration',
      description: 'Tenant registration completed',
      timestamp: '1 day ago',
      status: 'completed',
      user: { name: 'Sarah Johnson', unit: 'A-403' }
    },
    {
      id: '5',
      type: 'event',
      title: 'Event RSVP',
      description: 'Annual general meeting attendance confirmed',
      timestamp: '2 days ago',
      user: { name: 'Multiple residents', unit: 'Various' }
    }
  ];

  const activities = isAdmin ? adminActivities : residentActivities;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10 ring-1 ring-primary/20">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm text-foreground truncate">
                      {activity.title}
                    </h4>
                    {activity.status && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${statusColors[activity.status]}`}
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {activity.user ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {activity.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {activity.user.name} • {activity.user.unit}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}
                    
                    <span className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}