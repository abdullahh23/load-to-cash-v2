import { CheckCircle, Plus, AlertTriangle, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { UploadZone } from '../components/UploadZone';
import { LoadTable } from '../components/LoadTable';
import { TotalsBar } from '../components/TotalsBar';
import { ManualLoadModal } from '../components/loads/ManualLoadModal';
import type { Load, CompanySettings, CarrierSettings } from '../types';
import type { Profile } from '../lib/supabase';
import { calcTotals } from '../lib/calc';
import { useState } from 'react';

interface DashboardPageProps {
  loads: Load[];
  company: CompanySettings;
  carrier: CarrierSettings;
  profile: Profile | null;
  canUpload: boolean;
  onLoadExtracted: (load: Load) => void | Promise<void>;
  onManualLoad: (load: Omit<Load, 'id'>) => void | Promise<void>;
  onRemoveLoad: (id: string) => void;
  onClearLoads: () => void;
}

export function DashboardPage({
  loads,
  company,
  carrier,
  profile,
  canUpload,
  onLoadExtracted,
  onManualLoad,
  onRemoveLoad,
  onClearLoads,
}: DashboardPageProps) {
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, company.dispatchPercentage);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const isPending = profile?.status === 'pending';
  const isSuspended = profile?.status === 'suspended';
  const limit = profile?.monthly_upload_limit ?? 50;
  const used = profile?.uploads_used ?? 0;
  const quotaExceeded = limit > 0 && used >= limit;

  let disabledMessage = '';
  if (isPending) disabledMessage = 'Your account is awaiting admin approval.';
  else if (isSuspended) disabledMessage = 'Your account has been suspended. Contact admin.';
  else if (quotaExceeded) disabledMessage = `Monthly upload limit reached (${used}/${limit}).`;

  const handleExtracted = async (load: Load) => {
    await onLoadExtracted(load);
    setLastAdded(load.loadNumber || 'Load');
    setTimeout(() => setLastAdded(null), 3000);
  };

  const handleManual = async (data: Omit<Load, 'id'>) => {
    await onManualLoad(data);
    setLastAdded(data.loadNumber || 'Load');
    setTimeout(() => setLastAdded(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight font-outfit">Weekly Loads</h1>
          <p className="text-steel text-sm mt-0.5 font-medium">Upload rate confirmations to auto-extract and add loads.</p>
        </div>
      </div>

      {/* Warnings & Alerts */}
      {!company.companyName && (
        <div className="bg-amberline/5 border border-amberline/20 text-amberline rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 shadow-card">
          <AlertTriangle size={16} className="shrink-0" />
          <span>Complete your company settings before exporting invoices.</span>
        </div>
      )}

      {!carrier.carrierName && (
        <div className="bg-amberline/5 border border-amberline/20 text-amberline rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 shadow-card">
          <AlertTriangle size={16} className="shrink-0" />
          <span>Carrier information is not set. Go to Settings to add carrier details.</span>
        </div>
      )}

      {/* Approval Status Banners */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 shadow-card">
          <Clock size={16} className="shrink-0 text-amber-600" />
          <span>Your account is awaiting admin approval. You cannot upload documents yet.</span>
        </div>
      )}

      {isSuspended && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 shadow-card">
          <Shield size={16} className="shrink-0 text-red-600" />
          <span>Your account has been suspended. Contact admin for assistance.</span>
        </div>
      )}

      {quotaExceeded && !isPending && !isSuspended && (
        <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded-2xl p-4 text-xs font-semibold flex items-center gap-2.5 shadow-card">
          <AlertTriangle size={16} className="shrink-0 text-orange-600" />
          <span>Monthly upload limit reached ({used}/{limit}). Contact admin to increase your limit.</span>
        </div>
      )}

      {lastAdded && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 bg-teal-50 border border-teal-200 text-teal-700 rounded-2xl p-4 text-xs font-semibold shadow-card"
        >
          <CheckCircle size={16} className="shrink-0 text-teal-600" />
          <span>Load "{lastAdded}" added successfully!</span>
        </motion.div>
      )}

      {/* Upload Block */}
      <div className="bg-white rounded-2xl shadow-panel border border-steel/10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-steel/5 pb-4">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Upload Rate Confirmation</h2>
          <button
            onClick={() => setManualOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-signal bg-signal/5 border border-signal/15 hover:bg-signal hover:text-white px-3.5 py-2 rounded-xl transition-all"
          >
            <Plus size={14} /> Manual Load Entry
          </button>
        </div>
        <UploadZone onLoadExtracted={handleExtracted} disabled={!canUpload} disabledMessage={disabledMessage} />
        {profile && profile.status === 'approved' && (
          <div className="text-xs text-steel font-medium text-right mt-1">
            Uploads this month: {used} / {limit === 0 ? '∞' : limit}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <TotalsBar
        totalGrossRevenue={totalGrossRevenue}
        dispatchFee={dispatchFee}
        dispatchPercentage={company.dispatchPercentage}
        loadCount={loads.length}
      />

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-panel border border-steel/10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-steel/5 pb-4">
          <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Weekly Load Log ({loads.length})</h2>
          {loads.length > 0 && (
            <button
              onClick={() => { if (confirm('Are you sure you want to clear all active loads?')) onClearLoads(); }}
              className="text-xs font-bold text-steel hover:text-red-500 transition-colors"
            >
              Clear Log
            </button>
          )}
        </div>
        <LoadTable loads={loads} onRemove={onRemoveLoad} />
      </div>

      {/* Manual Entry Modal */}
      <ManualLoadModal open={manualOpen} onClose={() => setManualOpen(false)} onSubmit={handleManual} />
    </div>
  );
}
