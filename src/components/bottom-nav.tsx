'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'History', icon: History, href: '/history' },
  { label: 'Stats', icon: BarChart3, href: '/stats' },
  { label: 'Admin', icon: Settings, href: '/admin' },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className='fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-lg glass-card rounded-3xl p-2 z-50'>
      <div className='flex items-center justify-around'>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300',
                isActive
                  ? 'bg-primary text-primary-foreground scale-110 shadow-lg neon-glow'
                  : 'text-muted-foreground hover:bg-white/5',
              )}
            >
              <item.icon className='w-6 h-6' />
              <span className='text-[10px] mt-1 font-medium'>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
