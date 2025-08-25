import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { HeroCard } from '@/components/dashboard/HeroCard';
import { MiniChart } from '@/components/dashboard/MiniChart';

const Index = () => {
  const { profile, user, loading } = useAuth();

  // Show spinner only while loading auth state
  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  // Safe fallbacks if profile couldn't be fetched (e.g., due to RLS issues)
  const userRole: 'super_admin' | 'society_admin' | 'committee_member' | 'resident' | 'guest' =
    profile?.role ?? 'resident';
  const firstName = (profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Guest')
    .toString()
    .split(' ')[0];

  return (
    <AppLayout>
      <div className="relative p-6 space-y-6 overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-64 w-[56rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* Hero */}
        <HeroCard
          firstName={firstName}
          role={userRole.replace('_', ' ')}
          statLabel={userRole === 'resident' ? 'Amount Due' : 'Open Tasks'}
          statValue={userRole === 'resident' ? '₹500' : '3'}
        />

        {/* Stats Overview */}
        <DashboardStats userRole={userRole} />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3 min-w-0">
          {/* Recent Activity - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 min-w-0">
            <RecentActivity userRole={userRole} />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div className="lg:col-span-1 min-w-0">
            <div className="space-y-6 min-w-0">
              <QuickActions userRole={userRole} />
              {/* Mini Chart Card */}
              <div className="rounded-xl border bg-card text-card-foreground p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Collections</p>
                    <p className="text-2xl font-semibold">₹1.2L</p>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">+8% MoM</span>
                </div>
                <div className="mt-3">
                  <MiniChart />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
