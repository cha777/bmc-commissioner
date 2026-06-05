'use client';

import { useSupabaseSync } from '@/hooks/useSupabaseSync';
import { Wifi, WifiOff, RefreshCw, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, isSyncing, pendingTasks } = useSupabaseSync();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <div className='fixed top-0 left-0 right-0 h-12 bg-black/40 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4'>
        <div className='flex items-center gap-3'>
          <span className='text-xs font-black tracking-widest text-white'>
            BMC <span className='text-primary neon-text'>PRO</span>
          </span>
          <div className='h-4 w-px bg-white/20'></div>
          <div className='flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider'>
            {isOnline ? (
              <span className='text-emerald-400 flex items-center gap-1'>
                <Wifi className='w-3 h-3' /> Online
              </span>
            ) : (
              <span className='text-rose-400 flex items-center gap-1'>
                <WifiOff className='w-3 h-3' /> Offline
              </span>
            )}

            {pendingTasks > 0 && (
              <span className='ml-2 text-amber-400 flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20'>
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {pendingTasks} Pending
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className='text-muted-foreground hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10'
        >
          <LogOut className='w-4 h-4' />
        </button>
      </div>
      <div className='pt-12 h-full w-full'>{children}</div>
    </>
  );
}
