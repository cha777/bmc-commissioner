import type { FC } from 'react';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { metadata } from '@/api';
import { queryKey } from '@/utils';
import type { CommissionBand } from '@/types/commission-band';

interface FormProps {
  item: CommissionBand;
  onComplete: () => void;
}

export const DeleteForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: metadata.deleteCommissionBand,
    onSuccess: (isSuccess, deletedId) => {
      if (isSuccess) {
        queryClient.setQueryData([queryKey.commissionBands], (oldData: CommissionBand[]) =>
          oldData.filter((_commissionBand) => _commissionBand.id !== deletedId)
        );
        queryClient.invalidateQueries({ queryKey: [queryKey.commissionBands] });
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
