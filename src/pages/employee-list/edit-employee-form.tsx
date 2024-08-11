import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

import { metadata } from '@/api';
import { queryKey } from '@/utils';
import type { Employee } from '@/types/employee';

interface FormProps {
  item: Employee;
  onComplete: () => void;
}

export const EditForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: metadata.updateEmployee,
    onSuccess: (data) => {
      queryClient.setQueryData([queryKey.employees], (oldData: Employee[]) =>
        oldData.map((_employee) => (_employee.id === data.id ? data : _employee))
      );

      queryClient.invalidateQueries({ queryKey: [queryKey.employees] });
      onComplete();
    },
  });

  const formSchema = useMemo(() => {
    return Yup.object().shape({
      isPermanent: Yup.boolean(),
      weight: Yup.number().min(0, 'Weight should be greater than 0'),
    });
  }, []);

  const form = useForm<Yup.InferType<typeof formSchema>>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      isPermanent: item.isPermanent,
      weight: item.weight,
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
            name='isPermanent'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start space-x-3 space-y-0 p-4'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Is Permanent</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='weight'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
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
