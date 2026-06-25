import { useMemo, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppLoads, useAppSettings } from '../contexts/DataContext';
import { InvoicePage } from './InvoicePage';
import { generateInvoiceNumber, getCurrentWeekLabel } from '../lib/calc';
import { saveInvoice } from '../lib/invoices';
import { printInvoice, downloadInvoicePDF } from '../lib/pdf';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, DollarSign, X } from 'lucide-react';

export function InvoiceRoute() {
  const { user } = useAuth();
  const { loads } = useAppLoads();
  const { company, carrier, saveCompany } = useAppSettings();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingSaveResolve, setPendingSaveResolve] = useState<((v: boolean) => void) | null>(null);
  // Pending amount state
  const [pendingAmount, setPendingAmount] = useState<number>(0);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingInput, setPendingInput] = useState('');
  // After pending modal resolves, perform the actual save+print
  const [pendingModalResolve, setPendingModalResolve] = useState<((val: number) => void) | null>(null);

  const invoiceNumber = useMemo(() => generateInvoiceNumber(), []);
  const invoiceDate = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const weekLabel = useMemo(() => getCurrentWeekLabel(), []);

  // Ask user to confirm save via in-app modal (no native confirm)
  const askSaveConfirm = (): Promise<boolean> =>
    new Promise(resolve => {
      setPendingSaveResolve(() => resolve);
      setShowSaveConfirm(true);
    });

  const handleSaveYes = () => { setShowSaveConfirm(false); pendingSaveResolve?.(true);  setPendingSaveResolve(null); };
  const handleSaveNo  = () => { setShowSaveConfirm(false); pendingSaveResolve?.(false); setPendingSaveResolve(null); };

  // Ask user for pending amount, then save + print
  const handlePrint = async () => {
    // Show pending amount modal first
    const pending = await new Promise<number>(resolve => {
      setPendingInput('');
      setPendingModalResolve(() => resolve);
      setShowPendingModal(true);
    });

    // flushSync forces React to immediately re-render InvoiceTemplate
    // with the new pendingAmount BEFORE printInvoice() captures outerHTML.
    // Without this, the print window shows $0 because React batches the update.
    flushSync(() => {
      setPendingAmount(pending);
    });

    if (user && loads.length > 0) {
      const shouldSave = await askSaveConfirm();
      if (shouldSave) {
        setSaveStatus('saving');
        try {
          await saveInvoice(user.id, loads, company, carrier, invoiceNumber, invoiceDate, weekLabel);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 4000);
        } catch {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 4000);
        }
      }
    }
    // Download PDF directly — no print dialog, no Windows Save popup.
    // File saves automatically as INV-xxx.pdf to the Downloads folder.
    downloadInvoicePDF(invoiceNumber);
  };

  const handlePendingConfirm = () => {
    const val = parseFloat(pendingInput) || 0;
    setShowPendingModal(false);
    if (pendingModalResolve) pendingModalResolve(val);
    setPendingModalResolve(null);
  };

  const handlePendingSkip = () => {
    setShowPendingModal(false);
    if (pendingModalResolve) pendingModalResolve(0);
    setPendingModalResolve(null);
  };

  const handleTemplateChange = async (templateId: string) => {
    await saveCompany({ ...company, templateId });
  };

  return (
    <>
      <InvoicePage
        loads={loads}
        company={company}
        carrier={carrier}
        invoiceNumber={invoiceNumber}
        invoiceDate={invoiceDate}
        dueDate={dueDate}
        onDueDateChange={setDueDate}
        weekLabel={weekLabel}
        onPrint={handlePrint}
        onTemplateChange={handleTemplateChange}
        pendingAmount={pendingAmount}
      />

      {/* ── Save to History Confirmation Modal ── */}
      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 no-print"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: '#0d1f3c', border: '1px solid rgba(29,85,176,0.35)' }}
            >
              <div className="px-6 py-5">
                <div className="font-bold text-white text-base mb-1">Save to Carrier History?</div>
                <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  Save this invoice and <strong className="text-white">{loads.length} load{loads.length !== 1 ? 's' : ''}</strong> to{' '}
                  <strong className="text-white">{carrier.carrierName || 'carrier'}</strong> history so you can track them later.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleSaveNo}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                    style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Print Only
                  </button>
                  <button onClick={handleSaveYes}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #1d55b0, #2563eb)', boxShadow: '0 4px 16px rgba(29,85,176,0.4)' }}>
                    Save & Print ✓
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pending Amount Modal ── */}
      <AnimatePresence>
        {showPendingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 no-print"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={handlePendingSkip}
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
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(29,85,176,0.25)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <AlertCircle size={18} style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Any Pending Amount?</div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>For {carrier.carrierName || 'this carrier'}</div>
                  </div>
                </div>
                <button onClick={handlePendingSkip} className="text-white/40 hover:text-white/80 transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-6 py-5 space-y-4">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                  Does <strong className="text-white">{carrier.carrierName || 'this carrier'}</strong> have any previous unpaid balance that should appear on this invoice?
                </p>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Pending Amount ($)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00 — leave empty if none"
                      value={pendingInput}
                      onChange={e => setPendingInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePendingConfirm()}
                      autoFocus
                      className="w-full pl-8 pr-4 py-3 rounded-xl text-sm text-white font-medium focus:outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(29,85,176,0.4)' }}
                    />
                  </div>
                </div>

                {parseFloat(pendingInput) > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d' }}>
                    <AlertCircle size={12} />
                    ${parseFloat(pendingInput).toFixed(2)} will be added to the invoice subtotal
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex items-center gap-3 px-6 pb-5">
                <button
                  onClick={handlePendingSkip}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  No Pending — Skip
                </button>
                <button
                  onClick={handlePendingConfirm}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1d55b0, #2563eb)', boxShadow: '0 4px 16px rgba(29,85,176,0.4)' }}
                >
                  {parseFloat(pendingInput) > 0 ? `Add $${parseFloat(pendingInput).toFixed(2)} & Continue` : 'Continue Without Pending'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Confirmation Toast */}
      {saveStatus !== 'idle' && (
        <div className="fixed bottom-6 right-6 z-50 no-print animate-fade-in">
          {saveStatus === 'saving' && (
            <div className="bg-ink text-white px-5 py-3 rounded-xl shadow-panel flex items-center gap-3 text-sm font-medium">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving to {carrier.carrierName || 'carrier'} history...
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-panel flex items-center gap-3 text-sm font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              {loads.length} load(s) saved to {carrier.carrierName || 'carrier'} history!
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="bg-red-600 text-white px-5 py-3 rounded-xl shadow-panel flex items-center gap-3 text-sm font-medium">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              Failed to save — check console for details
            </div>
          )}
        </div>
      )}
    </>
  );
}
