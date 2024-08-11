import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { metadata } from '@/api';
import { queryKey } from '@/utils';
import type { CommissionBand } from '@/types/commission-band';

interface FormProps {
  item: CommissionBand;
  onComplete: () => void;
}

export const EditForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: metadata.updateCommissionBand,
    onSuccess: (data) => {
      queryClient.setQueryData([queryKey.commissionBands], (oldData: CommissionBand[]) =>
        oldData.map((_commissionBand) => (_commissionBand.id === data.id ? data : _commissionBand))
      );

      queryClient.invalidateQueries({ queryKey: [queryKey.commissionBands] });
      onComplete();
    },
  });

  const formSchema = useMemo(() => {
    return Yup.object().shape({
      upperLimit: Yup.number().min(0, 'Upper limit should be greater than 0'),
      lowerLimit: Yup.number().min(0, 'Upper limit should be greater than 0'),
      rate: Yup.number(),
    });
  }, []);

  const form = useForm<Yup.InferType<typeof formSchema>>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      upperLimit: item.upperLimit === Infinity ? 0 : item.upperLimit,
      lowerLimit: item.lowerLimit === -Infinity ? 0 : item.lowerLimit,
      rate: item.rate,
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
            name='lowerLimit'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lower Limit</FormLabel>
                <FormDescription>Keep value 0 to set the minimum range</FormDescription>
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
          <FormField
            control={form.control}
            name='upperLimit'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upper Limit</FormLabel>
                <FormDescription>Keep value 0 to set the maximum range</FormDescription>
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
          <FormField
            control={form.control}
            name='rate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate</FormLabel>
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
