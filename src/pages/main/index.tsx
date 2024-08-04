import type { FC } from 'react';
import { CommissionConsumer, CommissionProvider } from '@/contexts/commission-context';
import { CommissionUI } from '@/components/commission-ui';
import { SplashScreen } from '@/components/splash-screen';

const Page: FC = () => {
  return (
    <CommissionProvider>
      <CommissionConsumer>{(state) => (state.isInitialized ? <CommissionUI /> : <SplashScreen />)}</CommissionConsumer>
    </CommissionProvider>
  );
};

export default Page;
