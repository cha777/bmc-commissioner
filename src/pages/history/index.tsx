import type { FC } from 'react';
import { CommissionHistoryProvider } from '@/contexts/commission-history-context';
import { HistoryUI } from '@/components/history-ui';

const Page: FC = () => {
  return (
    <CommissionHistoryProvider>
      <HistoryUI />
    </CommissionHistoryProvider>
  );
};

export default Page;
