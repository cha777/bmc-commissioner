'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export function useSupabaseSync() {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);

  const { sync_queue, removeSyncTask, setStoreData } = useStore();
  const supabase = createClient();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processQueue = useCallback(async () => {
    if (!isOnline || sync_queue.length === 0 || isSyncing) return;
    setIsSyncing(true);

    for (const task of sync_queue) {
      const { id, action, table, data } = task;
      let error = null;

      try {
        const payload = data as { id?: string; [key: string]: unknown };

        if (action === 'INSERT') {
          const { error: err } = await supabase.from(table).insert([payload]);
          error = err;
        } else if (action === 'UPDATE') {
          const { error: err } = await supabase
            .from(table)
            .update(payload)
            .eq('id', payload.id as string);
          error = err;
        } else if (action === 'DELETE') {
          const { error: err } = await supabase
            .from(table)
            .delete()
            .eq('id', payload.id as string);
          error = err;
        }

        if (!error) {
          removeSyncTask(id);
        } else {
          console.error(`Sync error for task ${id}:`, error.message);
          // Stop processing if we hit an error (e.g., auth error) to preserve order
          break;
        }
      } catch (err) {
        console.error('Fatal sync exception:', err);
        break;
      }
    }

    setIsSyncing(false);
  }, [isOnline, sync_queue, isSyncing, removeSyncTask, supabase]);

  // Trigger queue processing when online or when queue changes
  useEffect(() => {
    if (isOnline && sync_queue.length > 0 && !isSyncing) {
      setTimeout(() => {
        void processQueue();
      }, 0);
    }
  }, [isOnline, sync_queue.length, processQueue, isSyncing]);

  // Initial pull from server
  const fetchRemoteData = useCallback(async () => {
    if (!isOnline) return;

    try {
      const [metalsRes, employeesRes, ratesRes, recordsRes] = await Promise.all([
        supabase.from('metals').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('rates').select('*'),
        supabase.from('daily_records').select('*').order('created_at', { ascending: false }),
      ]);

      if (metalsRes.data && employeesRes.data && ratesRes.data && recordsRes.data) {
        // Only overwrite local state if the local sync queue is empty to avoid overwriting pending edits
        if (useStore.getState().sync_queue.length === 0) {
          setStoreData({
            metals: metalsRes.data,
            employees: employeesRes.data,
            rates: ratesRes.data,
            records: recordsRes.data,
          });
        }
      }
    } catch (e) {
      console.error('Error fetching remote data', e);
    }
  }, [isOnline, setStoreData, supabase]);

  // Fetch data on mount if online
  useEffect(() => {
    fetchRemoteData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isOnline, isSyncing, pendingTasks: sync_queue.length };
}
