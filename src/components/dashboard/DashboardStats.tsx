import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, change, icon, description }: StatCardProps) {
  return (
    <Card className="shadow-card hover:shadow-elevated transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1">
            {change.trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : change.trend === 'down' ? (
              <TrendingDown className="h-3 w-3 text-destructive" />
            ) : (
              <Clock className="h-3 w-3 text-muted-foreground" />
            )}
            <span 
              className={`text-xs ${
                change.trend === 'up' 
                  ? 'text-success' 
                  : change.trend === 'down' 
                  ? 'text-destructive' 
                  : 'text-muted-foreground'
              }`}
            >
              {change.value}
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  userRole: 'super_admin' | 'society_admin' | 'committee_member' | 'resident' | 'guest';
}

export function DashboardStats({ userRole }: DashboardStatsProps) {
  // Mock data - in real app, this would come from API
  const isAdmin = ['super_admin', 'society_admin', 'committee_member'].includes(userRole);

  const residentStats = [
    {
      title: 'Pending Dues',
      value: '₹2,500',
      change: { value: 'Due in 5 days', trend: 'neutral' as const },
      icon: <CreditCard className="h-4 w-4" />,
      description: 'Monthly maintenance'
    },
    {
      title: 'My Complaints',
      value: 2,
      change: { value: '1 pending', trend: 'neutral' as const },
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Active maintenance requests'
    },
    {
      title: 'Upcoming Events',
      value: 3,
      change: { value: 'This month', trend: 'up' as const },
      icon: <Calendar className="h-4 w-4" />,
      description: 'Society events'
    }
  ];

  const adminStats = [
    {
      title: 'Total Members',
      value: 124,
      change: { value: '+2 this month', trend: 'up' as const },
      icon: <Users className="h-4 w-4" />,
      description: 'Active residents'
    },
    {
      title: 'Pending Dues',
      value: '₹1,24,500',
      change: { value: '15 pending', trend: 'down' as const },
      icon: <CreditCard className="h-4 w-4" />,
      description: 'Total outstanding'
    },
    {
      title: 'Open Complaints',
      value: 8,
      change: { value: '-2 this week', trend: 'up' as const },
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Pending resolution'
    },
    {
      title: 'Collection Rate',
      value: '92%',
      change: { value: '+3% from last month', trend: 'up' as const },
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Payment compliance'
    }
  ];

  const stats = isAdmin ? adminStats : residentStats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}