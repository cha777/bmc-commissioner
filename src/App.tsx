import type { FC } from 'react';
import { useRoutes } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { SplashScreen } from '@/components/splash-screen';
import { AuthConsumer, AuthProvider } from '@/contexts/auth-context';
import { routes } from '@/routes';

export const App: FC = () => {
  const element = useRoutes(routes);

  return (
    <ThemeProvider defaultTheme='dark'>
      <AuthProvider>
        <AuthConsumer>{(auth) => (auth.isInitialized ? element : <SplashScreen />)}</AuthConsumer>
      </AuthProvider>
    </ThemeProvider>
  );
};
