import { supabase } from './supabase';
import type { Load, CompanySettings, CarrierSettings } from '../types';
import { calcTotals } from './calc';

export async function saveInvoice(
  userId: string,
  loads: Load[],
  company: CompanySettings,
  carrier: CarrierSettings,
  invoiceNumber: string,
  invoiceDate: string,
  weekLabel: string
) {
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, company.dispatchPercentage);

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      week_label: weekLabel,
      dispatch_percentage: company.dispatchPercentage,
      total_gross_revenue: totalGrossRevenue,
      dispatch_fee: dispatchFee,
      company_snapshot: company,
      carrier_snapshot: carrier,
      carrier_name: carrier.carrierName || '',
      status: 'unpaid',
      payment_method: company.cashApp ? 'Cash App' : company.zelle ? 'Zelle' : company.payoneer ? 'Payoneer' : company.bankInformation ? 'Bank Transfer' : 'Other',
    })
    .select()
    .single();

  if (error || !invoice) throw new Error(error?.message ?? 'Failed to save invoice');

  if (loads.length > 0) {
    const rows = loads.map(l => ({
      invoice_id: invoice.id,
      load_number: l.loadNumber,
      broker_name: l.brokerName,
      pickup_date: l.pickupDate,
      gross_amount: l.grossAmount,
      origin_city: l.originCity,
      origin_state: l.originState,
      destination_city: l.destinationCity,
      destination_state: l.destinationState,
    }));
    const { error: loadsError } = await supabase.from('invoice_loads').insert(rows);
    if (loadsError) throw new Error(loadsError.message);
  }

  return invoice;
}

export async function fetchAdminStats() {
  const [users, loads, invoices] = await Promise.all([
    supabase.from('profiles').select('id, is_disabled', { count: 'exact', head: false }),
    supabase.from('loads').select('id', { count: 'exact', head: true }),
    supabase.from('invoices').select('id', { count: 'exact', head: true }),
  ]);

  // Try to get pending count (may fail if migration not run)
  let pendingCount = 0;
  try {
    const pending = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending');
    pendingCount = pending.count ?? 0;
  } catch {
    // status column doesn't exist yet
  }

  const profiles = users.data ?? [];
  return {
    totalUsers: users.count ?? profiles.length,
    activeUsers: profiles.filter(p => !p.is_disabled).length,
    totalLoads: loads.count ?? 0,
    totalInvoices: invoices.count ?? 0,
    pendingApprovals: pendingCount,
  };
}

export async function fetchAdminUsers() {
  // Try with new columns first
  let profiles: any[] | null = null;
  let error: any = null;

  const fullQuery = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_disabled, status, monthly_upload_limit, uploads_used, manual_load_limit, file_upload_limit, manual_loads_used, file_uploads_used, approved_at, created_at')
    .order('created_at', { ascending: false });

  if (fullQuery.error) {
    // Fallback: new columns don't exist yet
    const basicQuery = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_disabled, created_at')
      .order('created_at', { ascending: false });
    
    if (basicQuery.error) throw new Error(basicQuery.error.message);
    profiles = (basicQuery.data ?? []).map(u => ({
      ...u,
      status: 'approved',
      monthly_upload_limit: 50,
      uploads_used: 0,
      manual_load_limit: 2,
      file_upload_limit: 2,
      manual_loads_used: 0,
      file_uploads_used: 0,
      approved_at: null,
    }));
  } else {
    profiles = fullQuery.data ?? [];
  }

  const users = profiles ?? [];
  const enriched = await Promise.all(
    users.map(async u => {
      const [loadsRes, invRes] = await Promise.all([
        supabase.from('loads').select('id', { count: 'exact', head: true }).eq('user_id', u.id),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('user_id', u.id),
      ]);
      return {
        ...u,
        loadCount: loadsRes.count ?? 0,
        invoiceCount: invRes.count ?? 0,
      };
    })
  );
  return enriched;
}

export async function setUserDisabled(userId: string, disabled: boolean) {
  const { error } = await supabase.from('profiles').update({ is_disabled: disabled, updated_at: new Date().toISOString() }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function approveUser(userId: string, adminId: string) {
  const { error } = await supabase.from('profiles').update({
    status: 'approved',
    approved_at: new Date().toISOString(),
    approved_by: adminId,
    updated_at: new Date().toISOString(),
  }).eq('id', userId);
  if (error) throw new Error(error.message.includes('column') ? 'Run the database migration first (003_approval_quota.sql)' : error.message);
}

export async function suspendUser(userId: string) {
  const { error } = await supabase.from('profiles').update({
    status: 'suspended',
    updated_at: new Date().toISOString(),
  }).eq('id', userId);
  if (error) throw new Error(error.message.includes('column') ? 'Run the database migration first (003_approval_quota.sql)' : error.message);
}

export async function updateUserLimit(userId: string, limit: number) {
  const { error } = await supabase.from('profiles').update({
    monthly_upload_limit: limit,
    updated_at: new Date().toISOString(),
  }).eq('id', userId);
  if (error) throw new Error(error.message.includes('column') ? 'Run the database migration first (003_approval_quota.sql)' : error.message);
}



/** Permanently delete a user -- cannot login again, must create new account */
export async function deleteUser(userId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  const apiBase = import.meta.env.VITE_API_URL || '';
  const res = await fetch(${apiBase}/api/admin/delete-user/, {
    method: 'DELETE',
    headers: { 'Authorization': Bearer  },
  });
  const json = await res.json().catch(() => ({ success: false, error: 'Server error' }));
  if (!json.success) throw new Error(json.error || 'Failed to delete user');
}
export async function updateUserManualLimit(userId: string, limit: number) {
  const { error } = await supabase.from('profiles').update({
    manual_load_limit: limit,
    updated_at: new Date().toISOString(),
  }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function updateUserFileLimit(userId: string, limit: number) {
  const { error } = await supabase.from('profiles').update({
    file_upload_limit: limit,
    updated_at: new Date().toISOString(),
  }).eq('id', userId);
  if (error) throw new Error(error.message);
}

export async function fetchAdminNotifications(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) return []; // table doesn't exist yet
    return data ?? [];
  } catch {
    return []; // table doesn't exist yet
  }
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase.from('admin_notifications').update({ is_read: true }).eq('id', notificationId);
  if (error) throw new Error(error.message);
}

export async function fetchUserInvoices(userId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, invoice_loads(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function toggleInvoiceStatus(invoiceId: string, newStatus: 'paid' | 'unpaid') {
  const { error } = await supabase
    .from('invoices')
    .update({ status: newStatus })
    .eq('id', invoiceId);
  if (error) throw new Error(error.message);
}

export async function deleteInvoice(invoiceId: string) {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);
  if (error) throw new Error(error.message);
}

export async function fetchCarrierHistory(userId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      invoice_date,
      week_label,
      dispatch_percentage,
      total_gross_revenue,
      dispatch_fee,
      status,
      carrier_name,
      payment_method,
      carrier_snapshot,
      company_snapshot,
      created_at,
      invoice_loads(id, load_number, broker_name, pickup_date, gross_amount, origin_city, origin_state, destination_city, destination_state)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
