import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { HeroCard } from '@/components/dashboard/HeroCard';
import { MiniChart } from '@/components/dashboard/MiniChart';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const Index = () => {
  const { profile, user, loading } = useAuth();
  const dashboardStats = useDashboardStats();

  // Show loading state (handled by AppLayout)
  if (loading) {
    return null; // AppLayout will handle the loading state
  }

  // Safe fallbacks if profile couldn't be fetched (e.g., due to RLS issues)
  const userRole: 'super_admin' | 'society_admin' | 'committee_member' | 'resident' | 'guest' =
    profile?.role ?? 'resident';
  const firstName = (profile?.full_name || user?.user_metadata?.full_name || user?.email || 'Guest')
    .toString()
    .split(' ')[0];

  const isAdmin = ['super_admin', 'society_admin', 'committee_member'].includes(userRole);
  
  // Get dynamic stats for hero card
  const getHeroStats = () => {
    if (dashboardStats.loading) return { label: 'Loading...', value: '...' };
    
    if (isAdmin) {
      return {
        label: 'Pending Dues',
        value: dashboardStats.pendingDues || '₹0'
      };
    } else {
      return {
        label: 'My Dues',
        value: dashboardStats.myDues || '₹0'
      };
    }
  };

  const heroStats = getHeroStats();

  return (
    <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-hidden">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-64 w-[56rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* Hero */}
        <HeroCard
          firstName={firstName}
          role={userRole.replace('_', ' ')}
          statLabel={heroStats.label}
          statValue={heroStats.value}
        />

        {/* Stats Overview */}
        <DashboardStats userRole={userRole} />

        {/* Main Content Grid - Mobile First */}
        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0 min-w-0">
          {/* Recent Activity - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 min-w-0">
            <RecentActivity userRole={userRole} />
          </div>

          {/* Quick Actions & Charts - Takes 1 column, stacks on mobile */}
          <div className="lg:col-span-1 min-w-0 space-y-4 sm:space-y-6">
            <QuickActions userRole={userRole} />
            
            {/* Mini Chart Card - Hide on very small screens */}
            <div className="hidden sm:block rounded-xl border bg-card text-card-foreground p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                  <p className="text-2xl font-semibold">
                    {dashboardStats.loading ? '...' : dashboardStats.collectionRate || '0%'}
                  </p>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">This month</span>
              </div>
              <div className="mt-3">
                <MiniChart />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Index;
