import { cn } from '@/lib/utils';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export type Period = '7d' | '30d' | '90d' | '180d' | '365d' | 'all';

export function PeriodPicker({ value, onChange }: { value: Period; onChange: (v: Period) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const options: { label: string; value: Period }[] = [
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'Last 3 Months', value: '90d' },
    { label: 'Last 6 Months', value: '180d' },
    { label: 'Last Year', value: '365d' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs font-semibold hover:bg-white/10 transition-colors'
      >
        <CalendarDays className='w-4 h-4 text-primary' />
        {options.find((o) => o.value === value)?.label}
        <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-40'
            onClick={() => setIsOpen(false)}
          />
          <div className='absolute right-0 mt-2 w-48 glass-card rounded-2xl p-1 z-50 animate-in zoom-in-95 duration-200'>
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-4 py-2 text-xs rounded-xl hover:bg-primary/10 transition-colors',
                  value === opt.value ? 'text-primary font-bold bg-primary/5' : 'text-muted-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
