import { Navigate, Link, useLocation } from 'react-router-dom';

import { 
  Home, 
  Users, 
  CreditCard, 
  Wrench, 
  MessageSquare, 
  Calendar,
  Shield,
  Car,
  Settings,
  LogOut,
  Menu,
  Bell,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Finances', href: '/finances', icon: CreditCard },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench },
  { name: 'Announcements', href: '/announcements', icon: MessageSquare },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Visitors', href: '/visitors', icon: Shield },
  { name: 'Amenities', href: '/amenities', icon: Car },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const roleColors = {
  super_admin: 'bg-destructive text-destructive-foreground',
  society_admin: 'bg-primary text-primary-foreground',
  committee_member: 'bg-accent text-accent-foreground',
  resident: 'bg-secondary text-secondary-foreground',
  guest: 'bg-muted text-muted-foreground',
};

const roleLabels = {
  super_admin: 'Super Admin',
  society_admin: 'Society Admin',
  committee_member: 'Committee Member',
  resident: 'Resident',
  guest: 'Guest',
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, profile, signOut, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 ring-1 ring-primary/20 overflow-hidden">
                <img
                  src="/android-chrome-192x192.png"
                  alt="SocietyHub"
                  className="h-full w-full object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/favicon.ico'; }}
                />
              </div>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">SocietyHub</h2>
                <p className="text-xs text-sidebar-foreground/60">Management System</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className="w-full justify-start"
                    >
                      <Link to={item.href} className="flex items-center gap-3 px-3 py-2">
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-sidebar-border">
            {profile && (
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {profile.full_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${roleColors[profile.role]}`}
                    >
                      {roleLabels[profile.role]}
                    </Badge>
                    {profile.unit_number && (
                      <Badge variant="outline" className="text-xs">
                        Unit {profile.unit_number}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2" 
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger>
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h1>
                {profile?.unit_number && (
                  <p className="text-sm text-muted-foreground">
                    Unit {profile.unit_number}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full"></span>
              </Button>
              
              {profile && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{profile.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-muted/30 pb-16 md:pb-0 min-w-0">
            {children}
          </main>
          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}