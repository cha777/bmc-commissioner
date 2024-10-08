import type { FC } from 'react';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { metadata } from '@/api';
import { queryKey } from '@/utils';
import type { Employee } from '@/types/employee';

interface FormProps {
  item: Employee;
  onComplete: () => void;
}

export const DeleteForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: metadata.deleteEmployee,
    onSuccess: (isSuccess, deletedId) => {
      if (isSuccess) {
        queryClient.setQueryData([queryKey.employees], (oldData: Employee[]) =>
          oldData.filter((_employee) => _employee.id !== deletedId)
        );
        queryClient.invalidateQueries({ queryKey: [queryKey.employees] });
      }

      onComplete();
    },
  });

  const onDelete = useCallback(async () => {
    mutation.mutate(item.id);
  }, [item.id, mutation]);

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
