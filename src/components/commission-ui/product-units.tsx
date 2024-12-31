import type { FC, FocusEvent } from 'react';
import { useCallback } from 'react';
import { NumericFormat } from 'react-number-format';

import { Input } from '@/components/ui/input';

interface ProductUnitsProps {
  units?: number;
  avgUnitPrice: number;
  totalCommission: number;
  onTotalQtyUpdate: (qty: number) => void;
}

export const ProductUnits: FC<ProductUnitsProps> = ({ units = 0, avgUnitPrice, totalCommission, onTotalQtyUpdate }) => {
  const handleFocusIn = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }, []);

  return (
    <ul className='grid gap-3'>
      <li className='flex items-center justify-between'>
        <span className='text-muted-foreground flex-1'>Average unit price</span>
        <span>
          {Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(avgUnitPrice)}
        </span>
      </li>
      <li className='flex items-center justify-between'>
        <span className='text-muted-foreground'>Total units produced</span>
        <NumericFormat
          value={units}
          onValueChange={(values) => onTotalQtyUpdate(values.floatValue || 0)}
          onFocus={handleFocusIn}
          customInput={Input}
          className='text-right w-20'
          allowNegative={false}
          decimalScale={0}
          defaultValue={0}
        />
      </li>
      <li className='flex items-center justify-between'>
        <span className='text-muted-foreground flex-1'>Total Commission</span>
        <span>
          {Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalCommission)}
        </span>
      </li>
    </ul>
  );
};
