import type { FC } from 'react';

import { ActivityOverlay } from '@/components/activity-overlay';
import { useCommissionHistory } from '@/hooks/use-commission-history';
import { DateRangePicker } from '@/components/history-ui/date-range-picker';
import { CommissionBreakdown } from '@/components/commission-ui/commission-breakdown';
import { DailyCommissionChart } from '@/components/history-ui/daily-commission-chart';
import { DailyCommissionData } from '@/components/history-ui/daily-commission-data';

export const HistoryUI: FC = () => {
  const { isLoading, employeeCommissions } = useCommissionHistory();

  return (
    <div className='relative grid auto-rows-max items-start py-2 gap-4 lg:col-span-2 lg:gap-8'>
      <DateRangePicker />

      <CommissionBreakdown employeeList={employeeCommissions} />

      <DailyCommissionChart />
      <DailyCommissionData />

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
