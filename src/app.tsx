import type { FC } from 'react';
import { useRoutes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/components/theme-provider';
import { SplashScreen } from '@/components/splash-screen';
import { AuthConsumer, AuthProvider } from '@/contexts/auth-context';
import { routes } from '@/routes';

const queryClient = new QueryClient();

export const App: FC = () => {
  const element = useRoutes(routes);
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
