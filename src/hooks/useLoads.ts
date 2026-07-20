import { useState, useCallback, useEffect } from 'react';
import type { Load } from '../types';
import { supabase } from '../lib/supabase';
import { rowToLoad, loadToRow } from '../lib/db-mappers';
import { useAuth } from '../contexts/AuthContext';

// Session key — sessionStorage clears automatically when tab/browser is closed
const SESSION_LOADS_KEY = 'ltc_session_load_ids';

function getSessionLoadIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_LOADS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function addLoadIdToSession(id: string) {
  try {
    const ids = getSessionLoadIds();
    ids.add(id);
    sessionStorage.setItem(SESSION_LOADS_KEY, JSON.stringify([...ids]));
  } catch {
    // sessionStorage not available (private mode edge case) — fail silently
  }
}

function removeLoadIdFromSession(id: string) {
  try {
    const ids = getSessionLoadIds();
    ids.delete(id);
    sessionStorage.setItem(SESSION_LOADS_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

export function useLoads() {
  const { user, refreshProfile } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoads = useCallback(async () => {
    if (!user) {
      setLoads([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    // Only fetch loads that belong to this browser session
    const sessionIds = getSessionLoadIds();

    if (sessionIds.size === 0) {
      // Fresh session — show empty dashboard, no loads from previous sessions
      setLoads([]);
      setLoading(false);
      return;
    }

    // Session has loads — fetch only those specific loads from Supabase
    const { data, error } = await supabase
      .from('loads')
      .select('*')
      .eq('user_id', user.id)
      .in('id', [...sessionIds])
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

    // Track this load in the current session
    addLoadIdToSession(saved.id);
    setLoads(prev => [...prev, saved]);

    // Increment counter atomically — single UPDATE avoids TOCTOU race condition
    // when multiple tabs upload simultaneously
    try {
      const counterField = source === 'manual' ? 'manual_loads_used' : 'file_uploads_used';
      await supabase.rpc('increment_profile_counter', {
        p_user_id: user.id,
        p_field: counterField,
      }).throwOnError();
      // Refresh profile so dashboard shows updated remaining count
      await refreshProfile();
    } catch {
      // Counter increment failed — non-fatal, load was already saved
    }

    return saved;
  }, [user, refreshProfile]);

  const removeLoad = useCallback(async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('loads').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw new Error(error.message);
    removeLoadIdFromSession(id);
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
    // Also clear session tracking
    try { sessionStorage.removeItem(SESSION_LOADS_KEY); } catch { /* ignore */ }
    setLoads([]);
  }, [user]);

  return { loads, loading, addLoad, removeLoad, updateLoad, clearLoads, refreshLoads: fetchLoads };
}

