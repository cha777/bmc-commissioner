import type { FC } from 'react';
import { ActivityOverlay } from '@/components/activity-overlay';
import { useCommissionHistory } from '@/hooks/use-commission-history';
import { DatePicker } from './date-picker';
import { CommissionBreakdown } from './commission-breakdown';
import { MetalQtyChart } from './metal-qty-chart';

export const HistoryUI: FC = () => {
  const { isLoading } = useCommissionHistory();

  return (
    <div className='relative grid auto-rows-max items-start py-2 gap-4 lg:col-span-2 lg:gap-8'>
      <DatePicker />
      <CommissionBreakdown />
      <MetalQtyChart />

      {isLoading && (
        <ActivityOverlay className='absolute flex justify-center items-center'>
          <div className='flex flex-col items-center gap-0 text-muted-foreground'>
            <span>Loading data</span>
            <span>Please wait ...</span>
          </div>
        </ActivityOverlay>
      )}
    </div>
  );
};
