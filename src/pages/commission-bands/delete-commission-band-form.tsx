import type { FC } from 'react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import type { CommissionBand } from '@/types/commission-band';
import { metadata } from '@/api';

interface FormProps {
  item: CommissionBand;
  onComplete: () => void;
}

export const DeleteForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const onDelete = useCallback(async () => {
    await metadata.deleteCommissionBand(item.id);
    onComplete();
  }, [item.id, onComplete]);

  return (
    <Button
      variant='destructive'
      className='w-full'
      onClick={onDelete}
    >
      Delete
    </Button>
  );
};
