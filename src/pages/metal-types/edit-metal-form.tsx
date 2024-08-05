import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { metadata } from '@/api';
import type { MetalType } from '@/types/metal-type';

interface FormProps {
  item: MetalType;
  onComplete: () => void;
}

export const EditForm: FC<FormProps> = (props) => {
  const { item, onComplete } = props;

  const formSchema = useMemo(() => {
    return z.object({
      price: z.number().min(0, 'Price should be greater than 0'),
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: item.price,
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      metadata.updateMetalType({
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
