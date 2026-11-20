import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@fs-management/auth';

/**
 * Guard untuk halaman protected — panggil checkAuth() (cookie mode),
 * redirect ke /login bila belum authenticated.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const { checkAuth, isAuthenticated, isLoading } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    checkAuth().then((ok) => {
      if (cancelled) return;
      setChecked(true);
      if (!ok) window.location.href = '/login';
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!checked || isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
