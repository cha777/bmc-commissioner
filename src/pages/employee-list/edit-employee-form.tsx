import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

import { metadata } from '@/api';
import type { Employee } from '@/types/employee';

interface FormProps {
  item: Employee;
  onComplete: () => void;
}

export const EditForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const formSchema = useMemo(() => {
    return z.object({
      isPermanent: z.boolean(),
      weight: z.number().min(0, 'Weight should be greater than 0'),
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPermanent: item.isPermanent,
      weight: item.weight,
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      metadata.updateEmployee({
        ...item,
        ...values,
      });

      onComplete();
    },
    [item, onComplete]
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
