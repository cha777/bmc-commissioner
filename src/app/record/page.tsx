'use client';

import { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { createDailyRecordSnapshot } from '@/lib/formula';
import { useRouter } from 'next/navigation';
import { Calculator, UserPlus, Database, FileText, Settings } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function RecordEntry() {
  const router = useRouter();
  const { metals, employees, rates, addRecord } = useStore();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [production, setProduction] = useState<Record<string, number>>({});
  const [activeEmployees, setActiveEmployees] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [note, setNote] = useState('');
  const [disableNegative, setDisableNegative] = useState(false);
  const [bonus, setBonus] = useState('');
  const [idleEmployees, setIdleEmployees] = useState('0');

  // Auto-select permanent employees on load
  useEffect(() => {
    if (employees.length > 0 && !hasInitialized) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveEmployees(employees.filter((e) => e.is_permanent ?? true).map((e) => e.id));
      setHasInitialized(true);
    }
  }, [employees, hasInitialized]);

  // Auto-calculate preview
  const preview = useMemo(() => {
    if (
      activeEmployees.length > 0 &&
      (Object.values(production).some((v) => v > 0) || disableNegative || parseFloat(bonus) > 0)
    ) {
      const entries = Object.entries(production).map(([id, units]) => ({ metal_id: id, units }));
      return createDailyRecordSnapshot(
        date,
        entries,
        activeEmployees,
        metals,
        employees,
        rates,
        note,
        disableNegative,
        parseFloat(bonus) || 0,
        parseInt(idleEmployees) || 0,
      );
    }

    return null;
  }, [production, activeEmployees, date, metals, employees, rates, note, disableNegative, bonus, idleEmployees]);

  const handleSave = () => {
    if (!preview) return;

    addRecord(preview);
    router.push('/');
  };

  return (
    <div className='p-6 space-y-6 pb-24'>
      <header className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-neon'>New Batch</h1>
          <input
            type='date'
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className='bg-transparent text-muted-foreground text-sm border-none focus:ring-0 p-0'
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={!preview}
          className='rounded-2xl px-6 neon-glow'
        >
          Save Record
        </Button>
      </header>

      {/* Production Section */}
      <section className='space-y-4'>
        <h2 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
          <Database className='w-4 h-4' />
          Metal Production
        </h2>
        <div className='grid gap-3'>
          {metals.map((metal) => (
            <div
              key={metal.id}
              className='glass-card rounded-2xl p-4 flex items-center justify-between'
            >
              <div>
                <p className='font-medium'>{metal.name}</p>
                <p className='text-[10px] text-muted-foreground'>{formatNumber(metal.price)} / unit</p>
              </div>
              <div className='flex items-center gap-3'>
                <input
                  type='number'
                  placeholder='0'
                  value={production[metal.id] || ''}
                  onChange={(e) => setProduction({ ...production, [metal.id]: parseFloat(e.target.value) || 0 })}
                  className='w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-right focus:border-primary transition-colors'
                />
                <span className='text-xs text-muted-foreground'>Units</span>
              </div>
            </div>
          ))}
          {metals.length === 0 && (
            <p className='text-sm text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20'>
              No metals configured. Go to Admin to add metal types.
            </p>
          )}
        </div>
      </section>

      {/* Employees Section */}
      <section className='space-y-4'>
        <h2 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
          <UserPlus className='w-4 h-4' />
          Employees on Shift
        </h2>
        <div className='glass-card rounded-2xl p-4 border border-white/5 space-y-3'>
          <div className='flex justify-between items-center pb-2 border-b border-white/5'>
            <span className='text-[10px] uppercase font-bold text-muted-foreground'>
              {activeEmployees.length} Selected
            </span>
            <div className='flex gap-3'>
              <button
                onClick={() => setActiveEmployees(employees.map((e) => e.id))}
                className='text-[10px] uppercase font-bold text-primary hover:underline'
              >
                Select All
              </button>
              <button
                onClick={() => setActiveEmployees([])}
                className='text-[10px] uppercase font-bold text-primary hover:underline'
              >
                Clear All
              </button>
            </div>
          </div>
          <div className='flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-hide'>
            {employees.map((emp) => {
              const isSelected = activeEmployees.includes(emp.id);
              return (
                <button
                  key={emp.id}
                  onClick={() => {
                    setActiveEmployees((prev) => (isSelected ? prev.filter((id) => id !== emp.id) : [...prev, emp.id]));
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    isSelected
                      ? 'bg-primary text-primary-foreground neon-glow'
                      : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10',
                  )}
                >
                  {emp.name} <span className='opacity-60 ml-1'>W:{emp.weight}</span>
                </button>
              );
            })}
          </div>
          <div className='pt-3 border-t border-white/5 space-y-2 mt-2'>
            <label className='text-[10px] uppercase font-bold text-muted-foreground flex justify-between'>
              <span>Idle Employees Count</span>
              <span className='text-primary'>{parseInt(idleEmployees) || 0}</span>
            </label>
            <input
              type='number'
              value={idleEmployees}
              onChange={(e) => setIdleEmployees(e.target.value)}
              placeholder='0'
              className='w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary transition-colors outline-none'
            />
          </div>
        </div>
      </section>

      {/* Optional Details */}
      <section className='space-y-4'>
        <h2 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
          <FileText className='w-4 h-4' />
          Batch Note
        </h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder='Add any operational notes, repair details, or anomalies here...'
          className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-primary transition-colors outline-none resize-none h-24'
        />
      </section>

      <section className='space-y-4'>
        <h2 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
          <Settings className='w-4 h-4' />
          Advanced Options (Repairs & Bonuses)
        </h2>
        <div className='glass-card rounded-2xl p-5 space-y-4 border border-white/10'>
          <label className='flex items-center gap-3 cursor-pointer'>
            <input
              type='checkbox'
              checked={disableNegative}
              onChange={(e) => setDisableNegative(e.target.checked)}
              className='w-5 h-5 rounded border-white/20 text-primary focus:ring-primary focus:ring-offset-gray-900 bg-white/5'
            />
            <div className='space-y-1'>
              <p className='text-sm font-medium'>Disable Negative Commissions</p>
              <p className='text-[10px] text-muted-foreground'>
                Prevents negative payouts when production is zero or below minimum thresholds (e.g. during repairs).
              </p>
            </div>
          </label>
          <div className='space-y-2 pt-2 border-t border-white/5'>
            <label className='text-[10px] uppercase font-bold text-muted-foreground'>
              Additional Bonus per Weight Unit (B)
            </label>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
                placeholder='0.00'
                className='w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-primary transition-colors outline-none'
              />
            </div>
            <p className='text-[10px] text-muted-foreground'>
              Each employee will receive Bonus = B × W (their weight factor).
            </p>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      {preview && (
        <section className='space-y-4 pt-4 border-t border-white/5'>
          <h2 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2'>
            <Calculator className='w-4 h-4' />
            Live Commission Preview
          </h2>
          <div className='glass-card rounded-3xl p-6 bg-primary/5 space-y-4'>
            <div className='grid grid-cols-2 gap-4 text-center border-b border-white/10 pb-4'>
              <div>
                <p className='text-[10px] text-muted-foreground uppercase'>Average Price</p>
                <p className='text-lg font-bold'>{formatNumber(preview.snapshot_avg_price)}</p>
              </div>
              <div>
                <p className='text-[10px] text-muted-foreground uppercase'>Rate Factor</p>
                <p className='text-lg font-bold'>
                  {preview.employees[0]?.commission_earned > 0 ? 'Tier Hit' : 'Below Min'}
                </p>
              </div>
            </div>

            <div className='space-y-3'>
              {preview.employees.map((pe) => {
                const empName = employees.find((e) => e.id === pe.employee_id)?.name;
                return (
                  <div
                    key={pe.employee_id}
                    className='flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5'
                  >
                    <div>
                      <span className='text-sm font-bold block'>{empName}</span>
                      {(pe.base_commission || 0) > 0 || (pe.bonus_amount || 0) > 0 ? (
                        <div className='text-[10px] text-muted-foreground flex gap-2'>
                          <span>Base: {formatNumber(pe.base_commission || 0)}</span>
                          {pe.bonus_amount ? (
                            <span className='text-primary'>Bonus: +{formatNumber(pe.bonus_amount)}</span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <span className='font-mono font-black text-primary'>{formatNumber(pe.commission_earned)}</span>
                  </div>
                );
              })}
            </div>

            <div className='pt-4 mt-4 border-t border-white/10 flex justify-between items-end'>
              <div>
                <p className='text-[10px] text-muted-foreground uppercase'>Total Pool</p>
                <p className='text-xl font-bold text-neon'>
                  {formatNumber(preview.employees.reduce((a, b) => a + b.commission_earned, 0))}
                </p>
              </div>
              <div className='text-right'>
                <p className='text-[10px] text-muted-foreground uppercase'>Units (U)</p>
                <p className='text-xl font-bold'>{formatNumber(preview.total_units, 0)}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
