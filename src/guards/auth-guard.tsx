import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@/hooks/use-router';
import { useSearchParams } from '@/hooks/use-search-params';
import { paths } from '@/paths';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: FC<AuthGuardProps> = (props) => {
  const { children } = props;
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);
  const searchParams = useSearchParams();

  const check = useCallback(() => {
    if (!isAuthenticated) {
      if (!searchParams.has('returnTo')) {
        const searchParams = new URLSearchParams({ returnTo: window.location.href }).toString();
        const href = paths.auth + `?${searchParams}`;
        router.replace(href);
      }

      setChecked(true);
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, router, searchParams]);

  // Only check on mount, this allows us to redirect the user manually when auth state changes
  useEffect(
    () => {
      check();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (!checked) {
    return null;
  }

  // If got here, it means that the redirect did not occur, and that tells us that the user is
  // authenticated / authorized.

  return <>{children}</>;
};
