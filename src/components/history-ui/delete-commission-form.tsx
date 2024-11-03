import type { FC } from 'react';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { commission } from '@/api';
import { queryKey } from '@/utils';
import type { CommissionHistory } from '@/types/commission';

interface FormProps {
  item: CommissionHistory;
  onComplete: () => void;
}

export const DeleteCommissionForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: commission.deleteCommissionRecord,
    onSuccess: (isSuccess, deletedId) => {
      if (isSuccess) {
        queryClient.setQueryData([queryKey.history], (oldData: CommissionHistory[]) =>
          oldData.filter((_record) => _record.id !== deletedId)
        );

        queryClient.setQueryData([queryKey.dates], (oldData: string[]) =>
          oldData.filter((_date) => _date !== item.date)
        );
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
