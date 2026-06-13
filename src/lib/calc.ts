import type { Load } from '../types';

export function calcTotals(loads: Load[], dispatchPercentage: number) {
  const totalGrossRevenue = loads.reduce((sum, l) => sum + (l.grossAmount || 0), 0);
  const dispatchFee = totalGrossRevenue * (dispatchPercentage / 100);
  return { totalGrossRevenue, dispatchFee };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    return `${m}/${d}/${y}`;
  } catch {
    return dateStr;
  }
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 900 + 100);
  return `INV-${y}${m}${d}-${rand}`;
}

export function getCurrentWeekLabel(): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  return `Week of ${fmt(start)} – ${fmt(end)}`;
}
