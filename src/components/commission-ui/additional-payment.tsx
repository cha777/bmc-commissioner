import { useCallback } from 'react';
import type { FC, FocusEvent } from 'react';
import { NumericFormat } from 'react-number-format';

import { Input } from '@/components/ui/input';

interface AdditionalPaymentProps {
  value: number;
  onChange: (value: number) => void;
}
export const AdditionalPayment: FC<AdditionalPaymentProps> = ({ value, onChange }) => {
  const handleFocusIn = useCallback((e: FocusEvent<HTMLInputElement>) => {
    e.target.select();
  }, []);

  return (
    <div className='flex items-center justify-between gap-4'>
      <span className='text-muted-foreground'>
        Additional Payment
        <br />
        (per employee)
      </span>
      <NumericFormat
        value={value}
        onValueChange={(values) => onChange(values.floatValue || 0)}
        onFocus={handleFocusIn}
        customInput={Input}
        className='text-right flex-1'
        allowNegative={false}
        decimalScale={2}
        defaultValue={0}
      />
    </div>
  );
};
