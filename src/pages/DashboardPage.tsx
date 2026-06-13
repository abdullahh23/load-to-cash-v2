import { CheckCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { UploadZone } from '../components/UploadZone';
import { LoadTable } from '../components/LoadTable';
import { TotalsBar } from '../components/TotalsBar';
import { ManualLoadModal } from '../components/loads/ManualLoadModal';
import type { Load, CompanySettings, CarrierSettings } from '../types';
import { calcTotals } from '../lib/calc';
import { useState } from 'react';

interface DashboardPageProps {
  loads: Load[];
  company: CompanySettings;
  carrier: CarrierSettings;
  onLoadExtracted: (load: Load) => void | Promise<void>;
  onManualLoad: (load: Omit<Load, 'id'>) => void | Promise<void>;
  onRemoveLoad: (id: string) => void;
  onClearLoads: () => void;
}

export function DashboardPage({
  loads,
  company,
  carrier,
  onLoadExtracted,
  onManualLoad,
  onRemoveLoad,
  onClearLoads,
}: DashboardPageProps) {
  const { totalGrossRevenue, dispatchFee } = calcTotals(loads, company.dispatchPercentage);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

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
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-ink">Weekly Loads</h1>
        <p className="text-steel text-sm mt-1">Upload rate confirmations to auto-extract and add loads.</p>
      </motion.div>

      {!company.companyName && (
        <div className="bg-amberline/10 border border-amberline/30 text-amberline rounded-xl px-4 py-3 text-sm">
          ⚠️ Complete your company settings before exporting invoices.
        </div>
      )}

      {!carrier.carrierName && (
        <div className="bg-amberline/10 border border-amberline/30 text-amberline rounded-xl px-4 py-3 text-sm">
          ⚠️ Carrier information is not set. Go to Settings to add carrier details.
        </div>
      )}

      {lastAdded && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-signal/10 border border-signal/30 text-signal rounded-xl px-4 py-3 text-sm font-medium"
        >
          <CheckCircle size={16} />
          <span>Load "{lastAdded}" added successfully!</span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl shadow-panel p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink">Upload Rate Confirmation</h2>
          <button
            onClick={() => setManualOpen(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-signal hover:bg-signal/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Manual Load Entry
          </button>
        </div>
        <UploadZone onLoadExtracted={handleExtracted} />
      </motion.div>

      <TotalsBar
        totalGrossRevenue={totalGrossRevenue}
        dispatchFee={dispatchFee}
        dispatchPercentage={company.dispatchPercentage}
        loadCount={loads.length}
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-panel p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-ink">Loads ({loads.length})</h2>
          {loads.length > 0 && (
            <button
              onClick={() => { if (confirm('Clear all loads?')) onClearLoads(); }}
              className="text-xs text-steel hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
        <LoadTable loads={loads} onRemove={onRemoveLoad} />
      </motion.div>

      <ManualLoadModal open={manualOpen} onClose={() => setManualOpen(false)} onSubmit={handleManual} />
    </div>
  );
}
