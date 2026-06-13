import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ReactNode } from 'react';

export function VerifyEmailRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lane">
        <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  if (session.user.email_confirmed_at) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lane">
        <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (session.user && !session.user.email_confirmed_at) {
    return <Navigate to="/verify-email" replace />;
  }

  if (profile?.is_disabled) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading, session } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lane">
        <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

export function AuthRoute({ children }: { children: ReactNode }) {
  const { session, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lane">
        <div className="w-8 h-8 border-2 border-signal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session?.user?.email_confirmed_at) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}
