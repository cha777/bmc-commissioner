import type { FC } from 'react';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { metadata } from '@/api';
import { queryKey } from '@/utils';
import type { Product } from '@/types/product';

interface FormProps {
  item: Product;
  onComplete: () => void;
}

export const DeleteForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: metadata.deleteProduct,
    onSuccess: (isSuccess, deletedId) => {
      if (isSuccess) {
        queryClient.setQueryData([queryKey.products], (oldData: Product[]) =>
          oldData.filter((_product) => _product.id !== deletedId)
        );
        queryClient.invalidateQueries({ queryKey: [queryKey.products] });
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
