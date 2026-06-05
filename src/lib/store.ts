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

export type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE';
export type SyncTable = 'metals' | 'employees' | 'rates' | 'daily_records';

export interface SyncTask {
  id: string;
  action: SyncAction;
  table: SyncTable;
  data: unknown;
  created_at: string;
}

interface AppState {
  metals: Metal[];
  employees: Employee[];
  rates: CommissionRate[];
  records: DailyRecord[];
  sync_queue: SyncTask[];

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

  addRecord: (record: Omit<DailyRecord, 'created_at' | 'updated_at'>) => void;
  updateRecord: (record: Partial<DailyRecord> & { id: string }) => void;
  removeRecord: (id: string) => void;

  // Sync specific actions
  removeSyncTask: (taskId: string) => void;
  setStoreData: (data: Partial<AppState>) => void;
}

const createSyncTask = (action: SyncAction, table: SyncTable, data: unknown): SyncTask => ({
  id: crypto.randomUUID(),
  action,
  table,
  data,
  created_at: new Date().toISOString(),
});

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      metals: [],
      employees: [],
      rates: [],
      records: [],
      sync_queue: [],

      addMetal: (metal) =>
        set((state) => {
          const newMetal = {
            ...metal,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Metal;
          return {
            metals: [...state.metals, newMetal],
            sync_queue: [...state.sync_queue, createSyncTask('INSERT', 'metals', newMetal)],
          };
        }),
      updateMetal: (metal) =>
        set((state) => {
          const updated = state.metals.find((m) => m.id === metal.id);
          if (!updated) return state;
          const merged = { ...updated, ...metal, updated_at: new Date().toISOString() };
          return {
            metals: state.metals.map((m) => (m.id === metal.id ? merged : m)),
            sync_queue: [...state.sync_queue, createSyncTask('UPDATE', 'metals', merged)],
          };
        }),
      removeMetal: (id) =>
        set((state) => ({
          metals: state.metals.filter((m) => m.id !== id),
          sync_queue: [...state.sync_queue, createSyncTask('DELETE', 'metals', { id })],
        })),

      addEmployee: (emp) =>
        set((state) => {
          const newEmp = {
            is_permanent: true,
            ...emp,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Employee;
          return {
            employees: [...state.employees, newEmp],
            sync_queue: [...state.sync_queue, createSyncTask('INSERT', 'employees', newEmp)],
          };
        }),
      updateEmployee: (emp) =>
        set((state) => {
          const updated = state.employees.find((e) => e.id === emp.id);
          if (!updated) return state;
          const merged = { ...updated, ...emp, updated_at: new Date().toISOString() };
          return {
            employees: state.employees.map((e) => (e.id === emp.id ? merged : e)),
            sync_queue: [...state.sync_queue, createSyncTask('UPDATE', 'employees', merged)],
          };
        }),
      removeEmployee: (id) =>
        set((state) => ({
          employees: state.employees.filter((e) => e.id !== id),
          sync_queue: [...state.sync_queue, createSyncTask('DELETE', 'employees', { id })],
        })),

      addRate: (rate) =>
        set((state) => {
          const newRate = {
            ...rate,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as CommissionRate;
          return {
            rates: [...state.rates, newRate],
            sync_queue: [...state.sync_queue, createSyncTask('INSERT', 'rates', newRate)],
          };
        }),
      updateRate: (rate) =>
        set((state) => {
          const updated = state.rates.find((r) => r.id === rate.id);
          if (!updated) return state;
          const merged = { ...updated, ...rate, updated_at: new Date().toISOString() };
          return {
            rates: state.rates.map((r) => (r.id === rate.id ? merged : r)),
            sync_queue: [...state.sync_queue, createSyncTask('UPDATE', 'rates', merged)],
          };
        }),
      removeRate: (id) =>
        set((state) => ({
          rates: state.rates.filter((r) => r.id !== id),
          sync_queue: [...state.sync_queue, createSyncTask('DELETE', 'rates', { id })],
        })),

      addRecord: (record) =>
        set((state) => {
          const newRecord = {
            ...record,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as DailyRecord;
          return {
            records: [newRecord, ...state.records],
            sync_queue: [...state.sync_queue, createSyncTask('INSERT', 'daily_records', newRecord)],
          };
        }),
      updateRecord: (record) =>
        set((state) => {
          const updated = state.records.find((r) => r.id === record.id);
          if (!updated) return state;
          const merged = { ...updated, ...record, updated_at: new Date().toISOString() };
          return {
            records: state.records.map((r) => (r.id === record.id ? merged : r)),
            sync_queue: [...state.sync_queue, createSyncTask('UPDATE', 'daily_records', merged)],
          };
        }),
      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
          sync_queue: [...state.sync_queue, createSyncTask('DELETE', 'daily_records', { id })],
        })),

      removeSyncTask: (taskId) =>
        set((state) => ({
          sync_queue: state.sync_queue.filter((t) => t.id !== taskId),
        })),

      setStoreData: (data) =>
        set((state) => ({
          ...state,
          ...data,
        })),
    }),
    {
      name: 'metal-crusher-storage',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storage: createJSONStorage(() => idbStorage as any),
    },
  ),
);
