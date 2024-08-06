import type { FC, ChangeEvent, FocusEvent } from 'react';
import { useCallback } from 'react';
import numeral from 'numeral';
import { Input } from '@/components/ui/input';
import { useCommission } from '@/hooks/use-commission';

export const MetalUnits: FC = () => {
  const { avgUnitPrice, onTotalQtyUpdate } = useCommission();

  const handleQtyChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const qty = parseInt(e.target.value, 10) || 0;
      onTotalQtyUpdate(qty);
    },
    [onTotalQtyUpdate]
  );

  const handleFocusOut = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const qty = parseInt(e.target.value, 10);

      if (isNaN(qty) || qty < 0) {
        onTotalQtyUpdate(0);
        e.target.value = '0';
      }
    },
    [onTotalQtyUpdate]
  );

  return (
    <ul className='grid gap-3'>
      <li className='flex items-center justify-between'>
        <span className='text-muted-foreground flex-1'>Average unit price</span>
        <span>{numeral(avgUnitPrice).format('0,0.00')}</span>
      </li>
      <li className='flex items-center justify-between'>
        <span className='text-muted-foreground'>Total units produced</span>
        <Input
          className='text-right w-20'
          type='number'
          defaultValue={0}
          onChange={handleQtyChange}
          onBlur={handleFocusOut}
        />
      </li>
    </ul>
  );
};
