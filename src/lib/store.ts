import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { DailyRecord, Metal, Employee, CommissionRate } from './types';

// Custom IDB storage engine for Zustand
const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface AppState {
  metals: Metal[];
  employees: Employee[];
  rates: CommissionRate[];
  records: DailyRecord[];

  // Actions
  addMetal: (metal: Omit<Metal, 'created_at' | 'updated_at'>) => void;
  updateMetal: (metal: Partial<Metal> & { id: string }) => void;
  removeMetal: (id: string) => void;

  addEmployee: (emp: Omit<Employee, 'created_at' | 'updated_at'>) => void;
  updateEmployee: (emp: Partial<Employee> & { id: string }) => void;
  removeEmployee: (id: string) => void;

  addRate: (rate: Omit<CommissionRate, 'created_at' | 'updated_at'>) => void;
  updateRate: (rate: Partial<CommissionRate> & { id: string }) => void;
  removeRate: (id: string) => void;

  addRecord: (record: Omit<DailyRecord, 'created_at'>) => void;
  updateRecord: (record: Partial<DailyRecord> & { id: string }) => void;
  removeRecord: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      metals: [],
      employees: [],
      rates: [],
      records: [],

      addMetal: (metal) =>
        set((state) => ({
          metals: [
            ...state.metals,
            { ...metal, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Metal,
          ],
        })),
      updateMetal: (metal) =>
        set((state) => ({
          metals: state.metals.map((m) =>
            m.id === metal.id ? { ...m, ...metal, updated_at: new Date().toISOString() } : m,
          ),
        })),
      removeMetal: (id) =>
        set((state) => ({
          metals: state.metals.filter((m) => m.id !== id),
        })),

      addEmployee: (emp) =>
        set((state) => ({
          employees: [
            ...state.employees,
            { type: 'permanent', ...emp, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Employee,
          ],
        })),
      updateEmployee: (emp) =>
        set((state) => ({
          employees: state.employees.map((e) =>
            e.id === emp.id ? { ...e, ...emp, updated_at: new Date().toISOString() } : e,
          ),
        })),
      removeEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
        })),

      addRate: (rate) =>
        set((state) => ({
          rates: [
            ...state.rates,
            { ...rate, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as CommissionRate,
          ],
        })),
      updateRate: (rate) =>
        set((state) => ({
          rates: state.rates.map((r) =>
            r.id === rate.id ? { ...r, ...rate, updated_at: new Date().toISOString() } : r,
          ),
        })),
      removeRate: (id) =>
        set((state) => ({
          rates: state.rates.filter((r) => r.id !== id),
        })),

      addRecord: (record) =>
        set((state) => ({
          records: [{ ...record, created_at: new Date().toISOString() } as DailyRecord, ...state.records],
        })),
      updateRecord: (record) =>
        set((state) => ({
          records: state.records.map((r) => (r.id === record.id ? { ...r, ...record } : r)),
        })),
      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),
    }),

    {
      name: 'metal-crusher-storage',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storage: createJSONStorage(() => idbStorage as any),
    },
  ),
);
