'use client';

import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { Trash2, Clock, ChevronLeft, Edit3, Users, Box, Save, FileText, Settings } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createDailyRecordSnapshot } from '@/lib/formula';
import { formatNumber } from '@/lib/utils';

export default function RecordDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { records, employees, metals, rates, removeRecord, updateRecord } = useStore();

  const originalRecord = useMemo(() => records.find((r) => r.id === id), [records, id]);
  const [isEditing, setIsEditing] = useState(false);

  // Edit State
  const [date, setDate] = useState('');
  const [production, setProduction] = useState<Record<string, number>>({});
  const [activeEmployees, setActiveEmployees] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [disableNegative, setDisableNegative] = useState(false);
  const [bonus, setBonus] = useState('');
  const [idleEmployees, setIdleEmployees] = useState('0');
  const [useLatestAdmin, setUseLatestAdmin] = useState(false);

  const handleEditClick = () => {
    if (originalRecord) {
      setDate(originalRecord.date);
      const prod: Record<string, number> = {};
      originalRecord.production_details.forEach((p) => (prod[p.metal_id] = p.units));
      setProduction(prod);
      setActiveEmployees(originalRecord.employees.map((e) => e.employee_id));
      setNote(originalRecord.note || '');
      setDisableNegative(originalRecord.disable_negative_commissions || false);
      setBonus((originalRecord.additional_bonus_per_weight || 0).toString());
      setIdleEmployees((originalRecord.idle_employee_count || 0).toString());
    }

    setIsEditing(true);
  };

  // Preview logic for editing
  const preview = useMemo(() => {
    if (
      isEditing &&
      activeEmployees.length > 0 &&
      (Object.values(production).some((v) => v > 0) || disableNegative || parseFloat(bonus) > 0) &&
      originalRecord
    ) {
      const entries = Object.entries(production).map(([id, units]) => ({ metal_id: id, units }));

      const effectiveMetals = useLatestAdmin
        ? metals
        : metals.map((m) => {
            const hist = originalRecord.production_details.find((p) => p.metal_id === m.id);
            return hist ? { ...m, price: hist.snapshot_price } : m;
          });

      const effectiveEmployees = useLatestAdmin
        ? employees
        : employees.map((e) => {
            const hist = originalRecord.employees.find((pe) => pe.employee_id === e.id);
            return hist ? { ...e, weight: hist.snapshot_weight } : e;
          });

      const effectiveRates = useLatestAdmin ? rates : originalRecord.snapshot_rates_json;
      const effectiveAvgPrice = useLatestAdmin ? undefined : originalRecord.snapshot_avg_price;

      const snap = createDailyRecordSnapshot(
        date,
        entries,
        activeEmployees,
        effectiveMetals,
        effectiveEmployees,
        effectiveRates,
        note,
        disableNegative,
        parseFloat(bonus) || 0,
        parseInt(idleEmployees) || 0,
        effectiveAvgPrice,
      );

      return { ...snap, id: originalRecord.id }; // Preserve ID
    }

    return null;
  }, [
    production,
    activeEmployees,
    date,
    isEditing,
    metals,
    employees,
    rates,
    originalRecord,
    note,
    disableNegative,
    bonus,
    idleEmployees,
    useLatestAdmin,
  ]);

  if (!originalRecord) return <div className='p-10 text-center'>Record not found.</div>;

  const handleUpdate = () => {
    if (preview) {
      updateRecord(preview);
      setIsEditing(false);
    }
  };

  return (
    <div className='p-6 space-y-6 pb-24'>
      <header className='flex items-center justify-between'>
        <Button
          variant='ghost'
          onClick={() => router.push('/history')}
          className='p-0 hover:bg-transparent text-muted-foreground'
        >
          <ChevronLeft className='w-4 h-4 mr-1' /> Archive
        </Button>
        <div className='flex gap-2'>
          {!isEditing && (
            <Button
              variant='ghost'
              size='icon'
              onClick={handleEditClick}
              className='rounded-xl border border-white/10'
            >
              <Edit3 className='w-4 h-4 text-primary' />
            </Button>
          )}
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              if (confirm('Delete this record permanently?')) {
                removeRecord(originalRecord.id);
                router.push('/history');
              }
            }}
            className='rounded-xl border border-rose-500/20'
          >
            <Trash2 className='w-4 h-4 text-rose-500' />
          </Button>
        </div>
      </header>

      {isEditing ? (
        <div className='space-y-6 animate-in slide-in-from-bottom-4 duration-500'>
          <h1 className='text-2xl font-bold text-neon flex items-center gap-2'>
            <Edit3 className='w-6 h-6' /> Edit Batch
          </h1>

          <div className='space-y-4'>
            {/* Date Input */}
            <div className='space-y-2'>
              <label className='text-xs font-bold uppercase text-muted-foreground'>Batch Date</label>
              <input
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className='w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus:border-primary outline-none'
              />
            </div>

            {/* Units Drill-down */}
            <div className='space-y-3'>
              <label className='text-xs font-bold uppercase text-muted-foreground flex items-center gap-2'>
                <Box className='w-3 h-3' /> Production Breakdown
              </label>
              {metals.map((m) => (
                <div
                  key={m.id}
                  className='glass-card rounded-2xl p-4 flex items-center justify-between border-white/5'
                >
                  <span className='font-medium'>{m.name}</span>
                  <input
                    type='number'
                    value={production[m.id] || ''}
                    onChange={(e) => setProduction({ ...production, [m.id]: parseFloat(e.target.value) || 0 })}
                    className='w-24 bg-white/10 border-none rounded-xl px-3 py-2 text-right font-bold text-primary'
                    placeholder='0'
                  />
                </div>
              ))}
            </div>

            {/* Personnel Selection */}
            <div className='space-y-3'>
              <label className='text-xs font-bold uppercase text-muted-foreground flex items-center gap-2'>
                <Users className='w-3 h-3' /> Personnel
              </label>
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
                        onClick={() =>
                          setActiveEmployees((p) => (isSelected ? p.filter((x) => x !== emp.id) : [...p, emp.id]))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isSelected ? 'bg-primary text-primary-foreground neon-glow' : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'}`}
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
            </div>

            {/* Optional Details */}
            <div className='space-y-4 pt-4 border-t border-white/5'>
              <h2 className='text-xs font-bold uppercase text-muted-foreground flex items-center gap-2'>
                <FileText className='w-3 h-3' /> Batch Note
              </h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder='Add any operational notes, repair details, or anomalies here...'
                className='w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:border-primary transition-colors outline-none resize-none h-24'
              />
            </div>

            <div className='space-y-4 pt-4 border-t border-white/5'>
              <h2 className='text-xs font-bold uppercase text-muted-foreground flex items-center gap-2'>
                <Settings className='w-3 h-3' /> Advanced Options (Repairs & Bonuses)
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
                      Prevents negative payouts when production is zero or below minimum thresholds.
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
              <div className='glass-card rounded-2xl p-5 space-y-4 border border-white/10 mt-4'>
                <label className='flex items-center gap-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={useLatestAdmin}
                    onChange={(e) => setUseLatestAdmin(e.target.checked)}
                    className='w-5 h-5 rounded border-white/20 text-primary focus:ring-primary focus:ring-offset-gray-900 bg-white/5'
                  />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Use Latest Admin Data</p>
                    <p className='text-[10px] text-muted-foreground'>
                      Recalculates payout using today&#39;s Metal Prices, Employee Weights, and Commission Rates.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className='pt-6'>
            <Button
              onClick={handleUpdate}
              disabled={!preview}
              className='w-full h-14 rounded-2xl neon-glow text-lg font-bold gap-2'
            >
              <Save className='w-5 h-5' /> Save Changes
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant='ghost'
              className='w-full mt-2 text-muted-foreground'
            >
              Discard Edits
            </Button>
          </div>
        </div>
      ) : (
        <div className='animate-in fade-in slide-in-from-right-4 duration-300 space-y-6'>
          <div className='glass-card rounded-3xl p-6 space-y-6'>
            <div>
              <h2 className='text-3xl font-black text-white tracking-tighter'>
                {format(new Date(originalRecord.date), 'MMMM do, yyyy')}
              </h2>
              <div className='flex items-center gap-2 mt-2'>
                <span className='text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-primary/20'>
                  Batch ID: {originalRecord.id.split('-')[0]}
                </span>
                <div className='flex items-center gap-1 opacity-40'>
                  <Clock className='w-3 h-3' />
                  <span className='text-[8px] uppercase font-bold'>
                    {format(new Date(originalRecord.created_at), 'p')}
                  </span>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-white/5 p-4 rounded-2xl border border-white/5'>
                <p className='text-[10px] uppercase font-black text-muted-foreground mb-1'>Total Production</p>
                <p className='text-2xl font-black text-white'>
                  {formatNumber(originalRecord.total_units, 0)}{' '}
                  <span className='text-sm font-normal text-muted-foreground'>Units</span>
                </p>
              </div>
              <div className='bg-white/5 p-4 rounded-2xl border border-white/5'>
                <p className='text-[10px] uppercase font-black text-muted-foreground mb-1'>Market Avg Price</p>
                <p className='text-2xl font-black text-primary'>{formatNumber(originalRecord.snapshot_avg_price)}</p>
              </div>
            </div>

            {(originalRecord.idle_employee_count || 0) > 0 && (
              <div className='bg-white/5 p-4 rounded-2xl border border-white/5'>
                <p className='text-[10px] uppercase font-black text-muted-foreground mb-1'>Idle Employees</p>
                <p className='text-xl font-black text-amber-400'>{originalRecord.idle_employee_count}</p>
              </div>
            )}

            {originalRecord.note && (
              <div className='bg-white/5 p-4 rounded-2xl border border-white/5'>
                <p className='text-[10px] uppercase font-black text-muted-foreground mb-1'>Batch Note</p>
                <p className='text-sm text-white/80'>{originalRecord.note}</p>
              </div>
            )}

            {/* Drill down Drill Down Section */}
            <div className='space-y-3'>
              <h3 className='text-xs font-black uppercase tracking-[0.2em] text-muted-foreground'>
                Detailed Production
              </h3>
              <div className='grid gap-2'>
                {originalRecord.production_details.map((p) => {
                  const name = metals.find((m) => m.id === p.metal_id)?.name || 'Unknown Metal';
                  return (
                    <div
                      key={p.metal_id}
                      className='flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5'
                    >
                      <span className='text-sm font-bold'>{name}</span>
                      <span className='font-mono text-sm'>
                        {formatNumber(p.units, 0)} <span className='text-[10px] opacity-50'>UNITS</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='space-y-4 pt-4 border-t border-white/10'>
              <h3 className='text-xs font-black uppercase tracking-[0.2em] text-muted-foreground'>
                Employee Earnings Breakdown
              </h3>
              <div className='space-y-2'>
                {originalRecord.employees.map((pe) => {
                  const empName =
                    employees.find((e) => e.id === pe.employee_id)?.name || `Worker ${pe.employee_id.split('-')[0]}`;
                  return (
                    <div
                      key={pe.employee_id}
                      className='flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black'>
                          {empName.charAt(0)}
                        </div>
                        <span className='text-sm font-black'>{empName}</span>
                      </div>
                      <div className='text-right'>
                        <p className='text-lg font-black text-primary'>{formatNumber(pe.commission_earned)}</p>
                        <p className='text-[9px] text-muted-foreground font-bold uppercase'>
                          Weight: {pe.snapshot_weight}
                        </p>
                        {(pe.base_commission || 0) > 0 || (pe.bonus_amount || 0) > 0 ? (
                          <div className='text-[9px] text-muted-foreground mt-1 flex gap-2 justify-end'>
                            <span>Base: {formatNumber(pe.base_commission || 0)}</span>
                            {pe.bonus_amount ? (
                              <span className='text-primary'>Bonus: +{formatNumber(pe.bonus_amount)}</span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
