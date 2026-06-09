'use client';

import { useStore } from '@/lib/store';
import Link from 'next/link';
import {
  TrendingUp,
  Users,
  Scale,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FilePlus2,
  Plus,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useMemo } from 'react';
import { cn, formatNumber } from '@/lib/utils';
import { Period, PeriodPicker } from '@/components/period-picker';

export default function Dashboard() {
  const { records, metals, employees } = useStore();
  const [period, setPeriod] = useState<Period>('7d');

  const { filteredRecords, prevRecords, periodLabel } = useMemo(() => {
    const now = new Date();
    let days = 7;
    let label = 'Last 7 Days';

    if (period === '30d') {
      days = 30;
      label = 'Last 30 Days';
    }
    if (period === '90d') {
      days = 90;
      label = 'Last 3 Months';
    }
    if (period === '180d') {
      days = 180;
      label = 'Last 6 Months';
    }
    if (period === '365d') {
      days = 365;
      label = 'Last Year';
    }
    if (period === 'all') {
      days = 9999;
      label = 'All Time';
    }

    const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevThreshold = new Date(threshold.getTime() - days * 24 * 60 * 60 * 1000);

    const filtered = records.filter((r) => new Date(r.date) >= threshold);
    const prev = records.filter((r) => {
      const d = new Date(r.date);
      return d >= prevThreshold && d < threshold;
    });

    return { filteredRecords: filtered, prevRecords: prev, periodLabel: label };
  }, [records, period]);

  const stats = useMemo(() => {
    const calcStats = (recs: typeof records) => ({
      units: recs.reduce((acc, r) => acc + r.total_units, 0),
      commissions: recs.reduce((acc, r) => acc + r.employees.reduce((eAcc, e) => eAcc + e.commission_earned, 0), 0),
    });

    const current = calcStats(filteredRecords);
    const previous = calcStats(prevRecords);

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      units: current.units,
      unitsGrowth: calcGrowth(current.units, previous.units),
      commissions: current.commissions,
      commissionsGrowth: calcGrowth(current.commissions, previous.commissions),
    };
  }, [filteredRecords, prevRecords]);

  const chartData = useMemo(() => {
    const data: { name: string; current: number; previous: number }[] = [];
    const now = new Date();

    let days = period === 'all' ? 30 : period === '365d' ? 365 : parseInt(period);

    if (isNaN(days)) days = 30;

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = d.toISOString().split('T')[0];

      const prevD = new Date(d.getTime() - days * 24 * 60 * 60 * 1000);
      const prevDStr = prevD.toISOString().split('T')[0];

      const dayUnits = records.filter((r) => r.date === dStr).reduce((acc, r) => acc + r.total_units, 0);
      const prevDayUnits = records.filter((r) => r.date === prevDStr).reduce((acc, r) => acc + r.total_units, 0);

      data.push({
        name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        current: dayUnits,
        previous: prevDayUnits,
      });
    }

    return data;
  }, [records, period]);

  return (
    <div className='p-6 space-y-8'>
      <header className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-neon'>Bandula Metal Crusher</h1>
          <p className='text-muted-foreground'>{periodLabel} Overview</p>
        </div>
        <PeriodPicker
          value={period}
          onChange={setPeriod}
        />
      </header>

      <div className='grid grid-cols-2 gap-4'>
        <KpiCard
          label='Total Production'
          value={formatNumber(stats.units, 0)}
          icon={Scale}
          growth={stats.unitsGrowth}
          suffix=' Cubes'
          color='text-primary'
        />
        <KpiCard
          label='Commissions'
          value={formatNumber(stats.commissions)}
          icon={CircleDollarSign}
          growth={stats.commissionsGrowth}
          color='text-amber-400'
        />
        <KpiCard
          label='Total Employees'
          value={formatNumber(employees.length, 0)}
          icon={Users}
        />
        <KpiCard
          label='Metal Types'
          value={formatNumber(metals.length, 0)}
          icon={TrendingUp}
        />
      </div>

      <section className='glass-card rounded-3xl p-6 h-100'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-lg font-semibold flex items-center gap-2'>
            <TrendingUp className='w-5 h-5 text-primary' />
            Comparison Trend
          </h2>
          <div className='flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest'>
            <div className='flex items-center gap-1.5'>
              <div className='w-2 h-2 rounded-full bg-primary' /> Current
            </div>
            <div className='flex items-center gap-1.5 text-white/60'>
              <div className='w-2 h-2 rounded-full bg-white/60' /> Previous
            </div>
          </div>
        </div>
        <div className='w-full h-75'>
          <ResponsiveContainer
            width='100%'
            height='100%'
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id='colorCurrent'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='1'
                >
                  <stop
                    offset='5%'
                    stopColor='oklch(0.75 0.2 190)'
                    stopOpacity={0.3}
                  />
                  <stop
                    offset='95%'
                    stopColor='oklch(0.75 0.2 190)'
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(255,255,255,0.05)'
                vertical={false}
              />
              <XAxis
                dataKey='name'
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                interval={Math.floor(chartData.length / 5)}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 20, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                }}
              />
              <Area
                type='monotone'
                dataKey='previous'
                name='Previous'
                stroke='rgba(255,255,255,0.6)'
                strokeWidth={2}
                fill='transparent'
                strokeDasharray='5 5'
              />
              <Area
                type='monotone'
                dataKey='current'
                name='Current'
                stroke='oklch(0.75 0.2 190)'
                strokeWidth={3}
                fillOpacity={1}
                fill='url(#colorCurrent)'
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {records.length === 0 && (
        <div className='glass-card rounded-3xl p-8 text-center space-y-4'>
          <div className='bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto'>
            <FilePlus2 className='w-8 h-8 text-primary' />
          </div>
          <h3 className='text-lg font-medium'>No records found</h3>
          <p className='text-sm text-muted-foreground'>Start by logging your first production run.</p>
        </div>
      )}

      {/* Floating Action Button */}
      <Link
        href='/record'
        className='fixed bottom-24 right-6 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-2xl neon-glow hover:scale-110 active:scale-95 transition-all z-40'
      >
        <Plus className='w-8 h-8' />
      </Link>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  growth,
  suffix = '',
  color = 'text-foreground',
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  growth?: number;
  suffix?: string;
  color?: string;
}) {
  const isPositive = growth !== undefined && growth >= 0;

  return (
    <div className='glass-card rounded-3xl p-4 space-y-2 relative overflow-hidden group'>
      <div className='flex items-center justify-between'>
        <div className='p-2 bg-white/5 rounded-xl'>
          <Icon className='w-4 h-4 text-muted-foreground' />
        </div>
        {growth !== undefined && (
          <div
            className={cn(
              'flex items-center text-[10px] font-black px-2 py-0.5 rounded-full',
              isPositive ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10',
            )}
          >
            {isPositive ? <ArrowUpRight className='w-2 h-2 mr-1' /> : <ArrowDownRight className='w-2 h-2 mr-1' />}
            {Math.abs(growth!).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <p className='text-[10px] uppercase font-bold tracking-widest text-muted-foreground'>{label}</p>
        <p className={cn('text-lg font-black tracking-tight mt-1', color)}>
          {value}
          {suffix}
        </p>
      </div>
    </div>
  );
}
