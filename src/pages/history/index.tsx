import { useEffect } from 'react';
import type { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { startOfMonth, endOfMonth, format } from 'date-fns';

import { CommissionHistoryProvider } from '@/contexts/commission-history-context';
import { HistoryUI } from '@/components/history-ui';

const Page: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const from = searchParams.get('from');
  const to = searchParams.get('to');

  useEffect(() => {
    if (!from || !to) {
      const now = new Date();
      const fromDate = format(startOfMonth(now), 'yyyy-MM-dd');
      const toDate = format(endOfMonth(now), 'yyyy-MM-dd');

      setSearchParams({ from: fromDate, to: toDate }, { replace: true });
    }
  }, [from, to, setSearchParams]);

  // Avoid rendering until query params are set
  if (!from || !to) return null;

  const handleDateChange = (newFrom: string, newTo: string) => {
    setSearchParams({ from: newFrom, to: newTo });
  };

  return (
    <CommissionHistoryProvider
      from={from}
      to={to}
      onDateChange={handleDateChange}
    >
      <HistoryUI />
    </CommissionHistoryProvider>
  );
};

export default Page;
