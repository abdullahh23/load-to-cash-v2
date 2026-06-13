import type { ExtractionResponse } from '../../shared/schema';
import { supabase } from './supabase';

export async function extractRateConfirmation(file: File): Promise<ExtractionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch('/api/extract', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Server error' }));
    return { success: false, error: body.error || `HTTP ${res.status}` };
  }

  return res.json();
}
