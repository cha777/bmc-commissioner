import type { FC } from 'react';
import numeral from 'numeral';
import { useCommission } from '@/hooks/use-commission';

export const MetaProductionTotal: FC = () => {
  const { totalValue } = useCommission();

  return (
    <div className='flex items-center justify-between font-semibold'>
      <span className='text-muted-foreground'>Total</span>
      <span>{numeral(totalValue).format('0,0.00')}</span>
    </div>
  );
};
