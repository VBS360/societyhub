import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  CreditCard, 
  AlertTriangle, 
  MessageSquare, 
  Calendar,
  Users,
  Car,
  Loader2
} from 'lucide-react';
import { useRecentActivity } from '@/hooks/useRecentActivity';

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
  const { activities, loading, error } = useRecentActivity();

  if (loading) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No recent activity found
          </div>
        </CardContent>
      </Card>
    );
  }

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