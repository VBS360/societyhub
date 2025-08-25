import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  AlertTriangle, 
  CreditCard, 
  MessageSquare, 
  Calendar,
  Users,
  Car,
  Settings
} from 'lucide-react';

interface QuickActionProps {
  userRole: 'super_admin' | 'society_admin' | 'committee_member' | 'resident' | 'guest';
}

export function QuickActions({ userRole }: QuickActionProps) {
  const isAdmin = ['super_admin', 'society_admin', 'committee_member'].includes(userRole);

  const residentActions = [
    {
      title: 'File Complaint',
      description: 'Report maintenance issues',
      icon: <AlertTriangle className="h-4 w-4" />,
      href: '/maintenance',
      variant: 'default' as const
    },
    {
      title: 'Pay Dues',
      description: 'Make maintenance payment',
      icon: <CreditCard className="h-4 w-4" />,
      href: '/finances',
      variant: 'default' as const
    },
    {
      title: 'Book Amenity',
      description: 'Reserve facilities',
      icon: <Car className="h-4 w-4" />,
      href: '/amenities',
      variant: 'outline' as const
    },
    {
      title: 'Register Visitor',
      description: 'Add guest entry',
      icon: <Users className="h-4 w-4" />,
      href: '/visitors',
      variant: 'outline' as const
    }
  ];

  const adminActions = [
    {
      title: 'Add Announcement',
      description: 'Post society notice',
      icon: <MessageSquare className="h-4 w-4" />,
      href: '/announcements',
      variant: 'default' as const
    },
    {
      title: 'Create Event',
      description: 'Schedule new event',
      icon: <Calendar className="h-4 w-4" />,
      href: '/events',
      variant: 'default' as const
    },
    {
      title: 'Add Member',
      description: 'Register new resident',
      icon: <Plus className="h-4 w-4" />,
      href: '/members',
      variant: 'outline' as const
    },
    {
      title: 'Generate Report',
      description: 'Financial summary',
      icon: <CreditCard className="h-4 w-4" />,
      href: '/finances',
      variant: 'outline' as const
    },
    {
      title: 'Society Settings',
      description: 'Manage preferences',
      icon: <Settings className="h-4 w-4" />,
      href: '/settings',
      variant: 'outline' as const
    }
  ];

  const actions = isAdmin ? adminActions : residentActions;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start gap-2 hover:shadow-card transition-shadow"
              asChild
            >
              <a href={action.href}>
                <div className="flex items-center gap-2 w-full">
                  {action.icon}
                  <span className="font-medium text-sm">
                    {action.title}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground w-full text-left">
                  {action.description}
                </span>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}