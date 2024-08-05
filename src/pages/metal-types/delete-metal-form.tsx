import type { FC } from 'react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import type { MetalType } from '@/types/metal-type';
import { metadata } from '@/api';

interface FormProps {
  item: MetalType;
  onComplete: () => void;
}

export const DeleteForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const onDelete = useCallback(async () => {
    await metadata.deleteMetalType(item.id);
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
