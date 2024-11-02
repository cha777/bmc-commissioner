import type { FC } from 'react';
import { Checkbox } from '../ui/checkbox';

interface NegativeCommissionToggleProps {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const NegativeCommissionToggle: FC<NegativeCommissionToggleProps> = (props) => {
  const { isChecked, onCheckedChange } = props;

  return (
    <div className='flex flex-row gap-2 items-center'>
      <Checkbox
        id='allow-negatives'
        checked={isChecked}
        onCheckedChange={onCheckedChange}
      />
      <label htmlFor='allow-negatives'>Allow negative commissions?</label>
    </div>
  );
};
