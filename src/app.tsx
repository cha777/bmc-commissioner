import type { FC } from 'react';
import { useEffect } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ThemeProvider } from '@/components/theme-provider';
import { SplashScreen } from '@/components/splash-screen';
import { ToastAction } from './components/ui/toast';
import { useToast } from './components/ui/use-toast';
import { AuthConsumer, AuthProvider } from '@/contexts/auth-context';
import { routes } from '@/routes';

const queryClient = new QueryClient();

export const App: FC = () => {
  const element = useRoutes(routes);
  const { toast } = useToast();

  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        toast({
          title: 'Update Available',
          description: 'A new version of the app is available. Click to refresh.',
          action: (
            <ToastAction
              altText='Refresh'
              onClick={() => updateSW(true)}
            >
              Refresh
            </ToastAction>
          ),
        });
      },
      onOfflineReady() {
        toast({
          title: 'Offline Ready',
          description: 'The app is ready to work offline.',
        });
      },
    });
  }, [toast]);

  return (
    <ThemeProvider defaultTheme='dark'>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthConsumer>{(auth) => (auth.isInitialized ? element : <SplashScreen />)}</AuthConsumer>
        </AuthProvider>
        {import.meta.env.MODE === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ThemeProvider>
  );
};
