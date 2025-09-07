import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useSuperAdmin } from '@/hooks/use-super-admin';
import { Loader2 } from 'lucide-react';

type SuperAdminLayoutProps = {
  children: ReactNode;
};

export const SuperAdminLayout = ({ children }: SuperAdminLayoutProps) => {
  const { isSuperAdmin, isLoading } = useSuperAdmin();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    router.push('/dashboard');
    return null;
  }

  return <>{children}</>;
};

// Create a higher-order component for super admin pages
export const withSuperAdmin = (Component: React.ComponentType) => {
  return function WithSuperAdmin(props: any) {
    return (
      <SuperAdminLayout>
        <Component {...props} />
      </SuperAdminLayout>
    );
  };
};
