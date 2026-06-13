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

  const profiles = users.data ?? [];
  return {
    totalUsers: users.count ?? profiles.length,
    activeUsers: profiles.filter(p => !p.is_disabled).length,
    totalLoads: loads.count ?? 0,
    totalInvoices: invoices.count ?? 0,
  };
}

export async function fetchAdminUsers() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_disabled, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

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
