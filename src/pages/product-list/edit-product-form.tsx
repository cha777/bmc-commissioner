import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { metadata } from '@/api';
import { queryKey } from '@/utils';
import type { Product } from '@/types/product';

interface FormProps {
  item: Product;
  onComplete: () => void;
}

export const EditForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: metadata.updateProduct,
    onSuccess: (data) => {
      queryClient.setQueryData([queryKey.products], (oldData: Product[]) =>
        oldData.map((_product) => (_product.id === data.id ? data : _product))
      );

      queryClient.invalidateQueries({ queryKey: [queryKey.products] });
      onComplete();
    },
  });

  const formSchema = useMemo(() => {
    return Yup.object().shape({
      price: Yup.number().min(0, 'Price should be greater than 0'),
    });
  }, []);

  const form = useForm<Yup.InferType<typeof formSchema>>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      price: item.price,
    },
  });

  const onSubmit = useCallback(
    async (values: Yup.InferType<typeof formSchema>) => {
      mutation.mutate({
        ...item,
        ...values,
      });
    },
    [item, mutation]
  );

  return (
    <Form {...form}>
      <form
        className='grid items-start gap-4'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className='grid gap-2'>
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type='submit'>Save changes</Button>
      </form>
    </Form>
  );
};
