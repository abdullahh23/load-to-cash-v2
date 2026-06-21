import { useState, useMemo, Fragment } from 'react';
import { Search, ChevronUp, ChevronDown, Eye, Trash2, ArrowUpDown, TrendingUp, TrendingDown, X, ChevronRight, Truck, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate } from '../lib/calc';
import type { CarrierHistory } from '../types';

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

  // Compute carrier stats
  const carrierStats = useMemo(() => {
    const map = new Map<string, CarrierHistory>();
    for (const inv of invoices) {
      const name = inv.carrier_name || (inv.carrier_snapshot as any)?.carrierName || 'Unknown';
      const existing = map.get(name) || { carrierName: name, totalLoads: 0, totalInvoices: 0, totalGrossAmount: 0, totalDispatchFees: 0, totalPaid: 0, totalUnpaid: 0 };
      existing.totalInvoices += 1;
      existing.totalLoads += inv.invoice_loads?.length || 0;
      existing.totalGrossAmount += Number(inv.total_gross_revenue) || 0;
      existing.totalDispatchFees += Number(inv.dispatch_fee) || 0;
      if (inv.status === 'paid') existing.totalPaid += Number(inv.dispatch_fee) || 0;
      else existing.totalUnpaid += Number(inv.dispatch_fee) || 0;
      map.set(name, existing);
    }
    return Array.from(map.values());
  }, [invoices]);

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
        <div className="bg-white border border-steel/10 rounded-2xl p-5 shadow-card">
          <div className="text-xxs font-bold text-steel uppercase tracking-widest mb-1.5">Total Invoices</div>
          <div className="text-3xl font-extrabold text-ink">{invoices.length}</div>
        </div>
        <div className="bg-white border border-steel/10 rounded-2xl p-5 shadow-card">
          <div className="text-xxs font-bold text-steel uppercase tracking-widest mb-1.5">Carriers</div>
          <div className="text-3xl font-extrabold text-ink">{carrierStats.length}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-600" />
            <div className="text-xxs font-bold text-emerald-700 uppercase tracking-widest">Total Paid</div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 mt-1.5">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-1.5">
            <TrendingDown size={14} className="text-red-600" />
            <div className="text-xxs font-bold text-red-700 uppercase tracking-widest">Total Unpaid</div>
          </div>
          <div className="text-3xl font-extrabold text-red-700 mt-1.5">{formatCurrency(totalUnpaid)}</div>
        </div>
      </div>

      {/* Carrier Breakdown — Clickable Cards */}
      {carrierStats.length > 0 && (
        <div className="bg-white rounded-2xl shadow-panel border border-steel/10 p-6">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider mb-4 border-b border-steel/5 pb-3">
            Carrier Breakdown
            <span className="text-steel font-medium normal-case ml-2 text-xs">— click a carrier to view all loads</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {carrierStats.map(c => (
              <button
                key={c.carrierName}
                onClick={() => setSelectedCarrier(selectedCarrier === c.carrierName ? null : c.carrierName)}
                className={`text-left border rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                  selectedCarrier === c.carrierName
                    ? 'border-signal bg-signal/5 shadow-md ring-2 ring-signal/20'
                    : 'border-steel/10 hover:border-signal/40 hover:shadow-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-ink text-sm truncate flex items-center gap-2">
                    <Truck size={14} className={selectedCarrier === c.carrierName ? 'text-signal' : 'text-steel'} />
                    {c.carrierName}
                  </div>
                  <ChevronRight size={14} className={`transition-transform duration-200 ${selectedCarrier === c.carrierName ? 'rotate-90 text-signal' : 'text-steel/40'}`} />
                </div>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-steel">Invoices:</span><span className="font-semibold text-ink">{c.totalInvoices}</span>
                  <span className="text-steel">Loads:</span><span className="font-semibold text-ink">{c.totalLoads}</span>
                  <span className="text-steel">Gross:</span><span className="font-semibold text-ink">{formatCurrency(c.totalGrossAmount)}</span>
                  <span className="text-steel">Fees:</span><span className="font-semibold text-ink">{formatCurrency(c.totalDispatchFees)}</span>
                  <span className="text-emerald-600">Paid:</span><span className="font-semibold text-emerald-700">{formatCurrency(c.totalPaid)}</span>
                  <span className="text-red-500">Unpaid:</span><span className="font-semibold text-red-600">{formatCurrency(c.totalUnpaid)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Carrier — All Loads Table */}
      {selectedCarrier && selectedStats && (
        <div className="bg-white rounded-2xl shadow-panel border-2 border-signal/20 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-steel/5 pb-4">
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
              className="p-2 text-steel hover:text-ink hover:bg-lane rounded-xl transition-all"
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
                    <tr className="border-b border-steel/10 text-steel">
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
                      <tr key={load.id} className="border-b border-steel/5 hover:bg-lane/50 transition-colors">
                        <td className="py-3 px-2 text-steel">{idx + 1}</td>
                        <td className="py-3 px-2 font-bold text-ink">{load.loadNumber || '—'}</td>
                        <td className="py-3 px-2 text-ink font-medium">{load.brokerName || '—'}</td>
                        <td className="py-3 px-2 text-steel">{formatDate(load.pickupDate)}</td>
                        <td className="py-3 px-2 text-steel">{load.route}</td>
                        <td className="py-3 px-2 text-right font-bold text-ink">{formatCurrency(load.grossAmount)}</td>
                        <td className="py-3 px-2 text-steel font-medium">{load.invoiceNumber}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            load.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}>
                            {load.status === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-steel/15 bg-lane/30">
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
                  <div key={load.id} className="border border-steel/10 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink text-sm">{load.loadNumber || '—'}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        load.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-600 border border-red-200'
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
                <div className="border-t-2 border-steel/15 pt-3 flex justify-between text-sm">
                  <span className="font-bold text-ink">Total ({carrierLoads.length} loads)</span>
                  <span className="font-extrabold text-ink">{formatCurrency(carrierLoads.reduce((s, l) => s + l.grossAmount, 0))}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Invoice Table */}
      <div className="bg-white rounded-2xl shadow-panel border border-steel/10 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-steel/5 pb-4">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Invoice History ({sorted.length})</h2>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-steel/15 rounded-xl bg-lane focus:outline-none focus:ring-2 focus:ring-signal/20 focus:border-signal/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-steel/10 text-steel">
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
                    <tr className="border-b border-steel/5 hover:bg-lane/50 transition-colors">
                      <td className="py-3 px-2 text-steel">{new Date(inv.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-2 font-semibold text-ink">{inv.invoice_number}</td>
                      <td className="py-3 px-2 text-steel">{inv.loadCount}</td>
                      <td className="py-3 px-2 text-right font-semibold text-ink">{formatCurrency(Number(inv.total_gross_revenue))}</td>
                      <td className="py-3 px-2 text-right font-semibold text-ink">{formatCurrency(Number(inv.dispatch_fee))}</td>
                      <td className="py-3 px-2 text-steel font-medium truncate max-w-[120px]">{inv.displayCarrier}</td>
                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => onToggleStatus(inv.id, inv.status === 'paid' ? 'unpaid' : 'paid')}
                          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                          }`}
                        >
                          {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setExpandedInvoice(expandedInvoice === inv.id ? null : inv.id)}
                            className="p-1.5 text-steel hover:text-signal hover:bg-signal/5 rounded-lg transition-all"
                            title="View loads"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            className="p-1.5 text-steel hover:text-amberline hover:bg-amberline/5 rounded-lg transition-all"
                            title="Preview invoice"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(inv.id)}
                            className="p-1.5 text-steel hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedInvoice === inv.id && inv.invoice_loads?.length > 0 && (
                      <tr key={`${inv.id}-detail`}>
                        <td colSpan={8} className="bg-lane/50 p-4">
                          <div className="text-[10px] font-bold text-steel uppercase tracking-widest mb-2">Loads for {inv.invoice_number}</div>
                          <div className="grid gap-2">
                            {inv.invoice_loads.map((load: any) => (
                              <div key={load.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-lg border border-steel/10 px-3 py-2 text-xs gap-1">
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

      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {previewInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-ink border-b border-steel/10 shrink-0">
                <div>
                  <h3 className="text-white font-bold text-sm">{previewInvoice.invoice_number}</h3>
                  <p className="text-steel text-xs mt-0.5">
                    {previewInvoice.carrier_name || (previewInvoice.carrier_snapshot as any)?.carrierName || 'Unknown Carrier'} · {new Date(previewInvoice.invoice_date).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => setPreviewInvoice(null)} className="p-2 text-steel hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* Invoice Content */}
              <div className="overflow-y-auto flex-1 bg-gray-100 p-6">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-steel/10" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
                  {/* Classic invoice layout matching the app's actual invoice */}
                  {/* Header */}
                  <div className="bg-slate-800 text-white p-6 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Truck size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="font-black text-lg">{(previewInvoice.carrier_snapshot as any)?.companyName || 'Your Company'}</div>
                        <div className="text-slate-300 text-xs">Dispatch Fee Invoice</div>
                      </div>
                    </div>
                    <div className="text-right text-sm space-y-1">
                      <div className="text-slate-300">Invoice # <span className="text-white font-bold">{previewInvoice.invoice_number}</span></div>
                      <div className="text-slate-300">Invoice Date <span className="text-white">{new Date(previewInvoice.invoice_date).toLocaleDateString()}</span></div>
                    </div>
                  </div>
                  <div className="h-1 bg-gradient-to-r from-signal to-transparent" />

                  {/* Body */}
                  <div className="p-6 space-y-6" style={{ color: '#0f172a' }}>
                    {/* From / Bill To */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-steel/15 rounded-lg p-4">
                        <div className="text-[9px] font-bold text-steel uppercase tracking-widest mb-2">FROM</div>
                        <div className="font-bold text-ink">{(previewInvoice.carrier_snapshot as any)?.companyName || 'Your Company'}</div>
                        <div className="text-steel text-xs">Dispatch Services</div>
                        {(previewInvoice.carrier_snapshot as any)?.email && <div className="text-steel text-xs">{(previewInvoice.carrier_snapshot as any).email}</div>}
                      </div>
                      <div className="border border-steel/15 rounded-lg p-4">
                        <div className="text-[9px] font-bold text-steel uppercase tracking-widest mb-2">BILL TO</div>
                        <div className="font-bold text-ink">{previewInvoice.carrier_name || (previewInvoice.carrier_snapshot as any)?.carrierName || 'Carrier'}</div>
                        {(previewInvoice.carrier_snapshot as any)?.carrierEmail && <div className="text-steel text-xs">{(previewInvoice.carrier_snapshot as any).carrierEmail}</div>}
                        {(previewInvoice.carrier_snapshot as any)?.mcNumber && <div className="text-steel text-xs">MC: {(previewInvoice.carrier_snapshot as any).mcNumber}</div>}
                      </div>
                    </div>

                    {/* Loads Table */}
                    <div>
                      <div className="text-xs font-bold text-ink uppercase tracking-wider mb-2">WEEKLY LOAD SUMMARY — {new Date(previewInvoice.invoice_date).toLocaleDateString()}</div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-800 text-white">
                            <th className="text-left p-2">#</th>
                            <th className="text-left p-2">Load #</th>
                            <th className="text-left p-2">Broker</th>
                            <th className="text-left p-2">Route</th>
                            <th className="text-right p-2">Gross Amount</th>
                          </tr>
                        </thead>
                        <tbody style={{ color: '#0f172a' }}>
                          {(previewInvoice.invoice_loads || []).map((load: any, idx: number) => (
                            <tr key={load.id} style={{ backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
                              <td className="p-2" style={{ color: '#64748b' }}>{idx + 1}</td>
                              <td className="p-2 font-bold" style={{ color: '#0f172a' }}>{load.load_number || '—'}</td>
                              <td className="p-2" style={{ color: '#0f172a' }}>{load.broker_name || '—'}</td>
                              <td className="p-2" style={{ color: '#64748b' }}>
                                {load.origin_city && load.destination_city
                                  ? `${load.origin_city}, ${load.origin_state} → ${load.destination_city}, ${load.destination_state}`
                                  : '—'}
                              </td>
                              <td className="p-2 text-right font-bold" style={{ color: '#0f172a' }}>{formatCurrency(Number(load.gross_amount))}</td>
                            </tr>
                          ))}
                          <tr style={{ backgroundColor: '#f1f5f9' }}>
                            <td colSpan={4} className="p-2 text-right font-bold uppercase text-xs" style={{ color: '#0f172a' }}>Total Weekly Gross</td>
                            <td className="p-2 text-right font-black" style={{ color: '#0f172a' }}>{formatCurrency(Number(previewInvoice.total_gross_revenue))}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Invoice Summary */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-ink uppercase tracking-wider mb-3">INVOICE SUMMARY</div>
                      <div className="flex justify-between text-sm text-steel">
                        <span>Total Weekly Gross ({previewInvoice.invoice_loads?.length || 0} Load{previewInvoice.invoice_loads?.length !== 1 ? 's' : ''})</span>
                        <span>{formatCurrency(Number(previewInvoice.total_gross_revenue))}</span>
                      </div>
                      <div className="flex justify-between text-sm text-steel">
                        <span>Dispatch Fee{(() => { const pct = previewInvoice.dispatch_percentage ?? (Number(previewInvoice.total_gross_revenue) > 0 ? Math.round((Number(previewInvoice.dispatch_fee) / Number(previewInvoice.total_gross_revenue)) * 100) : null); return pct != null ? ` @ ${pct}%` : ''; })()}</span>
                        <span>{formatCurrency(Number(previewInvoice.dispatch_fee))}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-800 text-white rounded-lg px-4 py-3 mt-2">
                        <span className="font-black uppercase">TOTAL DUE</span>
                        <span className="font-black text-amberline text-lg">{formatCurrency(Number(previewInvoice.dispatch_fee))}</span>
                      </div>
                    </div>

                    {/* Payment info */}
                    {(previewInvoice.carrier_snapshot as any)?.paymentMethod && (
                      <div className="border border-steel/15 rounded-lg p-4">
                        <div className="text-[9px] font-bold text-steel uppercase tracking-widest mb-2">PAYMENT OPTIONS</div>
                        <div className="text-xs text-ink">{(previewInvoice.carrier_snapshot as any).paymentMethod}: <span className="font-bold">{(previewInvoice.carrier_snapshot as any).paymentDetails}</span></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
