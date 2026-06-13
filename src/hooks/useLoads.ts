import { useState, useCallback, useEffect } from 'react';
import type { Load } from '../types';
import { supabase } from '../lib/supabase';
import { rowToLoad, loadToRow } from '../lib/db-mappers';
import { useAuth } from '../contexts/AuthContext';

export function useLoads() {
  const { user } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoads = useCallback(async () => {
    if (!user) {
      setLoads([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setLoads(data.map(rowToLoad));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLoads();
  }, [fetchLoads]);

  const addLoad = useCallback(async (load: Load, source: 'extract' | 'manual' = 'extract') => {
    if (!user) return;
    const row = loadToRow(load, user.id, source);
    const { data, error } = await supabase.from('loads').insert(row).select().single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to save load');
    const saved = rowToLoad(data);
    setLoads(prev => [...prev, saved]);
    return saved;
  }, [user]);

  const removeLoad = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('loads').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw new Error(error.message);
    setLoads(prev => prev.filter(l => l.id !== id));
  }, [user]);

  const updateLoad = useCallback(async (id: string, updates: Partial<Load>) => {
    if (!user) return;
    const patch: Record<string, unknown> = {};
    if (updates.loadNumber !== undefined) patch.load_number = updates.loadNumber;
    if (updates.brokerName !== undefined) patch.broker_name = updates.brokerName;
    if (updates.pickupDate !== undefined) patch.pickup_date = updates.pickupDate;
    if (updates.grossAmount !== undefined) patch.gross_amount = updates.grossAmount;
    if (updates.originCity !== undefined) patch.origin_city = updates.originCity;
    if (updates.originState !== undefined) patch.origin_state = updates.originState;
    if (updates.destinationCity !== undefined) patch.destination_city = updates.destinationCity;
    if (updates.destinationState !== undefined) patch.destination_state = updates.destinationState;
    const { data, error } = await supabase.from('loads').update(patch).eq('id', id).eq('user_id', user.id).select().single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to update load');
    const updated = rowToLoad(data);
    setLoads(prev => prev.map(l => (l.id === id ? updated : l)));
  }, [user]);

  const clearLoads = useCallback(async () => {
    if (!user) return;
    const { error } = await supabase.from('loads').delete().eq('user_id', user.id);
    if (error) throw new Error(error.message);
    setLoads([]);
  }, [user]);

  return { loads, loading, addLoad, removeLoad, updateLoad, clearLoads, refreshLoads: fetchLoads };
}
