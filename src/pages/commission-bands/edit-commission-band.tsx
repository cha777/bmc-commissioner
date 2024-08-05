import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { metadata } from '@/api';
import type { CommissionBand } from '@/types/commission-band';

interface FormProps {
  item: CommissionBand;
  onComplete: () => void;
}

export const EditForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const formSchema = useMemo(() => {
    return z.object({
      upperLimit: z.number().min(0, 'Upper limit should be greater than 0'),
      lowerLimit: z.number().min(0, 'Upper limit should be greater than 0'),
      rate: z.number(),
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      upperLimit: item.upperLimit === Infinity ? 0 : item.upperLimit,
      lowerLimit: item.lowerLimit === -Infinity ? 0 : item.lowerLimit,
      rate: item.rate,
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      metadata.updateCommissionBand({
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
