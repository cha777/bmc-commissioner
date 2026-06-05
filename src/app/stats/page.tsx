'use client';

import { useStore } from '@/lib/store';
import { BarChart3, TrendingUp, Award, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatNumber } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Period, PeriodPicker } from '@/components/period-picker';

export default function StatsPage() {
  const { records, employees } = useStore();
  const [period, setPeriod] = useState<Period>('7d');
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    if (period === 'all') return records;

    const now = new Date();
    const cutoff = new Date(now.getTime() - parseInt(period) * 24 * 60 * 60 * 1000);
    return records.filter((r) => new Date(r.date) >= cutoff);
  }, [records, period]);

  // Group stats per employee
  const employeeEarnings = useMemo(() => {
    return employees.map((emp) => {
      const total = filteredRecords.reduce((acc, r) => {
        const pe = r.employees.find((e) => e.employee_id === emp.id);
        return acc + (pe?.commission_earned || 0);
      }, 0);
      return { name: emp.name, total, id: emp.id };
    });
  }, [employees, filteredRecords]);

  // Aggregate stats for "All Employees" view vs "Single Employee" view
  const chartData = useMemo(() => {
    // Show last 10 records
    const recentRecords = [...filteredRecords]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10);

    return recentRecords.map((r) => {
      const date = new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (selectedEmpId) {
        return {
          date,
          earned: r.employees.find((e) => e.employee_id === selectedEmpId)?.commission_earned || 0,
        };
      } else {
        // Total for all employees
        return {
          date,
          total: r.employees.reduce((acc, e) => acc + e.commission_earned, 0),
        };
      }
    });
  }, [filteredRecords, selectedEmpId]);

  return (
    <div className='p-6 space-y-6 pb-24'>
      <header className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='p-3 bg-primary/10 rounded-2xl'>
            <BarChart3 className='w-6 h-6 text-primary' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>Earnings Report</h1>
            <p className='text-xs text-muted-foreground'>Performance and payouts</p>
          </div>
        </div>

        <PeriodPicker
          value={period}
          onChange={setPeriod}
        />
      </header>

      {/* Detail Chart */}
      <section className='glass-card rounded-3xl p-6 h-80 animate-in fade-in duration-500'>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-sm font-bold flex items-center gap-2'>
            <TrendingUp className='w-4 h-4 text-primary' />
            {selectedEmpId
              ? `Payout History: ${employees.find((e) => e.id === selectedEmpId)?.name}`
              : 'Combined Global Payouts'}
          </h3>
          {selectedEmpId && (
            <button
              onClick={() => setSelectedEmpId(null)}
              className='text-[10px] uppercase font-bold text-primary hover:underline'
            >
              Clear Selection
            </button>
          )}
        </div>

        <div className='w-full h-50'>
          {filteredRecords.length > 0 ? (
            <ResponsiveContainer
              width='100%'
              height='100%'
            >
              <BarChart data={chartData}>
                <XAxis
                  dataKey='date'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(10, 10, 20, 0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <Bar
                  dataKey={selectedEmpId ? 'earned' : 'total'}
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === chartData.length - 1 ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}
                      className='transition-all duration-500'
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className='h-full flex flex-col items-center justify-center opacity-20'>
              <Users className='w-12 h-12 mb-2' />
              <p className='text-xs'>No data to display</p>
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard View */}
      <section className='space-y-4'>
        <h2 className='text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2'>
          <Award className='w-4 h-4' /> Lifetime Earnings
        </h2>
        <div className='grid gap-2'>
          {employeeEarnings
            .sort((a, b) => b.total - a.total)
            .map((emp, i) => (
              <button
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className={cn(
                  'glass-card rounded-2xl p-4 flex items-center justify-between transition-all active:scale-95',
                  selectedEmpId === emp.id ? 'bg-primary/20 border-primary/50 neon-glow' : 'bg-white/5 opacity-80',
                )}
              >
                <div className='flex items-center gap-3'>
                  <span className='text-lg font-black italic text-white/20'>#{i + 1}</span>
                  <span className='font-medium'>{emp.name}</span>
                </div>
                <span className='font-mono font-bold text-primary'>{formatNumber(emp.total)}</span>
              </button>
            ))}
          {employees.length === 0 && (
            <p className='text-center py-10 text-xs text-muted-foreground'>No employees configured yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
