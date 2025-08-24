import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile.full_name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your society today.
          </p>
        </div>

        {/* Stats Overview */}
        <DashboardStats userRole={profile.role} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <RecentActivity userRole={profile.role} />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="lg:col-span-1">
            <QuickActions userRole={profile.role} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
