import { Printer, LayoutTemplate, Download, CalendarClock } from 'lucide-react';
import { downloadInvoicePDF } from '../lib/pdf';
import { InvoiceTemplate } from '../templates/InvoiceTemplate';
import type { Load, CompanySettings, CarrierSettings } from '../types';

interface InvoicePageProps {
  loads: Load[];
  company: CompanySettings;
  carrier: CarrierSettings;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  onDueDateChange: (date: string) => void;
  weekLabel: string;
  onPrint: () => void;
  onTemplateChange?: (templateId: string) => void;
  pendingAmount?: number;
}

export function InvoicePage({
  loads,
  company,
  carrier,
  invoiceNumber,
  invoiceDate,
  dueDate,
  onDueDateChange,
  weekLabel,
  onPrint,
  onTemplateChange,
  pendingAmount = 0,
}: InvoicePageProps) {
  const currentTemplate = company.templateId || 'classic';

  const templates = [
    { id: 'classic', name: 'Corporate Classic' },
    { id: 'modern', name: 'Modern Minimalist' },
    { id: 'cargo', name: 'Executive Cargo' },
    { id: 'teal', name: 'Emerald Steel' },
  ];

  const handleDownload = async () => {
    downloadInvoicePDF(invoiceNumber);
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg shadow-card no-print">
        <div>
          <h1 className="text-xl font-bold text-ink">Invoice Statements</h1>
          <p className="text-steel text-xs mt-0.5">Customize, preview, and export invoices.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Template Switcher */}
          <div className="flex items-center gap-2 bg-lane dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg">
            <LayoutTemplate size={16} className="text-signal" />
            <select
              value={currentTemplate}
              onChange={e => onTemplateChange?.(e.target.value)}
              className="bg-transparent text-xs font-semibold text-ink dark:text-gray-200 focus:outline-none cursor-pointer pr-2"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date Picker */}
          <div className="flex items-center gap-2 bg-lane dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg">
            <CalendarClock size={16} className="text-signal shrink-0" />
            <span className="text-[10px] font-semibold text-steel whitespace-nowrap">Due:</span>
            <input
              type="date"
              value={dueDate}
              onChange={e => onDueDateChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-ink dark:text-gray-200 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Print Button */}
          <button
            onClick={onPrint}
            className="flex items-center gap-2 bg-signal text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-signal/90 shadow-sm transition-colors text-xs"
          >
            <Printer size={15} />
            Print / Save PDF
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-ink text-white rounded-xl font-semibold text-sm hover:bg-road transition-all shadow-sm no-print"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Container — mobile: horizontal scroll inside card, not whole page */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-panel border border-gray-200 dark:border-gray-800">
        <div
          className="overflow-x-auto"
          style={{ WebkitOverflowScrolling: 'touch' as any }}
        >
          <div style={{ minWidth: '820px', display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <div className="shadow-lg border border-gray-200 dark:border-gray-700 rounded-sm bg-white overflow-hidden" style={{ width: '820px' }}>
              <InvoiceTemplate
                loads={loads}
                company={company}
                carrier={carrier}
                invoiceNumber={invoiceNumber}
                invoiceDate={invoiceDate}
                dueDate={dueDate}
                weekLabel={weekLabel}
                pendingAmount={pendingAmount}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
