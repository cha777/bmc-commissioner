'use client';

import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { History, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';

export default function HistoryListPage() {
  const { records } = useStore();
  const sortedRecords = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className='p-6 space-y-6 pb-24'>
      <header className='flex items-center gap-3'>
        <div className='p-3 bg-primary/10 rounded-2xl'>
          <History className='w-6 h-6 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>Record History</h1>
          <p className='text-xs text-muted-foreground'>Audit production and payouts</p>
        </div>
      </header>

      <div className='space-y-4'>
        {sortedRecords.map((r) => (
          <Link
            key={r.id}
            href={`/history/${r.id}`}
            className='w-full text-left glass-card rounded-2xl p-4 flex items-center justify-between group active:scale-95 transition-transform'
          >
            <div className='flex items-center gap-4'>
              <div className='bg-white/5 p-2 rounded-xl'>
                <Calendar className='w-4 h-4 text-muted-foreground' />
              </div>
              <div>
                <p className='font-bold'>{format(new Date(r.date), 'PPP')}</p>
                <div className='flex gap-2 items-center'>
                  <p className='text-[10px] text-muted-foreground uppercase tracking-widest'>
                    {formatNumber(r.total_units, 0)} units • {r.employees.length} workers
                  </p>
                  <span className='w-1 h-1 bg-white/20 rounded-full' />
                  <p className='text-[10px] font-bold text-primary'>ID: {r.id.split('-')[0]}</p>
                </div>
              </div>
            </div>
            <ChevronRight className='w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors' />
          </Link>
        ))}
        {records.length === 0 && (
          <div className='text-center py-20 opacity-30'>
            <AlertCircle className='w-12 h-12 mx-auto mb-2' />
            <p>No history available</p>
          </div>
        )}
      </div>
    </div>
  );
}
