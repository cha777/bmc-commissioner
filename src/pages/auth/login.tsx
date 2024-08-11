import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { useMounted } from '@/hooks/use-mounted';
import { useSearchParams } from '@/hooks/use-search-params';
import { paths } from '@/paths';

const formSchema = Yup.object().shape({
  username: Yup.string().required('Username cannot be empty'),
  password: Yup.string().required('Password cannot be empty'),
});

const Page: FC = () => {
  const isMounted = useMounted();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { login } = useAuth();

  const [message, setMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const form = useForm<Yup.InferType<typeof formSchema>>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async (values: Yup.InferType<typeof formSchema>) => {
      try {
        setIsAuthenticating(true);
        setMessage('Authenticating');

        await login(values.username, values.password);

        if (isMounted()) {
          window.location.href = returnTo || paths.index;
        }
      } catch (e) {
        setIsAuthenticating(false);
        setMessage('Authentication failed');
      }
    },
    [isMounted, login, returnTo]
  );

  return (
    <Card className='mx-auto max-w-sm pt-6'>
      <CardHeader>
        <CardTitle className='text-2xl'>Login</CardTitle>
        <CardDescription>Enter your credentials below to login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8'
          >
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          type='string'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid gap-2'>
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type='submit'
                className='w-full'
              >
                Login
              </Button>

              <div className='h-6'>
                {message && (
                  <span
                    className={cn(
                      'flex w-full flex-col gap-2 rounded-lg px-3 py-2 text-sm ml-auto text-primary-foreground text-center truncate overflow-hidden',
                      isAuthenticating ? 'bg-blue-400' : 'bg-red-500 opacity-90'
                    )}
                  >
                    {message}
                  </span>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='justify-center text-muted-foreground text-sm text-center'>v{__APP_VERSION__}</CardFooter>
    </Card>
  );
};

export default Page;
