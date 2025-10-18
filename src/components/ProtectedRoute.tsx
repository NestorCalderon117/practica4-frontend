'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: ('ADMIN' | 'CLIENTE')[];
  requireAuth?: boolean;
};

const ProtectedRoute = ({
  children,
  allowedRoles = ['ADMIN', 'CLIENTE'],
  requireAuth = true
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        router.push('/autenticacion/iniciar-sesion');
        return;
      }

      if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, isLoading, router, allowedRoles, requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;