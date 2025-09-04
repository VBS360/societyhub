import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Clock,
  Loader2
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

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
  const stats = useDashboardStats();
  const isAdmin = ['super_admin', 'society_admin', 'committee_member'].includes(userRole);

  if (stats.loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(isAdmin ? 4 : 3)].map((_, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{stats.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboardStats = isAdmin
    ? [
        {
          title: 'Total Members',
          value: stats.totalMembers || 0,
          change: { value: 'Active residents', trend: 'neutral' as const },
          icon: <Users className="h-4 w-4" />,
          description: 'Society members'
        },
        {
          title: 'Pending Dues',
          value: stats.pendingDues || '₹0',
          change: { value: 'Outstanding amount', trend: 'neutral' as const },
          icon: <CreditCard className="h-4 w-4" />,
          description: 'Total pending'
        },
        {
          title: 'Open Complaints',
          value: stats.openComplaints || 0,
          change: { value: 'Pending resolution', trend: 'neutral' as const },
          icon: <AlertTriangle className="h-4 w-4" />,
          description: 'Active issues'
        },
        {
          title: 'Collection Rate',
          value: stats.collectionRate || '0%',
          change: { value: 'Payment compliance', trend: 'up' as const },
          icon: <TrendingUp className="h-4 w-4" />,
          description: 'This month'
        }
      ]
    : [
        {
          title: 'Pending Dues',
          value: stats.myDues || '₹0',
          change: { value: 'Your pending amount', trend: 'neutral' as const },
          icon: <CreditCard className="h-4 w-4" />,
          description: 'Monthly maintenance'
        },
        {
          title: 'My Complaints',
          value: stats.myComplaints || 0,
          change: { value: 'Active requests', trend: 'neutral' as const },
          icon: <AlertTriangle className="h-4 w-4" />,
          description: 'Pending resolution'
        },
        {
          title: 'Upcoming Events',
          value: stats.upcomingEvents || 0,
          change: { value: 'This month', trend: 'up' as const },
          icon: <Calendar className="h-4 w-4" />,
          description: 'Society events'
        }
      ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {dashboardStats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}