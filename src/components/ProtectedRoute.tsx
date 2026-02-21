import { ReactNode, useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'user';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const [roleTimeout, setRoleTimeout] = useState(false);

  useEffect(() => {
    if (!loading && user && role === null && !roleTimeout) {
      const t = setTimeout(() => setRoleTimeout(true), 3000);
      return () => clearTimeout(t);
    }
  }, [loading, user, role, roleTimeout]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role === null && !roleTimeout) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (requiredRole) {
    const roleHierarchy = { admin: 3, moderator: 2, user: 1 };
    const userLevel = role ? roleHierarchy[role] : 0;
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return (
        <div className="relative flex min-h-screen flex-col bg-background">
          <div className="absolute top-6 left-6">
            <Link to="/">
              <img
                src="/images/sp-logo.png"
                alt="SP Granites"
                className="h-12 w-auto block dark:hidden"
              />
              <img
                src="/images/sp-logo-dark.png"
                alt="SP Granites"
                className="h-12 w-auto hidden dark:block"
              />
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h1 className="mb-4 text-2xl font-bold text-destructive">Access Denied</h1>
              <p className="mb-6 text-muted-foreground">You don't have permission to view this page.</p>
              <Button asChild>
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Homepage
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
