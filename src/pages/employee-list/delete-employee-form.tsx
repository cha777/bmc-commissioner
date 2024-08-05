import type { FC } from 'react';
import { useCallback } from 'react';

import { Button } from '@/components/ui/button';
import type { Employee } from '@/types/employee';
import { metadata } from '@/api';

interface FormProps {
  item: Employee;
  onComplete: () => void;
}

export const DeleteForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const onDelete = useCallback(async () => {
    await metadata.deleteEmployee(item.id);
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
