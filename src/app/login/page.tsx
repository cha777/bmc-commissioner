'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: `${username.trim()}@bmc.pos`,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <main className='h-full flex-1 flex flex-col items-center justify-center p-6 animated-bg bg-fixed bg-cover'>
      <div className='w-full max-w-md animate-in slide-in-from-bottom-8 duration-700'>
        <div className='glass-card rounded-[2rem] p-8 md:p-10 space-y-8 shadow-2xl shadow-black/50 border-white/10'>
          <div className='text-center space-y-2'>
            <div className='w-16 h-16 bg-primary/20 rounded-2xl mx-auto flex items-center justify-center mb-6 neon-glow border border-primary/30'>
              <Lock className='w-8 h-8 text-primary' />
            </div>
            <h1 className='text-3xl font-black tracking-tight text-white'>BMC Access</h1>
            <p className='text-muted-foreground text-sm'>Enter your credentials to manage productions</p>
          </div>

          <form
            onSubmit={handleLogin}
            className='space-y-5'
          >
            {error && (
              <div className='bg-destructive/15 text-destructive border border-destructive/30 text-xs p-4 rounded-2xl font-medium animate-in fade-in'>
                {error}
              </div>
            )}

            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1'>
                  Username
                </label>
                <div className='relative'>
                  <Mail className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <input
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className='w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 focus:border-primary transition-colors outline-none text-sm placeholder:text-muted-foreground/50 text-white'
                    placeholder='admin'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1'>
                  Password
                </label>
                <div className='relative'>
                  <Lock className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <input
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className='w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 focus:border-primary transition-colors outline-none text-sm placeholder:text-muted-foreground/50 text-white'
                    placeholder='••••••••'
                  />
                </div>
              </div>
            </div>

            <Button
              type='submit'
              disabled={loading}
              className='w-full h-14 rounded-2xl neon-glow text-lg font-bold flex items-center justify-center gap-2 group mt-2'
            >
              {loading ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <>
                  Secure Login
                  <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
