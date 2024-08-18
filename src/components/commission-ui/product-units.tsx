import type { FC, ChangeEvent, FocusEvent } from 'react';
import { useCallback } from 'react';
import numeral from 'numeral';

import { Input } from '@/components/ui/input';

interface ProductUnitsProps {
  units?: number;
  avgUnitPrice: number;
  totalCommission: number;
  onTotalQtyUpdate: (qty: number) => void;
}

export const ProductUnits: FC<ProductUnitsProps> = ({ units = 0, avgUnitPrice, totalCommission, onTotalQtyUpdate }) => {
  const handleQtyChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const qty = parseFloat(e.target.value) || 0;
      onTotalQtyUpdate(qty);
    },
    [onTotalQtyUpdate]
  );

  const handleFocusIn = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }, []);

  const handleFocusOut = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const qty = parseFloat(e.target.value);

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
          defaultValue={units}
          onChange={handleQtyChange}
          onFocus={handleFocusIn}
          onBlur={handleFocusOut}
        />
      </li>
      <li className='flex items-center justify-between'>
        <span className='text-muted-foreground flex-1'>Total Commission</span>
        <span>{numeral(totalCommission).format('0,0.00')}</span>
      </li>
    </ul>
  );
};
