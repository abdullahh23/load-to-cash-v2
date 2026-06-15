import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(url ?? '', anonKey ?? '');

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  is_disabled: boolean;
  status: 'pending' | 'approved' | 'suspended';
  monthly_upload_limit: number;
  uploads_used: number;
  uploads_reset_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
};
