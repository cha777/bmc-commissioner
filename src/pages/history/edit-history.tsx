import type { FC } from 'react';
import { useParams } from 'react-router';

import { CommissionEditUi } from '@/components/history-ui/edit-ui';
import { SplashScreen } from '@/components/splash-screen';
import { CommissionEditConsumer, CommissionEditProvider } from '@/contexts/commission-edit-context';

const Page: FC = () => {
  const { id } = useParams();

  if (!id) {
    return null;
  }

  return (
    <CommissionEditProvider id={id}>
      <CommissionEditConsumer>
        {(state) => (state.isInitialized ? <CommissionEditUi /> : <SplashScreen />)}
      </CommissionEditConsumer>
    </CommissionEditProvider>
  );
};

export default Page;
