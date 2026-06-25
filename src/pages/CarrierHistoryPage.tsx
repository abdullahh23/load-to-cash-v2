import { useState, useMemo, Fragment } from 'react';
import { Search, ChevronUp, ChevronDown, Eye, Trash2, ArrowUpDown, TrendingUp, TrendingDown, X, ChevronRight, Truck, FileText, DollarSign, AlertCircle, CheckCircle, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '../lib/calc';
import type { CarrierHistory, Load, CompanySettings, CarrierSettings } from '../types';
import { InvoiceTemplate } from '../templates/InvoiceTemplate';
import { printInvoice } from '../lib/pdf';

interface InvoiceRow {
  id: string;
  invoice_number: string;
  invoice_date: string;
  total_gross_revenue: number;
  dispatch_fee: number;
  dispatch_percentage?: number;
  status: 'paid' | 'unpaid';
  carrier_name: string;
  carrier_snapshot: any;
  created_at: string;
  invoice_loads: Array<{ id: string; load_number: string; broker_name: string; pickup_date: string; gross_amount: number; origin_city: string; origin_state: string; destination_city: string; destination_state: string }>;
}

interface CarrierHistoryPageProps {
  invoices: InvoiceRow[];
  loading: boolean;
  onToggleStatus: (invoiceId: string, newStatus: 'paid' | 'unpaid') => Promise<void>;
  onDelete: (invoiceId: string) => Promise<void>;
  onRefresh: () => void;
}

type SortField = 'created_at' | 'invoice_number' | 'total_gross_revenue' | 'dispatch_fee' | 'carrier_name' | 'status';
type SortDir = 'asc' | 'desc';

export function CarrierHistoryPage({ invoices, loading, onToggleStatus, onDelete, onRefresh }: CarrierHistoryPageProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRow | null>(null);

  // ── Paid Amount Modal state ──
  // Store only the invoiceId string — avoids stale object references
  const [payModalId, setPayModalId] = useState<string | null>(null);
  const [payInput, setPayInput] = useState('');
  // Record<invoiceId, pendingAmount> — so multiple invoices can each have a pending note
  const [pendingNotes, setPendingNotes] = useState<Record<string, number>>({});

  // Find the full invoice object from the invoices prop by ID
  const payModalInvoice = payModalId ? invoices.find(i => i.id === payModalId) ?? null : null;

  const handleStatusClick = (inv: InvoiceRow) => {
    if (inv.status === 'paid') {
      // Already paid — clicking marks it back to unpaid, clear its pending note
      onToggleStatus(inv.id, 'unpaid');
      setPendingNotes(prev => { const n = { ...prev }; delete n[inv.id]; return n; });
    } else {
      // Unpaid — open "how much was paid" modal
      setPayInput('');
      setPayModalId(inv.id);
    }
  };

  const handlePayConfirm = async () => {
    if (!payModalInvoice) return;
    const invoiceId = payModalInvoice.id;
    const invoiceFee = Number(payModalInvoice.dispatch_fee);
    const paid = parseFloat(payInput) || 0;

    // Close modal immediately so UI stays responsive
    setPayModalId(null);

    if (paid > 0 && paid < invoiceFee) {
      // Partial payment — stay unpaid, record pending balance for this invoice only
      const remaining = +(invoiceFee - paid).toFixed(2);
      setPendingNotes(prev => ({ ...prev, [invoiceId]: remaining }));
      // Do NOT call onToggleStatus — invoice stays unpaid
    } else {
      // Full payment OR no amount entered — mark as paid, clear pending note
      setPendingNotes(prev => { const n = { ...prev }; delete n[invoiceId]; return n; });
      await onToggleStatus(invoiceId, 'paid');
    }
  };

  const handlePayCancel = () => setPayModalId(null);

  // Compute carrier stats — includes pendingNotes so partial payments are reflected everywhere
  const carrierStats = useMemo(() => {
    const map = new Map<string, CarrierHistory>();
    for (const inv of invoices) {
      const name = inv.carrier_name || (inv.carrier_snapshot as any)?.carrierName || 'Unknown';
      const existing = map.get(name) || { carrierName: name, totalLoads: 0, totalInvoices: 0, totalGrossAmount: 0, totalDispatchFees: 0, totalPaid: 0, totalUnpaid: 0 };
      existing.totalInvoices += 1;
      existing.totalLoads += inv.invoice_loads?.length || 0;
      existing.totalGrossAmount += Number(inv.total_gross_revenue) || 0;
      existing.totalDispatchFees += Number(inv.dispatch_fee) || 0;

      const fee = Number(inv.dispatch_fee) || 0;
      if (inv.status === 'paid') {
        // Fully paid in DB
        existing.totalPaid += fee;
      } else if (pendingNotes[inv.id] !== undefined) {
        // Partial payment recorded locally:
        // pending amount stays as unpaid, the rest counts as paid
        const pending = pendingNotes[inv.id];
        existing.totalUnpaid += pending;
        existing.totalPaid += +(fee - pending).toFixed(2);
      } else {
        // Fully unpaid
        existing.totalUnpaid += fee;
      }

      map.set(name, existing);
    }
    return Array.from(map.values());
  }, [invoices, pendingNotes]);

  // Get all loads for a specific carrier, ordered by date added
  const carrierLoads = useMemo(() => {
    if (!selectedCarrier) return [];
    const loads: Array<{
      id: string;
      loadNumber: string;
      brokerName: string;
      pickupDate: string;
      grossAmount: number;
      route: string;
      invoiceNumber: string;
      invoiceDate: string;
      status: 'paid' | 'unpaid';
      addedAt: string;
    }> = [];

    for (const inv of invoices) {
      const name = inv.carrier_name || (inv.carrier_snapshot as any)?.carrierName || 'Unknown';
      if (name !== selectedCarrier) continue;
      for (const load of (inv.invoice_loads || [])) {
        loads.push({
          id: load.id,
          loadNumber: load.load_number,
          brokerName: load.broker_name,
          pickupDate: load.pickup_date,
          grossAmount: Number(load.gross_amount),
          route: load.origin_city && load.destination_city
            ? `${load.origin_city}, ${load.origin_state} → ${load.destination_city}, ${load.destination_state}`
            : '—',
          invoiceNumber: inv.invoice_number,
          invoiceDate: inv.invoice_date,
          status: inv.status,
          addedAt: inv.created_at,
        });
      }
    }

    // Sort by date added (newest first)
    loads.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    return loads;
  }, [selectedCarrier, invoices]);

  // Get carrier stats for selected carrier
  const selectedStats = useMemo(() => {
    if (!selectedCarrier) return null;
    return carrierStats.find(c => c.carrierName === selectedCarrier) || null;
  }, [selectedCarrier, carrierStats]);

  // Flatten loads from invoices for the table
  const rows = useMemo(() => {
    return invoices.map(inv => ({
      ...inv,
      displayCarrier: inv.carrier_name || (inv.carrier_snapshot as any)?.carrierName || 'Unknown',
      loadCount: inv.invoice_loads?.length || 0,
    }));
  }, [invoices]);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      r.invoice_number.toLowerCase().includes(q) ||
      r.displayCarrier.toLowerCase().includes(q) ||
      r.status.includes(q)
    );
  }, [rows, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'created_at': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
        case 'invoice_number': cmp = a.invoice_number.localeCompare(b.invoice_number); break;
        case 'total_gross_revenue': cmp = Number(a.total_gross_revenue) - Number(b.total_gross_revenue); break;
        case 'dispatch_fee': cmp = Number(a.dispatch_fee) - Number(b.dispatch_fee); break;
        case 'carrier_name': cmp = a.displayCarrier.localeCompare(b.displayCarrier); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="text-steel/40" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-signal" /> : <ChevronDown size={12} className="text-signal" />;
  };

  const totalPaid = carrierStats.reduce((s, c) => s + c.totalPaid, 0);
  const totalUnpaid = carrierStats.reduce((s, c) => s + c.totalUnpaid, 0);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice? This will update all statistics.')) return;
    await onDelete(id);
    onRefresh();
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-steel">Loading carrier history...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight font-outfit">Carrier History</h1>
        <p className="text-steel text-sm mt-0.5 font-medium">Track invoices, payments, and carrier performance.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-card">
          <div className="text-[10px] font-semibold text-steel uppercase tracking-widest mb-1.5">Total Invoices</div>
          <div className="text-3xl font-bold text-ink">{invoices.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-5 shadow-card">
          <div className="text-[10px] font-semibold text-steel uppercase tracking-widest mb-1.5">Carriers</div>
          <div className="text-3xl font-bold text-ink">{carrierStats.length}</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg p-5 shadow-card">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
            <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Total Paid</div>
          </div>
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1.5">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-lg p-5 shadow-card">
          <div className="flex items-center gap-1.5">
            <TrendingDown size={14} className="text-red-600 dark:text-red-400" />
            <div className="text-[10px] font-semibold text-red-700 dark:text-red-400 uppercase tracking-widest">Total Unpaid</div>
          </div>
          <div className="text-3xl font-bold text-red-700 dark:text-red-400 mt-1.5">{formatCurrency(totalUnpaid)}</div>
        </div>
      </div>

      {/* Carrier Breakdown — Clickable Cards */}
      {carrierStats.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-panel border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-sm font-semibold text-ink mb-4 border-b border-gray-100 dark:border-gray-800 pb-3">
            Carrier Breakdown
            <span className="text-steel font-normal ml-2 text-xs">— click a carrier to view all loads</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {carrierStats.map(c => (
              <button
                key={c.carrierName}
                onClick={() => setSelectedCarrier(selectedCarrier === c.carrierName ? null : c.carrierName)}
                className={`text-left border rounded-lg p-4 transition-all duration-150 cursor-pointer ${
                  selectedCarrier === c.carrierName
                    ? 'border-signal bg-blue-50 dark:bg-blue-950/20 shadow-md ring-2 ring-signal/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-signal/40 dark:hover:border-signal/30 hover:shadow-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-ink text-sm truncate flex items-center gap-2">
                    <Truck size={14} className={selectedCarrier === c.carrierName ? 'text-signal' : 'text-steel'} />
                    {c.carrierName}
                  </div>
                  <ChevronRight size={14} className={`transition-transform duration-200 ${selectedCarrier === c.carrierName ? 'rotate-90 text-signal' : 'text-steel/40'}`} />
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-steel">Invoices:</span><span className="font-medium text-ink">{c.totalInvoices}</span>
                  <span className="text-steel">Loads:</span><span className="font-medium text-ink">{c.totalLoads}</span>
                  <span className="text-steel">Gross:</span><span className="font-medium text-ink">{formatCurrency(c.totalGrossAmount)}</span>
                  <span className="text-steel">Fees:</span><span className="font-medium text-ink">{formatCurrency(c.totalDispatchFees)}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Paid:</span><span className="font-semibold text-emerald-700 dark:text-emerald-400">{formatCurrency(c.totalPaid)}</span>
                  <span className="text-red-500 dark:text-red-400">Unpaid:</span><span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(c.totalUnpaid)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Carrier — All Loads Table */}
      {selectedCarrier && selectedStats && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-panel border-2 border-signal/20 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-signal" />
                <h2 className="text-lg font-bold text-ink">{selectedCarrier}</h2>
              </div>
              <p className="text-steel text-xs mt-1">
                {selectedStats.totalLoads} loads across {selectedStats.totalInvoices} invoices — Gross: {formatCurrency(selectedStats.totalGrossAmount)}
              </p>
            </div>
            <button
              onClick={() => setSelectedCarrier(null)}
              className="p-2 text-steel hover:text-ink dark:hover:text-gray-200 hover:bg-lane dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {carrierLoads.length === 0 ? (
            <div className="text-center py-12 text-steel text-sm">No loads found for this carrier.</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 text-steel bg-lane dark:bg-gray-800">
                      <th className="text-left py-3 px-2 font-semibold">#</th>
                      <th className="text-left py-3 px-2 font-semibold">Load #</th>
                      <th className="text-left py-3 px-2 font-semibold">Broker</th>
                      <th className="text-left py-3 px-2 font-semibold">Pickup Date</th>
                      <th className="text-left py-3 px-2 font-semibold">Route</th>
                      <th className="text-right py-3 px-2 font-semibold">Gross Amount</th>
                      <th className="text-left py-3 px-2 font-semibold">Invoice #</th>
                      <th className="text-center py-3 px-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrierLoads.map((load, idx) => (
                      <tr key={load.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/10 transition-colors">
                        <td className="py-3 px-2 text-steel">{idx + 1}</td>
                        <td className="py-3 px-2 font-bold text-ink">{load.loadNumber || '—'}</td>
                        <td className="py-3 px-2 text-ink font-medium">{load.brokerName || '—'}</td>
                        <td className="py-3 px-2 text-steel">{formatDate(load.pickupDate)}</td>
                        <td className="py-3 px-2 text-steel">{load.route}</td>
                        <td className="py-3 px-2 text-right font-bold text-ink">{formatCurrency(load.grossAmount)}</td>
                        <td className="py-3 px-2 text-steel font-medium">{load.invoiceNumber}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            load.status === 'paid'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                              : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                          }`}>
                            {load.status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-lane dark:bg-gray-800">
                      <td colSpan={5} className="py-3 px-2 text-xs font-bold text-ink uppercase">Total ({carrierLoads.length} loads)</td>
                      <td className="py-3 px-2 text-right text-sm font-extrabold text-ink">
                        {formatCurrency(carrierLoads.reduce((s, l) => s + l.grossAmount, 0))}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-2">
                {carrierLoads.map((load, idx) => (
                  <div key={load.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink text-sm">{load.loadNumber || '—'}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        load.status === 'paid'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                          : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                      }`}>
                        {load.status === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-1 text-xs">
                      <div><span className="text-steel">Broker: </span><span className="text-ink font-medium">{load.brokerName || '—'}</span></div>
                      <div className="text-right"><span className="text-steel">Amount: </span><span className="text-ink font-bold">{formatCurrency(load.grossAmount)}</span></div>
                      <div><span className="text-steel">Date: </span><span className="text-road">{formatDate(load.pickupDate)}</span></div>
                      <div className="text-right"><span className="text-steel">Inv: </span><span className="text-road">{load.invoiceNumber}</span></div>
                    </div>
                    <div className="text-xs text-steel truncate">{load.route}</div>
                  </div>
                ))}
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-sm">
                  <span className="font-bold text-ink">Total ({carrierLoads.length} loads)</span>
                  <span className="font-extrabold text-ink">{formatCurrency(carrierLoads.reduce((s, l) => s + l.grossAmount, 0))}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Invoice Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-panel border border-gray-200 dark:border-gray-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
          <h2 className="text-sm font-semibold text-ink">Invoice History ({sorted.length})</h2>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-lane dark:bg-gray-800 text-ink dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal placeholder:text-steel/60"
            />
          </div>
        </div>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-steel bg-lane dark:bg-gray-800">
                  <th className="text-left py-3 px-2 font-semibold cursor-pointer select-none" onClick={() => toggleSort('created_at')}>
                    <span className="flex items-center gap-1">Date <SortIcon field="created_at" /></span>
                  </th>
                  <th className="text-left py-3 px-2 font-semibold cursor-pointer select-none" onClick={() => toggleSort('invoice_number')}>
                    <span className="flex items-center gap-1">Invoice # <SortIcon field="invoice_number" /></span>
                  </th>
                  <th className="text-left py-3 px-2 font-semibold">Loads</th>
                  <th className="text-right py-3 px-2 font-semibold cursor-pointer select-none" onClick={() => toggleSort('total_gross_revenue')}>
                    <span className="flex items-center justify-end gap-1">Gross <SortIcon field="total_gross_revenue" /></span>
                  </th>
                  <th className="text-right py-3 px-2 font-semibold cursor-pointer select-none" onClick={() => toggleSort('dispatch_fee')}>
                    <span className="flex items-center justify-end gap-1">Fee <SortIcon field="dispatch_fee" /></span>
                  </th>
                  <th className="text-left py-3 px-2 font-semibold cursor-pointer select-none" onClick={() => toggleSort('carrier_name')}>
                    <span className="flex items-center gap-1">Carrier <SortIcon field="carrier_name" /></span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold cursor-pointer select-none" onClick={() => toggleSort('status')}>
                    <span className="flex items-center justify-center gap-1">Status <SortIcon field="status" /></span>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-steel">No invoices found.</td></tr>
                ) : (
                  sorted.map(inv => (
                    <Fragment key={inv.id}>
                      <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/40 dark:hover:bg-blue-950/10 transition-colors">
                        <td className="py-3 px-2 text-steel">{new Date(inv.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-2 font-semibold text-ink">{inv.invoice_number}</td>
                        <td className="py-3 px-2 text-steel">{inv.loadCount}</td>
                        <td className="py-3 px-2 text-right font-semibold text-ink">{formatCurrency(Number(inv.total_gross_revenue))}</td>
                        <td className="py-3 px-2 text-right font-semibold text-ink">
                           <div>{formatCurrency(Number(inv.dispatch_fee))}</div>
                           {inv.dispatch_percentage && (
                             <div className="text-[9px] text-steel/70 font-medium">@ {inv.dispatch_percentage}%</div>
                           )}
                         </td>
                        <td className="py-3 px-2 text-steel font-medium truncate max-w-[120px]">{inv.displayCarrier}</td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => handleStatusClick(inv)}
                            className={`inline-flex flex-col items-center px-2.5 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
                                : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-100 dark:hover:bg-red-950/50'
                            }`}
                          >
                            <span>{inv.status === 'paid' ? 'Paid' : 'Unpaid'}</span>
                            {pendingNotes[inv.id] !== undefined && inv.status !== 'paid' && (
                              <span className="text-[8px] text-amber-600 font-semibold mt-0.5">{formatCurrency(pendingNotes[inv.id])} pending</span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setExpandedInvoice(expandedInvoice === inv.id ? null : inv.id)}
                              className="p-1.5 text-steel hover:text-signal hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                              title="View loads"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => setPreviewInvoice(inv)}
                              className="p-1.5 text-steel hover:text-amberline hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors"
                              title="Preview invoice"
                            >
                              <FileText size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="p-1.5 text-steel hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedInvoice === inv.id && inv.invoice_loads?.length > 0 && (
                        <tr key={`${inv.id}-detail`}>
                          <td colSpan={8} className="bg-lane dark:bg-gray-800 p-4">
                            <div className="text-[10px] font-bold text-steel uppercase tracking-widest mb-2">Loads for {inv.invoice_number}</div>
                            <div className="grid gap-2">
                              {inv.invoice_loads.map((load: any) => (
                                <div key={load.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs gap-1">
                                  <span className="font-semibold text-ink">{load.load_number}</span>
                                  <span className="text-steel">{load.broker_name}</span>
                                  <span className="text-steel">{load.origin_city}, {load.origin_state} → {load.destination_city}, {load.destination_state}</span>
                                  <span className="font-bold text-ink">{formatCurrency(Number(load.gross_amount))}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Invoice Preview Modal — renders the REAL saved InvoiceTemplate */}
      <AnimatePresence>
        {previewInvoice && (() => {
          // Reconstruct exactly what was saved at print time
          // company_snapshot holds CompanySettings (templateId, dispatchPercentage, payment info etc.)
          // carrier_snapshot holds CarrierSettings (carrierName, mcNumber etc.)
          const companySnap: CompanySettings = (previewInvoice as any).company_snapshot ?? {};
          const carrierSnap: CarrierSettings = previewInvoice.carrier_snapshot ?? {};

          // Map snake_case DB loads → camelCase Load[]
          const loads: Load[] = (previewInvoice.invoice_loads || []).map((l: any) => ({
            id: l.id,
            loadNumber: l.load_number ?? '',
            brokerName: l.broker_name ?? '',
            pickupDate: l.pickup_date ?? '',
            grossAmount: Number(l.gross_amount) || 0,
            originCity: l.origin_city ?? '',
            originState: l.origin_state ?? '',
            destinationCity: l.destination_city ?? '',
            destinationState: l.destination_state ?? '',
          }));

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setPreviewInvoice(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                style={{ width: '100%', maxWidth: '860px', maxHeight: '92vh' }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ background: '#0d1f3c', borderBottom: '1px solid rgba(29,85,176,0.3)' }}>
                  <div>
                    <div className="font-bold text-white text-sm">{previewInvoice.invoice_number}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {previewInvoice.carrier_name || carrierSnap.carrierName || 'Unknown Carrier'}
                      {' · '}{new Date(previewInvoice.invoice_date).toLocaleDateString()}
                      {companySnap.templateId ? ` · ${companySnap.templateId.charAt(0).toUpperCase() + companySnap.templateId.slice(1)} Template` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => printInvoice(previewInvoice.invoice_number)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-80"
                      style={{ background: 'rgba(29,85,176,0.4)', border: '1px solid rgba(29,85,176,0.5)' }}
                    >
                      <Printer size={13} /> Reprint
                    </button>
                    <button
                      onClick={() => setPreviewInvoice(null)}
                      className="p-1.5 rounded-lg transition-all hover:bg-white/10"
                      style={{ color: 'rgba(255,255,255,0.5)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Actual Invoice Template — same as what was printed */}
                <div className="overflow-y-auto flex-1" style={{ background: '#f1f5f9' }}>
                  <div className="p-6">
                    <InvoiceTemplate
                      loads={loads}
                      company={companySnap}
                      carrier={carrierSnap}
                      invoiceNumber={previewInvoice.invoice_number}
                      invoiceDate={previewInvoice.invoice_date}
                      weekLabel={(previewInvoice as any).week_label ?? ''}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
      {/* ── Payment Amount Modal ── */}
      <AnimatePresence>
        {payModalId && payModalInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={handlePayCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: '#0d1f3c', border: '1px solid rgba(29,85,176,0.35)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(29,85,176,0.25)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    <DollarSign size={18} style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">How Much Was Paid?</div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Invoice #{payModalInvoice.invoice_number} · {payModalInvoice.carrier_name || 'Carrier'}</div>
                  </div>
                </div>
                <button onClick={handlePayCancel} className="text-white/40 hover:text-white/80 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Invoice fee info */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(29,85,176,0.2)' }}>
                  <div className="text-xs text-white/50">
                    Invoice Amount (Dispatch Fee
                    {payModalInvoice.dispatch_percentage ? ` @ ${payModalInvoice.dispatch_percentage}%` : ''})
                  </div>
                  <span className="font-bold text-white text-sm">{formatCurrency(Number(payModalInvoice.dispatch_fee))}</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Amount Received ($)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter amount paid..."
                      value={payInput}
                      onChange={e => setPayInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePayConfirm()}
                      autoFocus
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-sm text-white font-medium focus:outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(29,85,176,0.4)' }}
                    />
                  </div>
                </div>

                {/* Live feedback */}
                {(() => {
                  const paid = parseFloat(payInput) || 0;
                  const fee = Number(payModalInvoice.dispatch_fee);
                  if (paid <= 0) return null;
                  if (paid >= fee) return (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
                      <CheckCircle size={12} />
                      Full payment — invoice will be marked <strong>Paid</strong>.
                    </div>
                  );
                  return (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d' }}>
                      <AlertCircle size={12} />
                      Partial payment. <strong>{formatCurrency(+(fee - paid).toFixed(2))}</strong> will remain as pending.
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-6 pb-5">
                <button
                  onClick={handlePayCancel}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayConfirm}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{
                    background: parseFloat(payInput) >= Number(payModalInvoice.dispatch_fee) && parseFloat(payInput) > 0
                      ? 'linear-gradient(135deg, #059669, #10b981)'
                      : parseFloat(payInput) > 0
                      ? 'linear-gradient(135deg, #b45309, #d97706)'
                      : 'linear-gradient(135deg, #1d55b0, #2563eb)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                  }}
                >
                  {parseFloat(payInput) >= Number(payModalInvoice.dispatch_fee) && parseFloat(payInput) > 0
                    ? 'Mark as Paid ✓'
                    : parseFloat(payInput) > 0
                    ? 'Save Partial Payment'
                    : 'Mark as Paid'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
