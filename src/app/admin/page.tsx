'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { ShieldCheck, Trash2, Plus, Edit2, Clock } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CommissionRate, Employee, Metal } from '@/lib/types';
import packageJson from '../../../package.json';

type Tab = 'metals' | 'employees' | 'rates';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('metals');
  const {
    metals,
    addMetal,
    updateMetal,
    removeMetal,
    employees,
    addEmployee,
    updateEmployee,
    removeEmployee,
    rates,
    addRate,
    updateRate,
    removeRate,
  } = useStore();

  return (
    <div className='p-6 space-y-6 pb-24'>
      <header className='flex items-center gap-3'>
        <div className='p-3 bg-primary/10 rounded-2xl flex items-center justify-center'>
          <ShieldCheck className='w-6 h-6 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>Admin Console</h1>
          <p className='text-xs font-mono text-primary/60 mt-0.5'>v{packageJson.version}</p>
        </div>
      </header>

      {/* Tabs */}
      <div className='flex bg-white/5 p-1 rounded-2xl border border-white/5'>
        {(['metals', 'employees', 'rates'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all',
              activeTab === tab
                ? 'bg-primary text-primary-foreground shadow-lg neon-glow'
                : 'text-muted-foreground hover:text-white',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className='space-y-6'>
        {activeTab === 'metals' && (
          <MetalsManager
            metals={metals}
            onAdd={addMetal}
            onUpdate={updateMetal}
            onRemove={removeMetal}
          />
        )}
        {activeTab === 'employees' && (
          <EmployeesManager
            employees={employees}
            onAdd={addEmployee}
            onUpdate={updateEmployee}
            onRemove={removeEmployee}
          />
        )}
        {activeTab === 'rates' && (
          <RatesManager
            rates={rates}
            onAdd={addRate}
            onUpdate={updateRate}
            onRemove={removeRate}
          />
        )}
      </div>
    </div>
  );
}

function MetalsManager({
  metals,
  onAdd,
  onUpdate,
  onRemove,
}: {
  metals: Metal[];
  onAdd: (metal: Metal) => void;
  onUpdate: (metal: Partial<Metal> & { id: string }) => void;
  onRemove: (id: string) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSave = () => {
    if (!name || !price) return;
    if (editId) {
      onUpdate({ id: editId, name, current_price: parseFloat(price) });
      setEditId(null);
    } else {
      onAdd({ id: crypto.randomUUID(), name, current_price: parseFloat(price) } as Metal);
    }
    setName('');
    setPrice('');
  };

  const startEdit = (m: Metal) => {
    setEditId(m.id);
    setName(m.name);
    setPrice(m.current_price.toString());
  };

  return (
    <div className='space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400'>
      <div className='glass-card rounded-2xl p-5 space-y-4 border-primary/20'>
        <h3 className='text-xs font-black uppercase tracking-widest flex items-center gap-2'>
          {editId ? <Edit2 className='w-3 h-3 text-primary' /> : <Plus className='w-3 h-3 text-primary' />}
          {editId ? 'Edit Metal' : 'Add Metal Type'}
        </h3>
        <div className='grid grid-cols-2 gap-3'>
          <Input
            label='Metal Name'
            value={name}
            onChange={setName}
          />
          <Input
            label='Price (per unit)'
            value={price}
            onChange={setPrice}
            type='number'
          />
        </div>
        <div className='flex gap-2'>
          {editId && (
            <Button
              variant='ghost'
              className='flex-1 rounded-xl h-11'
              onClick={() => {
                setEditId(null);
                setName('');
                setPrice('');
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            className='flex-2 rounded-xl h-11 neon-glow'
          >
            {editId ? 'Update Metal' : 'Create Metal'}
          </Button>
        </div>
      </div>

      <div className='space-y-3'>
        {metals.map((m) => (
          <div
            key={m.id}
            className='glass-card rounded-2xl p-4 flex justify-between items-start bg-white/5 border-white/5 hover:border-white/10 transition-colors'
          >
            <div className='space-y-1'>
              <p className='font-bold text-sm tracking-tight'>{m.name}</p>
              <p className='text-lg font-black text-primary'>{formatNumber(m.current_price || 0)}</p>
              <div className='flex items-center gap-3 pt-1'>
                <Timestamp
                  label='Created'
                  date={m.created_at}
                />
                <Timestamp
                  label='Updated'
                  date={m.updated_at}
                />
              </div>
            </div>
            <div className='flex gap-1'>
              <button
                onClick={() => startEdit(m)}
                className='p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-colors'
              >
                <Edit2 className='w-4 h-4' />
              </button>
              <button
                onClick={() => onRemove(m.id)}
                className='p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeesManager({
  employees,
  onAdd,
  onUpdate,
  onRemove,
}: {
  employees: Employee[];
  onAdd: (e: Employee) => void;
  onUpdate: (e: Partial<Employee> & { id: string }) => void;
  onRemove: (id: string) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [weight, setWeight] = useState('1.0');
  const [isPermanent, setIsPermanent] = useState(true);

  const handleSave = () => {
    if (!name || !weight) return;
    if (editId) {
      onUpdate({ id: editId, name, current_weight: parseFloat(weight), is_permanent: isPermanent });
      setEditId(null);
    } else {
      onAdd({
        id: crypto.randomUUID(),
        name,
        current_weight: parseFloat(weight),
        is_permanent: isPermanent,
      } as Employee);
    }
    setName('');
    setWeight('1.0');
    setIsPermanent(true);
  };

  const startEdit = (e: Employee) => {
    setEditId(e.id);
    setName(e.name);
    setWeight(e.current_weight.toString());
    setIsPermanent(e.is_permanent ?? true);
  };

  return (
    <div className='space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400'>
      <div className='glass-card rounded-2xl p-5 space-y-4 border-primary/20'>
        <h3 className='text-xs font-black uppercase tracking-widest flex items-center gap-2'>
          {editId ? <Edit2 className='w-3 h-3 text-primary' /> : <Plus className='w-3 h-3 text-primary' />}
          {editId ? 'Edit Personnel' : 'Onboard Employee'}
        </h3>
        <div className='grid grid-cols-2 gap-3'>
          <Input
            label='Full Name'
            value={name}
            onChange={setName}
          />
          <Input
            label='Weight (W)'
            value={weight}
            onChange={setWeight}
            type='number'
          />
          <div className='space-y-1 col-span-2'>
            <label className='text-[10px] uppercase font-bold text-muted-foreground px-1'>Employee Type</label>
            <div className='flex gap-2'>
              <button
                onClick={() => setIsPermanent(true)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${isPermanent ? 'bg-primary border-primary text-primary-foreground neon-glow' : 'bg-white/5 border-white/10 text-muted-foreground'}`}
              >
                Permanent
              </button>
              <button
                onClick={() => setIsPermanent(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors ${!isPermanent ? 'bg-primary border-primary text-primary-foreground neon-glow' : 'bg-white/5 border-white/10 text-muted-foreground'}`}
              >
                Part-Time
              </button>
            </div>
          </div>
        </div>
        <div className='flex gap-2'>
          {editId && (
            <Button
              variant='ghost'
              className='flex-1 rounded-xl h-11'
              onClick={() => {
                setEditId(null);
                setName('');
                setWeight('1.0');
                setIsPermanent(true);
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            className='flex-2 rounded-xl h-11 neon-glow'
          >
            {editId ? 'Update Data' : 'Add Personnel'}
          </Button>
        </div>
      </div>

      <div className='space-y-3'>
        {employees.map((e) => (
          <div
            key={e.id}
            className='glass-card rounded-2xl p-4 flex justify-between items-start bg-white/5 border-white/5 hover:border-white/10 transition-colors'
          >
            <div className='space-y-1'>
              <p className='font-bold text-sm tracking-tight'>
                {e.name}
                <span className='ml-2 text-[8px] uppercase tracking-wider bg-white/10 text-muted-foreground px-2 py-0.5 rounded-md'>
                  {(e.is_permanent ?? true) ? 'permanent' : 'part-time'}
                </span>
              </p>
              <p className='text-lg font-black text-amber-400'>Factor: {e.current_weight}</p>
              <div className='flex items-center gap-3 pt-1'>
                <Timestamp
                  label='Joined'
                  date={e.created_at}
                />
                <Timestamp
                  label='Updated'
                  date={e.updated_at}
                />
              </div>
            </div>
            <div className='flex gap-1'>
              <button
                onClick={() => startEdit(e)}
                className='p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-colors'
              >
                <Edit2 className='w-4 h-4' />
              </button>
              <button
                onClick={() => onRemove(e.id)}
                className='p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RatesManager({
  rates,
  onAdd,
  onUpdate,
  onRemove,
}: {
  rates: CommissionRate[];
  onAdd: (r: CommissionRate) => void;
  onUpdate: (r: Partial<CommissionRate> & { id: string }) => void;
  onRemove: (id: string) => void;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [percent, setPercent] = useState('');

  const handleSave = () => {
    if (!min || !max || !percent) return;
    const payload = {
      min_units: parseFloat(min),
      max_units: parseFloat(max),
      rate_percent: parseFloat(percent),
    };
    if (editId) {
      onUpdate({ ...payload, id: editId });
      setEditId(null);
    } else {
      onAdd({ id: crypto.randomUUID(), ...payload } as CommissionRate);
    }
    setMin('');
    setMax('');
    setPercent('');
  };

  return (
    <div className='space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400'>
      <div className='glass-card rounded-2xl p-5 space-y-4 border-primary/20'>
        <h3 className='text-xs font-black uppercase tracking-widest flex items-center gap-2'>
          {editId ? <Edit2 className='w-3 h-3 text-primary' /> : <Plus className='w-3 h-3 text-primary' />}
          Commission Tiers
        </h3>
        <div className='grid grid-cols-3 gap-2'>
          <Input
            label='Min U'
            value={min}
            onChange={setMin}
            type='number'
          />
          <Input
            label='Max U'
            value={max}
            onChange={setMax}
            type='number'
          />
          <Input
            label='Rate %'
            value={percent}
            onChange={setPercent}
            type='number'
          />
        </div>
        <div className='flex gap-2'>
          {editId && (
            <Button
              variant='ghost'
              className='flex-1 rounded-xl h-11'
              onClick={() => {
                setEditId(null);
                setMin('');
                setMax('');
                setPercent('');
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            className='flex-2 rounded-xl h-11 neon-glow'
          >
            Save Tier
          </Button>
        </div>
      </div>

      <div className='space-y-3'>
        {rates
          .sort((a, b) => a.min_units - b.min_units)
          .map((r) => (
            <div
              key={r.id}
              className='glass-card rounded-2xl p-4 space-y-3 bg-white/5 border-white/5'
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='bg-primary/20 border border-primary/30 rounded-lg px-3 py-1 font-black text-primary text-xs'>
                    {r.rate_percent}%
                  </div>
                  <div className='text-xs'>
                    <span className='text-muted-foreground mr-1'>Band:</span>
                    <span className='font-bold'>
                      {formatNumber(r.min_units)} - {formatNumber(r.max_units)} Units
                    </span>
                  </div>
                </div>
                <div className='flex gap-1'>
                  <button
                    onClick={() => {
                      setEditId(r.id);
                      setMin(r.min_units.toString());
                      setMax(r.max_units.toString());
                      setPercent(r.rate_percent.toString());
                    }}
                    className='p-1.5 text-muted-foreground hover:text-primary transition-colors'
                  >
                    <Edit2 className='w-3 h-3' />
                  </button>
                  <button
                    onClick={() => onRemove(r.id)}
                    className='p-1.5 text-muted-foreground hover:text-rose-500 transition-colors'
                  >
                    <Trash2 className='w-3 h-3' />
                  </button>
                </div>
              </div>
              <div className='flex items-center gap-3 pt-1 border-t border-white/5'>
                <Timestamp
                  label='Active Since'
                  date={r.created_at}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className='space-y-1'>
      <label className='text-[10px] uppercase font-bold text-muted-foreground px-1'>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 transition-colors outline-none'
      />
    </div>
  );
}

function Timestamp({ label, date }: { label: string; date: string }) {
  if (!date) return null;
  return (
    <div className='flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity'>
      <Clock className='w-2.5 h-2.5' />
      <span className='text-[8px] uppercase font-bold'>
        {label}: {format(new Date(date), 'MMM d, HH:mm')}
      </span>
    </div>
  );
}
